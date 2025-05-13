<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\AIModel;
use App\Services\AI\ProviderRegistry;
use App\Services\AI\ProviderInterface;
use App\Http\Controllers\ApiTest\ApiTestRouteController;
use App\Http\Controllers\ApiTest\AIModelEndpointTestController;
use App\Http\Controllers\ApiTest\WidgetTestController;
use App\Http\Controllers\ApiTest\GuestUserTestController;
use App\Http\Controllers\ApiTest\ApiTestCoordinatorController;

class ApiTestController extends Controller
{
    /**
     * List all API routes for testing
     *
     * @return \Illuminate\Http\Response
     */
    public function listRoutes()
    {
        $routeController = new ApiTestRouteController();
        return $routeController->listRoutes();
    }

    /**
     * Test AI Models API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAIModelEndpoints(Request $request)
    {
        $controller = new AIModelEndpointTestController();
        return $controller->testAIModelEndpoints($request);
    }

    /**
     * Test Widget API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testWidgetEndpoints(Request $request)
    {
        $controller = new WidgetTestController();
        return $controller->testWidgetEndpoints($request);
    }

    /**
     * Test Guest User API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testGuestUserEndpoints(Request $request)
    {
        $controller = new GuestUserTestController();
        return $controller->testGuestUserEndpoints($request);
    }

    /**
     * Get all guest users
     *
     * @return \Illuminate\Http\Response
     */
    public function getAllGuestUsers()
    {
        $controller = new GuestUserTestController();
        return $controller->getAllGuestUsers();
    }

    /**
     * Run all API tests
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAllEndpoints(Request $request)
    {
        $controller = new ApiTestCoordinatorController();
        return $controller->testAllEndpoints($request);
    }

    /**
     * Test AI provider connection and fetch available models
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAIProvider(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'provider' => 'required|string',
            'api_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create a temporary AIModel with the provided data
            $tempModel = new AIModel([
                'name' => 'Temporary Model',
                'provider' => $request->input('provider'),
                'api_key' => $request->input('api_key'),
                'settings' => []
            ]);

            // Get the appropriate provider
            $provider = $this->getProviderForModel($tempModel);

            // Test the connection and discover models
            try {
                $result = $provider->testConnection($tempModel);
            } catch (\Exception $e) {
                // Specifically catch and format authentication errors
                if (stripos($e->getMessage(), 'authentication') !== false || 
                    stripos($e->getMessage(), 'auth') !== false ||
                    stripos($e->getMessage(), 'key') !== false ||
                    stripos($e->getMessage(), 'token') !== false ||
                    stripos($e->getMessage(), 'credential') !== false ||
                    stripos($e->getMessage(), 'unauthorized') !== false) {
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Authentication error: ' . $e->getMessage(),
                        'error_type' => 'authentication'
                    ], 401);
                }
                
                // Re-throw other exceptions
                throw $e;
            }

            if ($result['success']) {
                // If connection successful, try to discover models
                try {
                    $discoveryResult = $provider->discoverModels($tempModel);
                } catch (\Exception $e) {
                    // Handle discovery errors but don't fail completely if connection worked
                    Log::warning('Model discovery failed but connection was successful: ' . $e->getMessage());
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Connection successful but model discovery failed: ' . $e->getMessage(),
                        'data' => [
                            'models' => []
                        ]
                    ]);
                }
                
                if ($discoveryResult['success'] && isset($discoveryResult['models'])) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Connection successful and models discovered',
                        'data' => [
                            'models' => array_keys($discoveryResult['models']),
                            'model_info' => $discoveryResult['models']
                        ]
                    ]);
                }
                
                // If discovery failed but connection was successful
                return response()->json([
                    'success' => true,
                    'message' => 'Connection successful but no models discovered',
                    'data' => [
                        'models' => [],
                    ]
                ]);
            }
            
            // If connection failed
            // Check for specific error types in the result message
            $errorMessage = $result['message'] ?? 'Connection failed';
            $errorType = 'unknown';
            
            // Determine error type based on message content
            if (stripos($errorMessage, 'auth') !== false || 
                stripos($errorMessage, 'key') !== false ||
                stripos($errorMessage, 'token') !== false ||
                stripos($errorMessage, 'credential') !== false) {
                $errorType = 'authentication';
            } elseif (stripos($errorMessage, 'timeout') !== false ||
                      stripos($errorMessage, 'connect') !== false) {
                $errorType = 'connection';
            } elseif (stripos($errorMessage, 'rate') !== false ||
                      stripos($errorMessage, 'limit') !== false) {
                $errorType = 'rate_limit';
            }
            
            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'error_type' => $errorType
            ], 400);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            $errorType = 'unknown';
            
            // Determine error type based on message content
            if (stripos($errorMessage, 'auth') !== false || 
                stripos($errorMessage, 'key') !== false ||
                stripos($errorMessage, 'token') !== false ||
                stripos($errorMessage, 'credential') !== false ||
                stripos($errorMessage, 'unauthorized') !== false) {
                $errorType = 'authentication';
            } elseif (stripos($errorMessage, 'timeout') !== false ||
                      stripos($errorMessage, 'connect') !== false) {
                $errorType = 'connection';
            } elseif (stripos($errorMessage, 'rate') !== false ||
                      stripos($errorMessage, 'limit') !== false) {
                $errorType = 'rate_limit';
            }
            
            Log::error('AI Provider test failed: ' . $errorMessage, [
                'provider' => $request->input('provider'),
                'error_type' => $errorType,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'AI Provider test failed: ' . $errorMessage,
                'error_type' => $errorType
            ], 500);
        }
    }

    /**
     * Get the appropriate AI provider for the given model.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @return \App\Services\AI\ProviderInterface
     * @throws \Exception
     */
    private function getProviderForModel(AIModel $aiModel): ProviderInterface
    {
        $registry = app(ProviderRegistry::class);
        $provider = $registry->getProvider($aiModel->provider);

        if (!$provider) {
            throw new \Exception("Unsupported AI provider: {$aiModel->provider}");
        }

        return $provider;
    }
}
