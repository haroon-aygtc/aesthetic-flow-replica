<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\Widget;
use App\Models\GuestUser;
use App\Services\AIService;
use App\Services\KnowledgeAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use App\Models\AIModel;
use App\Models\ModelUsageLog;

class ChatController extends Controller
{
    protected $aiService;
    protected $knowledgeAIService;

    public function __construct(AIService $aiService, KnowledgeAIService $knowledgeAIService)
    {
        $this->aiService = $aiService;
        $this->knowledgeAIService = $knowledgeAIService;
    }
    /**
     * Initialize a new chat session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function initSession(Request $request)
    {
        $request->validate([
            'widget_id' => 'required|string|exists:widgets,widget_id',
            'visitor_id' => 'nullable|string',
            'metadata' => 'nullable|array',
            'guest_session_id' => 'nullable|string|exists:guest_users,session_id',
        ]);

        // Find the widget
        $widget = Widget::where('widget_id', $request->widget_id)
                       ->where('is_active', true)
                       ->firstOrFail();

        // Generate session ID and visitor ID if not provided
        $sessionId = Str::uuid()->toString();
        $visitorId = $request->visitor_id ?? ('visitor_' . Str::random(12));

        // Create a new session
        $session = new ChatSession();
        $session->widget_id = $widget->id;
        $session->session_id = $sessionId;
        $session->visitor_id = $visitorId;
        $session->metadata = $request->metadata;
        $session->last_activity_at = now();

        // If a guest session ID is provided, link it to this chat session
        if ($request->has('guest_session_id')) {
            $guestUser = GuestUser::where('session_id', $request->guest_session_id)->first();
            if ($guestUser) {
                $session->visitor_id = $guestUser->session_id;
                $session->metadata = array_merge($session->metadata ?? [], [
                    'guest_user_id' => $guestUser->id,
                    'guest_name' => $guestUser->fullname
                ]);
            }
        }

        $session->save();

        return response()->json([
            'session_id' => $sessionId,
            'visitor_id' => $session->visitor_id,
        ]);
    }

    /**
     * Send a chat message.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendMessage(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'chat_session_id' => 'required|exists:chat_sessions,id',
            'widget_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Get the widget
        $widget = Widget::where('widget_id', $request->widget_id)
                        ->where('is_active', true)
                        ->first();

        if (!$widget) {
            return response()->json(['error' => 'Widget not found or inactive'], 404);
        }

        // Get the chat session
        $chatSession = ChatSession::findOrFail($request->chat_session_id);

        // Get the AI model to use (from widget, or default)
        $aiModel = null;
        if ($widget->ai_model_id) {
            $aiModel = AIModel::find($widget->ai_model_id);
        }

        if (!$aiModel) {
            $aiModel = AIModel::where('is_default', true)->first();
        }

        if (!$aiModel) {
            return response()->json(['error' => 'No AI model configured'], 500);
        }

        // Get previous messages from this session
        $previousMessages = ChatMessage::where('chat_session_id', $chatSession->id)
                                    ->orderBy('created_at', 'asc')
                                    ->get();

        // Format messages for the AI service
        $formattedMessages = [];
        foreach ($previousMessages as $msg) {
            $formattedMessages[] = [
                'role' => $msg->role,
                'content' => $msg->content
            ];
        }

        // Add the new user message
        $formattedMessages[] = [
            'role' => 'user',
            'content' => $request->message
        ];

        // Save the user message to the database
        $userMessage = new ChatMessage();
        $userMessage->chat_session_id = $chatSession->id;
        $userMessage->role = 'user';
        $userMessage->content = $request->message;
        $userMessage->save();

        // Update session last active timestamp
        $chatSession->last_activity = now();
        $chatSession->save();

        // Prepare context for the AI service
        $context = [
            'chat_session_id' => $chatSession->id,
            'widget_id' => $widget->id,
            'user_id' => $chatSession->guest_user_id
        ];

        try {
            // Check if knowledge base is enabled for this widget
            $useKnowledgeBase = $widget->isKnowledgeBaseEnabled();
            $response = null;

            if ($useKnowledgeBase) {
                // Use the knowledge base-enhanced AI service
                $knowledgeAIService = app(App\Services\KnowledgeAIService::class);
                $response = $knowledgeAIService->processMessageWithKnowledge(
                    $formattedMessages,
                    $aiModel,
                    $widget->settings,
                    $context
                );
            } else {
                // Use the regular AI service
                $aiService = app(App\Services\AIService::class);
                $response = $aiService->processMessage(
                    $formattedMessages,
                    $aiModel,
                    $widget->settings,
                    $context
                );
            }

            // Save the AI's response to the database
            $assistantMessage = new ChatMessage();
            $assistantMessage->chat_session_id = $chatSession->id;
            $assistantMessage->role = 'assistant';
            $assistantMessage->content = $response['message'];
            $assistantMessage->metadata = $response['metadata'] ?? null;
            $assistantMessage->save();

            // Update the model usage log
            ModelUsageLog::create([
                'ai_model_id' => $aiModel->id,
                'chat_session_id' => $chatSession->id,
                'widget_id' => $widget->id,
                'tokens_used' => $response['usage']['total_tokens'] ?? 0,
                'prompt_tokens' => $response['usage']['prompt_tokens'] ?? 0,
                'completion_tokens' => $response['usage']['completion_tokens'] ?? 0,
                'metadata' => [
                    'user_message_id' => $userMessage->id,
                    'assistant_message_id' => $assistantMessage->id,
                    'knowledge_used' => $response['metadata']['knowledge_used'] ?? false
                ]
            ]);

            return response()->json([
                'id' => $assistantMessage->id,
                'content' => $assistantMessage->content,
                'metadata' => $assistantMessage->metadata,
                'created_at' => $assistantMessage->created_at
            ]);
        } catch (\Exception $e) {
            // Log the error
            \Log::error('AI Processing error: ' . $e->getMessage(), [
                'chat_session_id' => $chatSession->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return error response
            return response()->json([
                'error' => 'Failed to process your message',
                'message' => config('app.debug') ? $e->getMessage() : 'An internal error occurred'
            ], 500);
        }
    }

    /**
     * Get chat history for a session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getHistory(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string|exists:chat_sessions,session_id',
        ]);

        // Find the session
        $session = ChatSession::where('session_id', $request->session_id)->firstOrFail();

        // Get chat messages
        $chatMessages = ChatMessage::where('chat_session_id', $session->id)
                                    ->orderBy('created_at')
                                    ->get();

        return response()->json($chatMessages);
    }

    /**
     * List all chat sessions (admin only).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listSessions(Request $request)
    {
        // Check if the user is an admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $sessions = ChatSession::with('widget')->get();

        return response()->json($sessions);
    }
}
