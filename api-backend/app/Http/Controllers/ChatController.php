<?php
namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\Widget;
use App\Models\GuestUser;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatController extends Controller
{
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
        $request->validate([
            'session_id' => 'required|string|exists:chat_sessions,session_id',
            'message' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        // Find the session
        $session = ChatSession::where('session_id', $request->session_id)->firstOrFail();

        // Determine the role based on the session (assuming user is always 'user')
        $role = 'user';

        // Save the message
        $chatMessage = new ChatMessage();
        $chatMessage->chat_session_id = $session->id;
        $chatMessage->role = $role;
        $chatMessage->content = $request->message;
        $chatMessage->metadata = $request->metadata;
        $chatMessage->save();

        // Update the session's last activity timestamp
        $session->last_activity_at = now();
        $session->save();

        // Get AI response
        $aiService = new AIService();
        $response = $aiService->getAIResponse($session->widget_id, $request->message, $session->session_id);

        // Save the AI response
        $aiChatMessage = new ChatMessage();
        $aiChatMessage->chat_session_id = $session->id;
        $aiChatMessage->role = 'assistant';
        $aiChatMessage->content = $response;
        $aiChatMessage->save();

        return response()->json([
            'message' => $response,
        ]);
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
