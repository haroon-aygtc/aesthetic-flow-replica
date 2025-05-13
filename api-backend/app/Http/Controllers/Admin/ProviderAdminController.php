<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AIProvider;
use App\Models\ProviderModel;
use App\Models\ProviderParameter;
use App\Services\AI\ProviderDiscoveryService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProviderAdminController extends Controller
{
    protected $discoveryService;
    
    public function __construct(ProviderDiscoveryService $discoveryService)
    {
        $this->discoveryService = $discoveryService;
    }
    
    /**
     * Display a listing of providers
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $providers = AIProvider::withCount('models')->get();
        return response()->json([
            'success' => true,
            'data' => $providers
        ]);
    }
    
    /**
     * Show the form for creating a new provider
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function create()
    {
        $capabilities = [
            'chat' => 'Chat Completion',
            'embeddings' => 'Embeddings',
            'vision' => 'Vision/Image Analysis',
            'audio' => 'Audio Processing',
            'function_calling' => 'Function Calling'
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'capabilities' => $capabilities
            ]
        ]);
    }
    
    /**
     * Store a newly created provider
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:ai_providers,slug',
            'description' => 'nullable|string',
            'api_base_url' => 'nullable|url',
            'capabilities' => 'nullable|array',
            'auth_type' => 'required|string|in:bearer,api_key,basic,none',
            'auth_header_name' => 'nullable|string',
            'auth_prefix' => 'nullable|string',
            'supports_streaming' => 'boolean',
            'requires_model_selection' => 'boolean',
            'is_active' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Create provider
        $provider = AIProvider::create([
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'description' => $request->description,
            'api_base_url' => $request->api_base_url,
            'capabilities' => $request->capabilities,
            'auth_config' => [
                'type' => $request->auth_type,
                'header_name' => $request->auth_header_name ?? 'Authorization',
                'prefix' => $request->auth_prefix ?? 'Bearer'
            ],
            'supports_streaming' => $request->supports_streaming ?? false,
            'requires_model_selection' => $request->requires_model_selection ?? true,
            'is_active' => $request->is_active ?? true
        ]);
        
        // Add default parameters
        $this->createDefaultParameters($provider);
        
        return response()->json([
            'success' => true,
            'message' => 'Provider created successfully',
            'data' => $provider
        ], 201);
    }
    
    /**
     * Show the form for editing a provider
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function edit($id)
    {
        $provider = AIProvider::findOrFail($id);
        $capabilities = [
            'chat' => 'Chat Completion',
            'embeddings' => 'Embeddings',
            'vision' => 'Vision/Image Analysis',
            'audio' => 'Audio Processing',
            'function_calling' => 'Function Calling'
        ];
        
        return response()->json([
            'success' => true,
            'data' => [
                'provider' => $provider,
                'capabilities' => $capabilities
            ]
        ]);
    }
    
    /**
     * Update the specified provider
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $provider = AIProvider::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'api_base_url' => 'nullable|url',
            'capabilities' => 'nullable|array',
            'auth_type' => 'required|string|in:bearer,api_key,basic,none',
            'auth_header_name' => 'nullable|string',
            'auth_prefix' => 'nullable|string',
            'supports_streaming' => 'boolean',
            'requires_model_selection' => 'boolean',
            'is_active' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Update provider
        $provider->update([
            'name' => $request->name,
            'description' => $request->description,
            'api_base_url' => $request->api_base_url,
            'capabilities' => $request->capabilities,
            'auth_config' => [
                'type' => $request->auth_type,
                'header_name' => $request->auth_header_name ?? 'Authorization',
                'prefix' => $request->auth_prefix ?? 'Bearer'
            ],
            'supports_streaming' => $request->supports_streaming ?? false,
            'requires_model_selection' => $request->requires_model_selection ?? true,
            'is_active' => $request->is_active ?? true
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Provider updated successfully',
            'data' => $provider
        ]);
    }
    
    /**
     * Remove the specified provider
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $provider = AIProvider::findOrFail($id);
        
        // Check if provider is in use by any models
        $modelsInUse = \App\Models\AIModel::where('provider', $provider->slug)->count();
        
        if ($modelsInUse > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete provider: {$modelsInUse} AI models are using this provider."
            ], 422);
        }
        
        $provider->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Provider deleted successfully'
        ]);
    }
    
    /**
     * Show models for a provider
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function manageModels($id)
    {
        $provider = AIProvider::with(['models' => function($query) {
            $query->orderBy('display_order');
        }])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $provider->models
        ]);
    }
    
    /**
     * Store a new model for a provider
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeModel(Request $request, $id)
    {
        $provider = AIProvider::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'model_id' => 'required|string|max:255',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_free' => 'boolean',
            'is_restricted' => 'boolean',
            'is_featured' => 'boolean',
            'input_token_limit' => 'nullable|integer|min:1',
            'output_token_limit' => 'nullable|integer|min:1',
            'capabilities' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Get highest display order
        $maxOrder = $provider->models()->max('display_order') ?? 0;
        
        // Create model
        $model = $provider->models()->create([
            'model_id' => $request->model_id,
            'display_name' => $request->display_name,
            'description' => $request->description,
            'is_free' => $request->is_free ?? false,
            'is_restricted' => $request->is_restricted ?? false,
            'is_featured' => $request->is_featured ?? false,
            'input_token_limit' => $request->input_token_limit,
            'output_token_limit' => $request->output_token_limit,
            'capabilities' => $request->capabilities,
            'display_order' => $maxOrder + 10
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Model added successfully',
            'data' => $model
        ], 201);
    }
    
    /**
     * Update a model
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $providerId
     * @param  int  $modelId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateModel(Request $request, $providerId, $modelId)
    {
        $provider = AIProvider::findOrFail($providerId);
        $model = $provider->models()->findOrFail($modelId);
        
        $validator = Validator::make($request->all(), [
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_free' => 'boolean',
            'is_restricted' => 'boolean',
            'is_featured' => 'boolean',
            'input_token_limit' => 'nullable|integer|min:1',
            'output_token_limit' => 'nullable|integer|min:1',
            'capabilities' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Update model
        $model->update([
            'display_name' => $request->display_name,
            'description' => $request->description,
            'is_free' => $request->is_free ?? false,
            'is_restricted' => $request->is_restricted ?? false,
            'is_featured' => $request->is_featured ?? false,
            'input_token_limit' => $request->input_token_limit,
            'output_token_limit' => $request->output_token_limit,
            'capabilities' => $request->capabilities,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Model updated successfully',
            'data' => $model
        ]);
    }
    
    /**
     * Delete a model
     * 
     * @param  int  $providerId
     * @param  int  $modelId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroyModel($providerId, $modelId)
    {
        $provider = AIProvider::findOrFail($providerId);
        $model = $provider->models()->findOrFail($modelId);
        
        // Check if model is in use
        $modelsInUse = \App\Models\AIModel::where('settings->model_name', $model->model_id)->count();
        
        if ($modelsInUse > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete model: {$modelsInUse} AI configurations are using this model."
            ], 422);
        }
        
        $model->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Model deleted successfully'
        ]);
    }
    
    /**
     * Discover models for a provider
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function discoverModels(Request $request, $id)
    {
        $provider = AIProvider::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'api_key' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            // Use discovery service to fetch models from provider API
            $discoveredModels = $this->discoveryService->discoverModels(
                $provider,
                $request->api_key
            );
            
            // Get highest display order
            $maxOrder = $provider->models()->max('display_order') ?? 0;
            $order = $maxOrder + 10;
            
            $importedModels = [];
            
            // Save discovered models
            foreach ($discoveredModels as $model) {
                $providerModel = $provider->models()->updateOrCreate(
                    ['model_id' => $model['id']],
                    [
                        'display_name' => $model['name'],
                        'description' => $model['description'] ?? null,
                        'input_token_limit' => $model['context_length'] ?? null,
                        'output_token_limit' => $model['context_length'] / 2 ?? null,
                        'capabilities' => $model['capabilities'] ?? null,
                        'is_free' => $model['is_free'] ?? false,
                        'is_restricted' => $model['is_restricted'] ?? false,
                        'display_order' => $order
                    ]
                );
                
                $importedModels[] = $providerModel;
                $order += 10;
            }
            
            return response()->json([
                'success' => true,
                'message' => count($discoveredModels) . ' models discovered and imported!',
                'data' => $importedModels
            ]);
        } catch (\Exception $e) {
            Log::error('Error discovering models: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error discovering models: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Show parameter management for a provider
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function manageParameters($id)
    {
        $provider = AIProvider::with(['parameters' => function($query) {
            $query->orderBy('display_order');
        }])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $provider->parameters
        ]);
    }
    
    /**
     * Update parameters for a provider
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateParameters(Request $request, $id)
    {
        $provider = AIProvider::findOrFail($id);
        
        // Update temperature parameter
        $provider->parameters()->updateOrCreate(
            ['param_key' => 'temperature'],
            [
                'display_name' => 'Temperature',
                'type' => 'number',
                'config' => [
                    'min' => $request->temp_min,
                    'max' => $request->temp_max,
                    'step' => 0.1,
                    'presets' => [
                        'precise' => $request->temp_precise,
                        'balanced' => $request->temp_balanced,
                        'creative' => $request->temp_creative
                    ]
                ],
                'default_value' => $request->temp_balanced,
                'description' => 'Controls randomness in responses',
                'is_required' => true,
                'display_order' => 10
            ]
        );
        
        // Update max tokens parameter
        $provider->parameters()->updateOrCreate(
            ['param_key' => 'max_tokens'],
            [
                'display_name' => 'Max Tokens',
                'type' => 'number',
                'config' => [
                    'min' => $request->tokens_min,
                    'max' => $request->tokens_max,
                    'step' => 1,
                ],
                'default_value' => $request->tokens_default,
                'description' => $request->tokens_description,
                'is_required' => true,
                'display_order' => 20
            ]
        );
        
        // Update top_p parameter
        $provider->parameters()->updateOrCreate(
            ['param_key' => 'top_p'],
            [
                'display_name' => 'Top P',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 1,
                    'step' => 0.01,
                ],
                'default_value' => $request->top_p_default ?? 1,
                'description' => 'Controls diversity via nucleus sampling',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 30
            ]
        );
        
        // Update frequency_penalty parameter
        $provider->parameters()->updateOrCreate(
            ['param_key' => 'frequency_penalty'],
            [
                'display_name' => 'Frequency Penalty',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 2,
                    'step' => 0.01,
                ],
                'default_value' => $request->freq_penalty_default ?? 0,
                'description' => 'Reduces repetition by penalizing tokens that have already appeared',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 40
            ]
        );
        
        // Update presence_penalty parameter
        $provider->parameters()->updateOrCreate(
            ['param_key' => 'presence_penalty'],
            [
                'display_name' => 'Presence Penalty',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 2,
                    'step' => 0.01,
                ],
                'default_value' => $request->pres_penalty_default ?? 0,
                'description' => 'Encourages talking about new topics',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 50
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Parameters updated successfully!',
            'data' => $provider->parameters
        ]);
    }
    
    /**
     * Create default parameters for a provider
     * 
     * @param  \App\Models\AIProvider  $provider
     * @return void
     */
    protected function createDefaultParameters(AIProvider $provider)
    {
        // Create sensible defaults based on provider type
        $defaults = $this->getDefaultParametersForProvider($provider->slug);
        
        foreach ($defaults as $param) {
            $provider->parameters()->create($param);
        }
    }
    
    /**
     * Get default parameters for a provider type
     * 
     * @param  string  $providerSlug
     * @return array
     */
    protected function getDefaultParametersForProvider($providerSlug)
    {
        // Return appropriate defaults based on provider type
        switch ($providerSlug) {
            case 'openai':
                return [
                    [
                        'param_key' => 'temperature',
                        'display_name' => 'Temperature',
                        'type' => 'number',
                        'config' => [
                            'min' => 0,
                            'max' => 2,
                            'step' => 0.1,
                            'presets' => ['precise' => 0.2, 'balanced' => 0.7, 'creative' => 1.0]
                        ],
                        'default_value' => 0.7,
                        'description' => 'Controls randomness in responses',
                        'is_required' => true,
                        'display_order' => 10
                    ],
                    [
                        'param_key' => 'max_tokens',
                        'display_name' => 'Max Tokens',
                        'type' => 'number',
                        'config' => [
                            'min' => 1,
                            'max' => 16000,
                            'step' => 1,
                        ],
                        'default_value' => 4000,
                        'description' => 'Maximum length of the generated response',
                        'is_required' => true,
                        'display_order' => 20
                    ],
                    [
                        'param_key' => 'top_p',
                        'display_name' => 'Top P',
                        'type' => 'number',
                        'config' => [
                            'min' => 0,
                            'max' => 1,
                            'step' => 0.01,
                        ],
                        'default_value' => 1,
                        'description' => 'Controls diversity via nucleus sampling',
                        'is_required' => false,
                        'is_advanced' => true,
                        'display_order' => 30
                    ],
                    [
                        'param_key' => 'frequency_penalty',
                        'display_name' => 'Frequency Penalty',
                        'type' => 'number',
                        'config' => [
                            'min' => 0,
                            'max' => 2,
                            'step' => 0.01,
                        ],
                        'default_value' => 0,
                        'description' => 'Reduces repetition by penalizing tokens that have already appeared',
                        'is_required' => false,
                        'is_advanced' => true,
                        'display_order' => 40
                    ],
                    [
                        'param_key' => 'presence_penalty',
                        'display_name' => 'Presence Penalty',
                        'type' => 'number',
                        'config' => [
                            'min' => 0,
                            'max' => 2,
                            'step' => 0.01,
                        ],
                        'default_value' => 0,
                        'description' => 'Encourages talking about new topics',
                        'is_required' => false,
                        'is_advanced' => true,
                        'display_order' => 50
                    ]
                ];
            
            case 'anthropic':
                return [
                    [
                        'param_key' => 'temperature',
                        'display_name' => 'Temperature',
                        'type' => 'number',
                        'config' => [
                            'min' => 0,
                            'max' => 1,
                            'step' => 0.1,
                            'presets' => ['precise' => 0.1, 'balanced' => 0.7, 'creative' => 1.0]
                        ],
                        'default_value' => 0.7,
                        'description' => 'Controls randomness in responses',
                        'is_required' => true,
                        'display_order' => 10
                    ],
                    [
                        'param_key' => 'max_tokens',
                        'display_name' => 'Max Tokens',
                        'type' => 'number',
                        'config' => [
                            'min' => 1,
                            'max' => 100000,
                            'step' => 1,
                        ],
                        'default_value' => 4000,
                        'description' => 'Maximum length of the generated response',
                        'is_required' => true,
                        'display_order' => 20
                    ]
                ];
            
            default:
                return [
                    [
                        'param_key' => 'temperature',
                        'display_name' => 'Temperature',
                        'type' => 'number',
                        'config' => [
                            'min' => 0,
                            'max' => 1,
                            'step' => 0.1,
                            'presets' => ['precise' => 0.2, 'balanced' => 0.7, 'creative' => 0.9]
                        ],
                        'default_value' => 0.7,
                        'description' => 'Controls randomness in responses',
                        'is_required' => true,
                        'display_order' => 10
                    ],
                    [
                        'param_key' => 'max_tokens',
                        'display_name' => 'Max Tokens',
                        'type' => 'number',
                        'config' => [
                            'min' => 1,
                            'max' => 8000,
                            'step' => 1,
                        ],
                        'default_value' => 2048,
                        'description' => 'Maximum length of the generated response',
                        'is_required' => true,
                        'display_order' => 20
                    ]
                ];
        }
    }
} 