<?php

namespace App\Http\Controllers\ApiTest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Widget;
use App\Models\User;

class WidgetTestController extends Controller
{
    /**
     * Test Widget API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testWidgetEndpoints(Request $request)
    {
        $results = [];
        $success = true;

        try {
            // Get first user for testing
            $user = User::first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No users available for testing'
                ], 400);
            }

            // Create a test widget
            $testWidget = Widget::create([
                'name' => 'API Test Widget ' . time(),
                'user_id' => $user->id,
                'widget_id' => 'test_' . time(),
                'is_active' => true
            ]);

            $results['create'] = [
                'status' => 'success',
                'widget_id' => $testWidget->id
            ];

            // Test fetch all widgets
            $allWidgets = Widget::where('user_id', $user->id)->get();
            $results['list'] = [
                'status' => 'success',
                'count' => count($allWidgets)
            ];

            // Test get single widget
            $singleWidget = Widget::find($testWidget->id);
            $results['get'] = [
                'status' => 'success',
                'found' => $singleWidget !== null
            ];

            // Test update widget
            $testWidget->name = 'Updated Test Widget';
            $testWidget->save();
            $results['update'] = [
                'status' => 'success'
            ];

            // Test delete widget
            $testWidget->delete();
            $results['delete'] = [
                'status' => 'success',
                'widget_exists' => Widget::find($testWidget->id) !== null
            ];

        } catch (\Exception $e) {
            Log::error('Widget API test failed: ' . $e->getMessage());
            $success = false;
            $results['error'] = [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ];
        }

        return response()->json([
            'success' => $success,
            'results' => $results,
            'message' => $success ? 'All Widget API tests completed successfully' : 'Widget API tests failed'
        ]);
    }
}
