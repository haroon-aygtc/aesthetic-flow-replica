<?php
namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\Widget;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Initialize a new chat session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function initSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|string|exists:widgets,widget_id',
            'visitor_id' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $widget = Widget::where('widget_id', $request->widget_id)
                       ->where('is_active', true)
                       ->firstOrFail();

        $chatSession = ChatSession::create([
            'widget_id' => $widget->id,
            'visitor_id' => $request->visitor_id ?? Str::random(16),
            'metadata' => $request->metadata,
            'last_activity_at' => now(),
        ]);

        // Create initial system message based on widget settings
        if (!empty($widget->settings['initialMessage'])) {
            ChatMessage::create([
                'chat_session_id' => $chatSession->id,
                'content' => $widget->settings['initialMessage'] ?? 'Hello! How can I help you today?',
                'role' => 'assistant',
            ]);
        }

        return response()->json([
            'session_id' => $chatSession->session_id,
            'visitor_id' => $chatSession->visitor_id,
            'created_at' => $chatSession->created_at,
        ]);
    }

    /**
     * Send a message and get an AI response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string|exists:chat_sessions,session_id',
            'message' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $chatSession = ChatSession::where('session_id', $request->session_id)->firstOrFail();
        $chatSession->update(['last_activity_at' => now()]);

        // Save user message
        $userMessage = ChatMessage::create([
            'chat_session_id' => $chatSession->id,
            'content' => $request->message,
            'role' => 'user',
            'metadata' => $request->metadata,
        ]);

        // Get conversation history
        $messages = $chatSession->messages()
                              ->orderBy('created_at')
                              ->get()
                              ->map(function($message) {
                                  return [
                                      'role' => $message->role,
                                      'content' => $message->content,
                                  ];
                              })
                              ->toArray();

        // Get widget and associated AI model
        $widget = $chatSession->widget;
        $aiModel = $widget->aiModel;

        // Process with AI service
        $response = $this->aiService->processMessage(
            $messages,
            $aiModel,
            $widget->settings
        );

        // Save assistant response
        $assistantMessage = ChatMessage::create([
            'chat_session_id' => $chatSession->id,
            'content' => $response['content'],
            'role' => 'assistant',
            'metadata' => $response['metadata'] ?? null,
        ]);

        return response()->json([
            'message' => $assistantMessage->content,
            'created_at' => $assistantMessage->created_at,
        ]);
    }

    /**
     * Get chat history for a session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getHistory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string|exists:chat_sessions,session_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $chatSession = ChatSession::where('session_id', $request->session_id)->firstOrFail();

        $messages = $chatSession->messages()
                              ->orderBy('created_at')
                              ->get()
                              ->map(function($message) {
                                  return [
                                      'id' => $message->id,
                                      'content' => $message->content,
                                      'role' => $message->role,
                                      'created_at' => $message->created_at,
                                  ];
                              });

        return response()->json($messages);
    }

    /**
     * List chat sessions for a widget (admin only).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function listSessions(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|integer|exists:widgets,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Ensure widget belongs to authenticated user
        $widget = Widget::where('id', $request->widget_id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        $sessions = ChatSession::where('widget_id', $widget->id)
                              ->orderBy('created_at', 'desc')
                              ->with('messages')
                              ->paginate(20);

        return response()->json($sessions);
    }
}
