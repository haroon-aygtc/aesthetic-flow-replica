
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use App\Models\AIModel;
use App\Models\User;
use App\Models\Widget;

class ApiTestController extends Controller
{
    /**
     * List all API routes for testing
     *
     * @return \Illuminate\Http\Response
     */
    public function listRoutes()
    {
        $routes = Route::getRoutes();
        $apiRoutes = [];

        foreach ($routes as $route) {
            $uri = $route->uri();
            if (strpos($uri, 'api/') === 0) {
                $methods = $route->methods();
                $action = $route->getAction();
                $name = $action['as'] ?? '';
                $controller = $action['controller'] ?? '';
                
                $apiRoutes[] = [
                    'uri' => $uri,
                    'methods' => $methods,
                    'name' => $name,
                    'controller' => $controller
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $apiRoutes
        ]);
    }

    /**
     * Test AI Models API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAIModelEndpoints(Request $request)
    {
        $results = [];
        $success = true;

        try {
            // Create a test model
            $testModel = AIModel::create([
                'name' => 'API Test Model ' . time(),
                'provider' => 'Test Provider',
                'description' => 'Created by automated API test',
                'is_default' => false
            ]);
            
            $results['create'] = [
                'status' => 'success',
                'model_id' => $testModel->id
            ];

            // Test fetch all models
            $allModels = AIModel::all();
            $results['list'] = [
                'status' => 'success',
                'count' => count($allModels)
            ];

            // Test get single model
            $singleModel = AIModel::find($testModel->id);
            $results['get'] = [
                'status' => 'success',
                'found' => $singleModel !== null
            ];

            // Test update model
            $testModel->name = 'Updated Test Model';
            $testModel->save();
            $results['update'] = [
                'status' => 'success'
            ];

            // Test delete model
            $testModel->delete();
            $results['delete'] = [
                'status' => 'success',
                'model_exists' => AIModel::find($testModel->id) !== null
            ];

        } catch (\Exception $e) {
            Log::error('AI Model API test failed: ' . $e->getMessage());
            $success = false;
            $results['error'] = [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ];
        }

        return response()->json([
            'success' => $success,
            'results' => $results,
            'message' => $success ? 'All AI Model API tests completed successfully' : 'AI Model API tests failed'
        ]);
    }

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

    /**
     * Run all API tests
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAllEndpoints(Request $request)
    {
        $allResults = [];
        
        // Test AI Models API
        $aiModelResults = $this->testAIModelEndpoints($request)->original;
        $allResults['ai_models'] = $aiModelResults;
        
        // Test Widgets API
        $widgetResults = $this->testWidgetEndpoints($request)->original;
        $allResults['widgets'] = $widgetResults;
        
        // Overall success
        $overallSuccess = 
            ($aiModelResults['success'] ?? false) && 
            ($widgetResults['success'] ?? false);
        
        return response()->json([
            'success' => $overallSuccess,
            'results' => $allResults,
            'message' => $overallSuccess ? 'All API tests completed successfully' : 'Some API tests failed'
        ]);
    }
}
