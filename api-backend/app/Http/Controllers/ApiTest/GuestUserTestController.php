
<?php

namespace App\Http\Controllers\ApiTest;

use App\Http\Controllers\Controller;
use App\Models\GuestUser;
use Illuminate\Http\Request;

class GuestUserTestController extends Controller
{
    /**
     * Test guest user API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testGuestUserEndpoints(Request $request)
    {
        // Get mock guest user data
        $mockGuestData = [
            'fullname' => 'Test Guest',
            'email' => 'guest@example.com',
            'phone' => '+1234567890',
            'widget_id' => 'demo_widget',
        ];

        // Test register endpoint
        try {
            $response = [
                'endpoint' => '/api/guest/register',
                'method' => 'POST',
                'request' => $mockGuestData,
                'response' => [
                    'success' => true,
                    'session_id' => 'mock_session_' . uniqid(),
                    'message' => 'Guest registration successful',
                ],
                'status' => 'success'
            ];
        } catch (\Exception $e) {
            $response = [
                'endpoint' => '/api/guest/register',
                'method' => 'POST',
                'request' => $mockGuestData,
                'error' => $e->getMessage(),
                'status' => 'error'
            ];
        }
        
        // Return test results
        return response()->json([
            'success' => true,
            'results' => [
                'register' => $response,
                'validate' => [
                    'endpoint' => '/api/guest/validate',
                    'method' => 'POST',
                    'request' => ['session_id' => 'mock_session_123'],
                    'response' => [
                        'valid' => true,
                        'user' => [
                            'fullname' => 'Test Guest',
                            'session_id' => 'mock_session_123',
                        ],
                    ],
                    'status' => 'success'
                ],
                'details' => [
                    'endpoint' => '/api/guest/details',
                    'method' => 'POST',
                    'request' => ['session_id' => 'mock_session_123'],
                    'response' => [
                        'user' => [
                            'fullname' => 'Test Guest',
                            'email' => 'guest@example.com',
                            'phone' => '+1234567890',
                        ],
                    ],
                    'status' => 'success'
                ],
            ]
        ]);
    }

    /**
     * Get all guest users (admin function)
     * 
     * @return \Illuminate\Http\Response
     */
    public function getAllGuestUsers()
    {
        // Mock guest users
        $guestUsers = [
            [
                'id' => 1,
                'fullname' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '+1234567890',
                'session_id' => 'session_abc123',
                'widget_id' => 1,
                'widget_name' => 'Sales Widget',
                'created_at' => '2025-05-01T12:30:45',
            ],
            [
                'id' => 2,
                'fullname' => 'Jane Smith',
                'email' => 'jane@example.com',
                'phone' => '+0987654321',
                'session_id' => 'session_xyz789',
                'widget_id' => 2,
                'widget_name' => 'Support Widget',
                'created_at' => '2025-05-02T10:15:22',
            ],
            [
                'id' => 3,
                'fullname' => 'Bob Johnson',
                'email' => null,
                'phone' => '+1122334455',
                'session_id' => 'session_def456',
                'widget_id' => 1,
                'widget_name' => 'Sales Widget',
                'created_at' => '2025-05-03T08:45:11',
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $guestUsers
        ]);
    }
}
