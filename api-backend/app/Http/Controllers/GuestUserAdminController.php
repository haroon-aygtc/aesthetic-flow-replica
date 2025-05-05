<?php

namespace App\Http\Controllers;

use App\Models\GuestUser;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GuestUserAdminController extends Controller
{
    /**
     * Display a listing of all guest users
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $guestUsers = GuestUser::with('widget:id,name')->latest()->get();

        $formattedUsers = $guestUsers->map(function ($user) {
            return [
                'id' => $user->id,
                'fullname' => $user->fullname,
                'email' => $user->email,
                'phone' => $user->phone,
                'session_id' => $user->session_id,
                'widget_id' => $user->widget_id,
                'widget_name' => $user->widget ? $user->widget->name : 'Unknown',
                'created_at' => $user->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedUsers
        ]);
    }

    /**
     * Display the specified guest user
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $guestUser = GuestUser::with('widget:id,name')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $guestUser
        ]);
    }

    /**
     * Remove the specified guest user from storage
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $guestUser = GuestUser::findOrFail($id);

        // Delete associated chat sessions and messages
        $chatSessions = ChatSession::where('session_id', $guestUser->session_id)->get();
        foreach ($chatSessions as $session) {
            ChatMessage::where('chat_session_id', $session->id)->delete();
            $session->delete();
        }

        $guestUser->delete();

        return response()->json([
            'success' => true,
            'message' => 'Guest user deleted successfully'
        ]);
    }

    /**
     * Get chat history for a guest user session
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getChatHistory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $sessionId = $request->input('session_id');
        $chatSession = ChatSession::where('session_id', $sessionId)->first();

        if (!$chatSession) {
            return response()->json([
                'success' => false,
                'message' => 'Chat session not found'
            ], 404);
        }

        $messages = ChatMessage::where('chat_session_id', $chatSession->id)
            ->orderBy('created_at', 'asc')
            ->get(['role', 'content', 'created_at']);

        return response()->json($messages);
    }
}
