
<?php
namespace App\Http\Controllers;

use App\Models\GuestUser;
use App\Models\Widget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GuestUserController extends Controller
{
    /**
     * Register a guest user for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'fullname' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'widget_id' => 'required|string|exists:widgets,widget_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find the widget
        $widget = Widget::where('widget_id', $request->widget_id)
                       ->where('is_active', true)
                       ->firstOrFail();

        // Generate a unique session ID
        $sessionId = Str::uuid()->toString();

        // Create guest user
        $guestUser = GuestUser::create([
            'fullname' => $request->fullname,
            'email' => $request->email,
            'phone' => $request->phone,
            'session_id' => $sessionId,
            'widget_id' => $widget->id,
            'metadata' => [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referrer' => $request->header('referer'),
                'registration_time' => now()->toIso8601String(),
            ],
        ]);

        return response()->json([
            'success' => true,
            'session_id' => $sessionId,
            'message' => 'Guest registration successful',
        ]);
    }

    /**
     * Validate a guest session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string|exists:guest_users,session_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['valid' => false], 200);
        }

        $guestUser = GuestUser::where('session_id', $request->session_id)->first();
        
        if (!$guestUser) {
            return response()->json(['valid' => false], 200);
        }

        return response()->json([
            'valid' => true,
            'user' => [
                'fullname' => $guestUser->fullname,
                'session_id' => $guestUser->session_id,
            ],
        ]);
    }

    /**
     * Get guest user details.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDetails(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string|exists:guest_users,session_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guestUser = GuestUser::where('session_id', $request->session_id)->first();

        return response()->json([
            'user' => [
                'fullname' => $guestUser->fullname,
                'email' => $guestUser->email,
                'phone' => $guestUser->phone,
            ],
        ]);
    }
}
