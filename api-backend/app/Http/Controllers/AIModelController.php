<?php

namespace App\Http\Controllers;

use App\Models\AIModel;
use App\Services\AIService;
use App\Services\AI\ProviderInterface;
use App\Services\AI\ProviderRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AIModelController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $aiModels = AIModel::all();
            return response()->json(['data' => $aiModels, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch AI models: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch AI models',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'provider' => 'required|string|max:255',
            'description' => 'nullable|string',
            'api_key' => 'nullable|string',
            'settings' => 'nullable|array',
            'settings.max_tokens' => 'nullable|integer|min:1|max:8000',
            'settings.temperature' => 'nullable|numeric|min:0|max:1',
            'settings.top_p' => 'nullable|numeric|min:0|max:1',
            'settings.frequency_penalty' => 'nullable|numeric|min:0|max:2',
            'settings.presence_penalty' => 'nullable|numeric|min:0|max:2',
            'is_default' => 'boolean',
            'fallback_model_id' => 'nullable|integer',
            'template_id' => 'nullable|integer|exists:templates,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            // If this model is set as default, unset other defaults
            if ($request->input('is_default')) {
                AIModel::where('is_default', true)->update(['is_default' => false]);
            }

            $aiModel = AIModel::create($request->all());
            return response()->json(['data' => $aiModel, 'success' => true], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create AI model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create AI model',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $aiModel = AIModel::findOrFail($id);
            return response()->json(['data' => $aiModel, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch AI model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch AI model',
                'error' => $e->getMessage(),
                'success' => false
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'provider' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'api_key' => 'nullable|string',
            'settings' => 'nullable|array',
            'settings.max_tokens' => 'nullable|integer|min:1|max:8000',
            'settings.temperature' => 'nullable|numeric|min:0|max:1',
            'settings.top_p' => 'nullable|numeric|min:0|max:1',
            'settings.frequency_penalty' => 'nullable|numeric|min:0|max:2',
            'settings.presence_penalty' => 'nullable|numeric|min:0|max:2',
            'is_default' => 'boolean',
            'template_id' => 'nullable|integer|exists:templates,id',
            'fallback_model_id' => 'nullable|integer',
            'confidence_threshold' => 'nullable|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            $aiModel = AIModel::findOrFail($id);

            // If this model is being set as default, unset other defaults
            if ($request->has('is_default') && $request->input('is_default') && !$aiModel->is_default) {
                AIModel::where('is_default', true)->update(['is_default' => false]);
            }

            $aiModel->update($request->all());
            return response()->json(['data' => $aiModel, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to update AI model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update AI model',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $aiModel = AIModel::findOrFail($id);

            // Check if model is in use by any widgets
            if ($aiModel->widgets()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete this AI model because it is being used by one or more widgets.',
                    'success' => false
                ], 422);
            }

            $aiModel->delete();
            return response()->json(['message' => 'Model deleted successfully', 'success' => true], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete AI model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete AI model',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Test connection to the AI model provider.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function testConnection(Request $request, $id)
    {
        try {
            $aiModel = AIModel::findOrFail($id);

            // Get the appropriate provider for this model
            $provider = $this->getProviderForModel($aiModel);

            // Test the connection using the provider's implementation
            $result = $provider->testConnection($aiModel);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => $result['data'] ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Connection test failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Connection test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test chat with the AI model.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function testChat(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:2000',
            'temperature' => 'nullable|numeric|min:0|max:1',
            'max_tokens' => 'nullable|integer|min:1|max:8000',
            'system_prompt' => 'nullable|string|max:4000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            $aiModel = AIModel::findOrFail($id);

            // Create messages array with system prompt if provided
            $messages = [];

            // Add system prompt if provided
            if ($request->has('system_prompt') && !empty($request->input('system_prompt'))) {
                $messages[] = [
                    'role' => 'system',
                    'content' => $request->input('system_prompt')
                ];
            }

            // Add user message
            $messages[] = [
                'role' => 'user',
                'content' => $request->input('message')
            ];

            // Get temperature and max_tokens from request or model settings
            $temperature = $request->input('temperature', $aiModel->settings['temperature'] ?? 0.7);
            $maxTokens = $request->input('max_tokens', $aiModel->settings['max_tokens'] ?? 1024);

            // Create AIService instance
            $aiService = app(AIService::class);

            // Start timing the response
            $startTime = microtime(true);

            // Process the message
            $response = $aiService->processMessage($messages, $aiModel, null, [
                'temperature' => $temperature,
                'max_tokens' => $maxTokens
            ]);

            // Calculate response time
            $responseTime = microtime(true) - $startTime;

            // Estimate token counts
            $tokensInput = $aiService->countTokens($messages);
            $tokensOutput = $aiService->countTokens([$response['content']]);

            return response()->json([
                'success' => !isset($response['metadata']['error']),
                'response' => $response['content'],
                'metadata' => [
                    'model' => $aiModel->name,
                    'provider' => $aiModel->provider,
                    'response_time' => round($responseTime, 2),
                    'tokens_input' => $tokensInput,
                    'tokens_output' => $tokensOutput,
                    'error' => $response['metadata']['error'] ?? null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Chat test failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Chat test failed',
                'error' => $e->getMessage()
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

    /**
     * Get available fallback options for a model.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getFallbackOptions($id)
    {
        try {
            // Find the current model
            $currentModel = AIModel::findOrFail($id);

            // Get all active models except the current one
            $fallbackOptions = AIModel::where('id', '!=', $id)
                ->where('active', true)
                ->get();

            return response()->json(['data' => $fallbackOptions, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch fallback options: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch fallback options',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Toggle model activation status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function toggleActivation(Request $request, $id)
    {
        try {
            $aiModel = AIModel::findOrFail($id);

            // Don't allow deactivating the default model
            if ($aiModel->is_default && !$request->input('active', true)) {
                return response()->json([
                    'message' => 'Cannot deactivate the default model',
                    'success' => false
                ], 422);
            }

            $aiModel->active = $request->input('active', true);
            $aiModel->save();

            return response()->json([
                'data' => $aiModel,
                'success' => true,
                'message' => $aiModel->active ? 'Model activated successfully' : 'Model deactivated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to toggle model activation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to toggle model activation',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Get available models for a specific AI model.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getAvailableModels($id)
    {
        try {
            $aiModel = AIModel::findOrFail($id);

            // Get available models from settings
            $availableModels = $aiModel->settings['available_models'] ?? [];

            // Convert to array format for the frontend
            $models = [];
            foreach ($availableModels as $name => $info) {
                $models[] = [
                    'name' => $name,
                    'display_name' => $info['display_name'] ?? $name,
                    'description' => $info['description'] ?? '',
                    'input_token_limit' => $info['input_token_limit'] ?? 0,
                    'output_token_limit' => $info['output_token_limit'] ?? 0,
                    'supported_features' => $info['supported_features'] ?? [],
                ];
            }

            return response()->json([
                'data' => $models,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get available models: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to get available models',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Discover available models from the provider.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function discoverModels(Request $request, $id)
    {
        try {
            $aiModel = AIModel::findOrFail($id);

            // Determine which model and provider to use
            $modelToUse = $aiModel;
            $providerName = $aiModel->provider;

            // If a new provider is specified in the request, create a temporary model
            if ($request->has('provider')) {
                $providerName = $request->input('provider');
                $modelToUse = new AIModel([
                    'name' => $aiModel->name,
                    'provider' => $providerName,
                    'api_key' => $request->input('api_key', $aiModel->api_key),
                    'settings' => $aiModel->settings
                ]);
            }

            // Get the provider
            try {
                $registry = app(ProviderRegistry::class);
                $provider = $registry->getProvider($providerName);

                if (!$provider) {
                    throw new \Exception("Unsupported AI provider: {$providerName}");
                }

                // Discover models
                $result = $provider->discoverModels($modelToUse);

                if ($result['success']) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Models discovered successfully',
                        'data' => [
                            'models' => array_keys($result['models']),
                            'current_model' => $modelToUse->settings['model_name'] ?? null,
                        ]
                    ]);
                } else {
                    // Check if there's a specific error message that indicates an authentication issue
                    $errorMessage = $result['error'] ?? 'Unknown error';
                    $isAuthError =
                        stripos($errorMessage, 'authentication') !== false ||
                        stripos($errorMessage, 'auth') !== false ||
                        stripos($errorMessage, 'key') !== false ||
                        stripos($errorMessage, 'token') !== false ||
                        stripos($errorMessage, 'credential') !== false ||
                        stripos($errorMessage, 'unauthorized') !== false;

                    return response()->json([
                        'success' => false,
                        'message' => $isAuthError
                            ? 'Authentication error: Please check your API key for ' . $providerName
                            : 'Failed to discover models: ' . $errorMessage,
                        'error' => $errorMessage,
                        'error_type' => $isAuthError ? 'authentication' : 'unknown'
                    ], $isAuthError ? 401 : 400);
                }
            } catch (\Exception $e) {
                // Check for authentication errors
                $errorMessage = $e->getMessage();
                $isAuthError =
                    stripos($errorMessage, 'authentication') !== false ||
                    stripos($errorMessage, 'auth') !== false ||
                    stripos($errorMessage, 'key') !== false ||
                    stripos($errorMessage, 'token') !== false ||
                    stripos($errorMessage, 'credential') !== false ||
                    stripos($errorMessage, 'unauthorized') !== false;

                Log::error('Failed to discover models: ' . $errorMessage, [
                    'model_id' => $id,
                    'provider' => $providerName,
                    'error_type' => $isAuthError ? 'authentication' : 'unknown'
                ]);

                // Return detailed error for authentication issues
                if ($isAuthError) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Authentication error: Please check your API key for ' . $providerName,
                        'error_type' => 'authentication',
                        'error' => $errorMessage
                    ], 401);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to discover models: ' . $errorMessage,
                    'error' => $errorMessage
                ], 400);
            }
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            Log::error('Failed to discover models: ' . $errorMessage, [
                'model_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to discover models',
                'error' => $errorMessage
            ], 500);
        }
    }

    /**
     * Test an AI connection and discover models without requiring an existing model
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function testAIConnection(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'provider' => 'required|string',
                'api_key' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Create a temporary model instance
            $tempModel = new AIModel([
                'name' => 'Temporary Model',
                'provider' => $request->provider,
                'api_key' => $request->api_key,
                'settings' => [
                    'model_name' => null,
                ]
            ]);

            // Get the appropriate provider
            try {
                $provider = $this->getProviderForModel($tempModel);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid provider: ' . $e->getMessage(),
                ], 400);
            }

            // Test connection and discover models
            try {
                // First test the connection
                $connectionTest = $provider->testConnection($tempModel);

                if (!$connectionTest['success']) {
                    return response()->json([
                        'success' => false,
                        'message' => $connectionTest['message'] ?? 'Connection test failed',
                        'error_type' => $connectionTest['error_type'] ?? 'unknown'
                    ], 400);
                }

                // Then discover models
                $result = $provider->discoverModels($tempModel);

                if ($result['success']) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Successfully connected to provider',
                        'data' => [
                            'models' => array_keys($result['models']),
                            'source' => $result['source'] ?? 'unknown'
                        ]
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => $result['error'] ?? 'Failed to discover models',
                    ], 400);
                }
            } catch (\Exception $e) {
                // Check for authentication errors
                $errorMessage = $e->getMessage();
                $isAuthError =
                    stripos($errorMessage, 'authentication') !== false ||
                    stripos($errorMessage, 'auth') !== false ||
                    stripos($errorMessage, 'key') !== false ||
                    stripos($errorMessage, 'token') !== false ||
                    stripos($errorMessage, 'credential') !== false ||
                    stripos($errorMessage, 'unauthorized') !== false;

                return response()->json([
                    'success' => false,
                    'message' => $isAuthError
                        ? 'Authentication error: ' . $errorMessage
                        : 'Error testing connection: ' . $errorMessage,
                    'error_type' => $isAuthError ? 'authentication' : 'unknown'
                ], $isAuthError ? 401 : 400);
            }
        } catch (\Exception $e) {
            Log::error('Error in AI test connection: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
