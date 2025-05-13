<?php

namespace App\Services\AI\Providers;

use App\Models\AIModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Services\AI\AbstractProvider;
use Illuminate\Support\Facades\Cache;

class HuggingFaceProvider extends AbstractProvider
{
    /**
     * Get provider name
     * 
     * @return string
     */
    protected function getProviderName(): string
    {
        return 'huggingface';
    }
    
    /**
     * Process a message using Hugging Face
     * 
     * @param AIModel $model
     * @param array $messages
     * @param array $options
     * @return array
     */
    public function processMessage(AIModel $model, array $messages, array $options = [])
    {
        try {
            $modelName = $this->getValidModelName($model);
            $temperature = $options['temperature'] ?? $model->settings['temperature'] ?? 0.7;
            $maxTokens = $options['max_tokens'] ?? $model->settings['max_tokens'] ?? 2048;
            $topP = $options['top_p'] ?? $model->settings['top_p'] ?? 0.9;
            $frequencyPenalty = $options['frequency_penalty'] ?? $model->settings['frequency_penalty'] ?? 0.0;
            $presencePenalty = $options['presence_penalty'] ?? $model->settings['presence_penalty'] ?? 0.0;
            
            // Format messages for Hugging Face
            // Combine all messages into a single prompt
            $prompt = '';
            foreach ($messages as $message) {
                $role = ucfirst($message['role']);
                $prompt .= "{$role}: {$message['content']}\n";
            }
            
            // Add assistant prompt at the end to indicate it's the model's turn
            $prompt .= "Assistant: ";
            
            $payload = [
                'inputs' => $prompt,
                'parameters' => [
                    'temperature' => $temperature,
                    'max_new_tokens' => $maxTokens,
                    'return_full_text' => false,
                    'top_p' => $topP,
                    'repetition_penalty' => 1.0 + $frequencyPenalty, // Convert to repetition penalty format
                    'presence_penalty' => $presencePenalty,
                ],
            ];
            
            // Remove any null or zero parameters to prevent API errors
            $payload['parameters'] = array_filter($payload['parameters'], function($value) {
                return $value !== null && $value !== 0.0;
            });
            
            // Response tracking
            $responseReceived = false;
            $generatedText = null;
            $interfaceUsed = null;
            $errorMessages = [];
            
            // First try the Inference API endpoint with increased timeout
            try {
                Log::info("Attempting to use Hugging Face Inference API for model {$modelName}");
                
                $inferenceResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $model->api_key,
                    'Content-Type' => 'application/json',
                ])->timeout(30)->post("https://api-inference.huggingface.co/models/{$modelName}", $payload);
                
                if ($inferenceResponse->successful()) {
                    // Hugging Face returns an array of generated texts
                    $responseData = $inferenceResponse->json();
                    
                    if (isset($responseData[0]) && isset($responseData[0]['generated_text'])) {
                        $generatedText = $responseData[0]['generated_text'];
                        $responseReceived = true;
                        $interfaceUsed = 'inference_api';
                        
                        Log::info("Successfully received response from Hugging Face Inference API for {$modelName}");
                    } else {
                        Log::warning("Unexpected response format from Hugging Face Inference API for {$modelName}", [
                            'response' => $responseData
                        ]);
                        $errorMessages[] = "Unexpected response format from Inference API";
                    }
                } else {
                    Log::warning("Hugging Face Inference API error for model {$modelName}: " . $inferenceResponse->body());
                    $errorMessages[] = "Inference API error: " . $inferenceResponse->body();
                }
            } catch (\Exception $inferenceError) {
                Log::warning("Hugging Face Inference API error for model {$modelName}: " . $inferenceError->getMessage());
                $errorMessages[] = "Inference API exception: " . $inferenceError->getMessage();
            }
            
            // If Inference API fails, try the base API endpoint
            if (!$responseReceived) {
                try {
                    Log::info("Falling back to Hugging Face base API for model {$modelName}");
                    
                    $response = $this->makeRequest('post', "/{$modelName}", [
                        'headers' => [
                    'Authorization' => 'Bearer ' . $model->api_key,
                    'Content-Type' => 'application/json',
                ],
                'data' => $payload,
                        'timeout' => 45, // Longer timeout for base API
                    ]);
                    
                    // Parse response based on format
                    if (is_array($response) && isset($response[0]) && isset($response[0]['generated_text'])) {
                        $generatedText = $response[0]['generated_text'];
                        $responseReceived = true;
                        $interfaceUsed = 'base_api';
                    } elseif (is_string($response)) {
                        $generatedText = $response;
                        $responseReceived = true;
                        $interfaceUsed = 'base_api_text';
                    } elseif (is_array($response) && isset($response['generated_text'])) {
                        $generatedText = $response['generated_text'];
                        $responseReceived = true;
                        $interfaceUsed = 'base_api_single';
                    } else {
                        Log::warning("Unexpected response format from Hugging Face base API for model {$modelName}", [
                            'response' => $response
                        ]);
                        $errorMessages[] = "Unexpected response format from base API";
                    }
                    
                    if ($responseReceived) {
                        Log::info("Successfully received response from Hugging Face base API for {$modelName}");
                    }
                } catch (\Exception $baseApiError) {
                    Log::warning("Hugging Face base API error for model {$modelName}: " . $baseApiError->getMessage());
                    $errorMessages[] = "Base API error: " . $baseApiError->getMessage();
                }
            }
            
            // If both APIs fail, try a free model as final fallback
            if (!$responseReceived && $modelName !== 'google/flan-t5-small') {
                try {
                    Log::info("Attempting last-resort fallback to Hugging Face free model flan-t5-small");
                    
                    $fallbackPayload = [
                        'inputs' => $prompt,
                        'parameters' => [
                            'temperature' => $temperature,
                            'max_new_tokens' => min($maxTokens, 256), // Limit tokens for free model
                            'return_full_text' => false,
                        ],
                    ];
                    
                    $fallbackResponse = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $model->api_key,
                        'Content-Type' => 'application/json',
                    ])->timeout(20)->post("https://api-inference.huggingface.co/models/google/flan-t5-small", $fallbackPayload);
                    
                    if ($fallbackResponse->successful()) {
                        $responseData = $fallbackResponse->json();
                        
                        if (isset($responseData[0]) && isset($responseData[0]['generated_text'])) {
                            $generatedText = $responseData[0]['generated_text'];
                            $responseReceived = true;
                            $interfaceUsed = 'fallback_model';
                            
                            Log::info("Successfully received response from fallback model flan-t5-small");
                        }
                    }
                } catch (\Exception $fallbackError) {
                    Log::warning("Hugging Face fallback model error: " . $fallbackError->getMessage());
                    $errorMessages[] = "Fallback model error: " . $fallbackError->getMessage();
                }
            }
            
            // If all attempts failed, provide a graceful error response
            if (!$responseReceived) {
                $errorDetail = implode("; ", $errorMessages);
                Log::error("All Hugging Face API attempts failed for model {$modelName}", [
                    'model_id' => $model->id,
                    'errors' => $errorMessages,
                ]);
                
                return [
                    'content' => "I apologize, but I'm currently unable to process your request due to a service issue. Please try again later.",
                    'metadata' => [
                        'model' => $modelName,
                        'provider' => $this->getProviderName(),
                        'error' => true,
                        'error_detail' => $errorDetail,
                    ],
                ];
            }
            
            return [
                'content' => $generatedText,
                'metadata' => [
                    'model' => $interfaceUsed === 'fallback_model' ? 'google/flan-t5-small' : $modelName,
                    'provider' => $this->getProviderName(),
                    'interface' => $interfaceUsed,
                    'fallback_used' => $interfaceUsed === 'fallback_model',
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Hugging Face API error: " . $e->getMessage(), [
                'model_id' => $model->id,
                'model_name' => isset($modelName) ? $modelName : 'unknown',
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'content' => "I'm sorry, but I encountered an error while processing your request. Please try again later.",
                'metadata' => [
                    'error' => true,
                    'provider' => $this->getProviderName(),
                    'error_message' => $e->getMessage(),
                ],
            ];
        }
    }
    
    /**
     * Test connection to Hugging Face
     * 
     * @param AIModel $model
     * @return array
     */
    public function testConnection(AIModel $model): array
    {
        try {
            $success = false;
            $interfaceType = null;
            $availableModels = [];
            $errorMessages = [];
            
            // Step 1: Try Hugging Face API (authentication endpoint)
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $model->api_key,
                ])->timeout(10)->get('https://huggingface.co/api/whoami');
                
                if ($response->successful()) {
                    $success = true;
                    $interfaceType = 'api';
                    Log::info("Successfully connected to Hugging Face API", [
                        'model_id' => $model->id,
                        'status_code' => $response->status()
                    ]);
                    
                    // Since API authentication worked, get popular models
                    $discoveredModels = $this->getPopularModels();
                    $this->updateModelSettings($model, $discoveredModels);
                    $availableModels = array_keys($discoveredModels);
                } else {
                    $errorMessages[] = "Hugging Face API error: " . $response->body();
                }
            } catch (\Exception $e) {
                Log::warning("Hugging Face API test failed: " . $e->getMessage());
                $errorMessages[] = "Hugging Face API error: " . $e->getMessage();
            }
            
            // Step 2: If API fails, try the Inference API with a free model
            if (!$success) {
                try {
                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $model->api_key,
                    ])->timeout(15)->post('https://api-inference.huggingface.co/models/google/flan-t5-small', [
                        'inputs' => 'Hello, how are you?',
                        'parameters' => ['max_new_tokens' => 10],
                    ]);
                    
                    if ($response->successful()) {
                        $success = true;
                        $interfaceType = 'inference_api';
                        Log::info("Successfully connected to Hugging Face Inference API", [
                            'model_id' => $model->id,
                            'status_code' => $response->status()
                        ]);
                        
                        // Since Inference API authentication worked, we can use free models
                        $discoveredModels = $this->getFreeTierModels();
                        $this->updateModelSettings($model, $discoveredModels);
                        $availableModels = array_keys($discoveredModels);
                    } else {
                        $errorMessages[] = "Hugging Face Inference API error: " . $response->body();
                    }
                } catch (\Exception $e) {
                    Log::warning("Hugging Face Inference API test failed: " . $e->getMessage());
                    $errorMessages[] = "Hugging Face Inference API error: " . $e->getMessage();
                }
            }
            
            // Step 3: Check for specific error types and return appropriate response
            if (!$success) {
                $combinedErrorMessage = implode("; ", $errorMessages);
                
                // Check if any errors indicate authentication issues
                $isAuthError = 
                    stripos($combinedErrorMessage, 'authentication') !== false || 
                    stripos($combinedErrorMessage, 'auth') !== false ||
                    stripos($combinedErrorMessage, 'key') !== false ||
                    stripos($combinedErrorMessage, 'token') !== false ||
                    stripos($combinedErrorMessage, 'credential') !== false ||
                    stripos($combinedErrorMessage, 'unauthorized') !== false ||
                    stripos($combinedErrorMessage, '401') !== false ||
                    stripos($combinedErrorMessage, '403') !== false;
                
                return [
                    'success' => false,
                    'message' => $isAuthError 
                        ? 'Invalid API token. Please check your Hugging Face API key.'
                        : 'Failed to connect to Hugging Face API services. ' . $combinedErrorMessage,
                    'error_type' => $isAuthError ? 'authentication' : 'connection',
                    'error_details' => $errorMessages,
                ];
            }
            
            // Success response
            return [
                'success' => true,
                'message' => 'Successfully connected to Hugging Face ' . ($interfaceType === 'api' ? 'API' : 'Inference API'),
                'data' => [
                    'interface_type' => $interfaceType,
                    'user_info' => $interfaceType === 'api' ? $response->json() : null,
                    'available_models' => $availableModels,
                    'access_level' => $interfaceType === 'api' ? 'full' : 'inference_only'
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Hugging Face connection test failed: " . $e->getMessage(), [
                'model_id' => $model->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => 'Hugging Face connection test failed: ' . $e->getMessage(),
                'error_type' => 'connection',
            ];
        }
    }
    
    /**
     * Discover available models
     * 
     * @param AIModel $model
     * @return array
     */
    public function discoverModels(AIModel $model): array
    {
        try {
            $models = [];
            $sourcesUsed = [];
            $success = false;
            
            // First, try to use cached models if available
            $cachedModels = $this->getCachedModels();
            if (!empty($cachedModels)) {
                $models = $cachedModels;
                $success = true;
                $sourcesUsed[] = 'cache';
                Log::info("Using cached Hugging Face models", ['count' => count($models)]);
            }
            
            // Regardless of cache, always include free models
            $freeModels = $this->getFreeTierModels();
            foreach ($freeModels as $name => $modelInfo) {
                if (!isset($models[$name])) {
                    $modelInfo['category'] = 'free';
                    $models[$name] = $modelInfo;
                } else {
                    $models[$name]['category'] = 'free';
                }
            }
            
            if (!empty($models) && empty($sourcesUsed)) {
                $success = true;
                $sourcesUsed[] = 'predefined';
            }
            
            // Next, try to fetch API models
            try {
                // Try to authenticate with the Hugging Face API
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $model->api_key,
                ])->timeout(10)->get('https://huggingface.co/api/whoami');
                
                if ($response->successful()) {
                    // First try to get popular text generation models
                    try {
                        $popularModelsResponse = Http::withHeaders([
                            'Authorization' => 'Bearer ' . $model->api_key,
                        ])->timeout(15)->get('https://huggingface.co/api/models', [
                            'filter' => 'text-generation',
                            'sort' => 'downloads',
                            'limit' => 100
                        ]);
                        
                        if ($popularModelsResponse->successful()) {
                            $apiModels = $popularModelsResponse->json();
                            
                            // Process the models from the API
                            foreach ($apiModels as $apiModel) {
                                $modelId = $apiModel['modelId'] ?? null;
                                if ($modelId && !in_array($modelId, array_keys($freeModels))) {
                                    // Check for access limitations
                                    $isGated = $apiModel['gated'] ?? false;
                                    $pipelines = $apiModel['pipeline_tag'] ?? [];
                                    $isTextGeneration = in_array('text-generation', (array)$pipelines);
                                    
                                    if ($isTextGeneration) {
                                        $category = $isGated ? 'restricted' : 'standard';
                                        
                                        $models[$modelId] = [
                                            'name' => $modelId,
                                            'display_name' => $apiModel['name'] ?? $modelId,
                                            'description' => $apiModel['description'] ?? '',
                                            'input_token_limit' => $apiModel['maxInputLength'] ?? 2048,
                                            'output_token_limit' => $apiModel['maxOutputLength'] ?? 1024,
                                            'supported_features' => [
                                                'streaming' => false,
                                                'vision' => false,
                                            ],
                                            'category' => $category,
                                            'metadata' => [
                                                'downloads' => $apiModel['downloads'] ?? 0,
                                                'lastModified' => $apiModel['lastModified'] ?? '',
                                                'tags' => $apiModel['tags'] ?? [],
                                            ],
                                        ];
                                    }
                                }
                            }
                            
                            $success = true;
                            $sourcesUsed[] = 'api';
                            Log::info("Successfully fetched models from Hugging Face API", ['count' => count($apiModels)]);
                        }
                    } catch (\Exception $e) {
                        Log::warning("Failed to get popular models from Hugging Face API: " . $e->getMessage());
                    }
                    
                    // Also fetch predefined popular models
                    $popularModels = $this->getPopularModels();
                    foreach ($popularModels as $name => $modelInfo) {
                        if (!isset($models[$name])) {
                            // Add category based on model name pattern
                            if (strpos($name, 'meta-llama') === 0 || 
                                strpos($name, 'mistralai') === 0 || 
                                strpos($name, 'tiiuae') === 0) {
                                $modelInfo['category'] = 'restricted';
                            } else {
                                $modelInfo['category'] = 'standard';
                            }
                            
                            $models[$name] = $modelInfo;
                        }
                    }
                    
                    $sourcesUsed[] = 'popular';
                }
            } catch (\Exception $e) {
                Log::warning("Failed to authenticate with Hugging Face API: " . $e->getMessage());
            }
            
            // Finally, try to fetch models from the inference API
            try {
                $inferenceApiModels = $this->fetchInferenceApiModels($model);
                if (!empty($inferenceApiModels)) {
                    foreach ($inferenceApiModels as $name => $modelInfo) {
                        if (!isset($models[$name])) {
                            // Add category if not already set
                            if (!isset($modelInfo['category'])) {
                                if (isset($freeModels[$name])) {
                                    $modelInfo['category'] = 'free';
                                } else {
                                    $modelInfo['category'] = 'standard';
                                }
                            }
                            
                            $models[$name] = $modelInfo;
                        }
                    }
                    
                    $success = true;
                    $sourcesUsed[] = 'inference_api';
                    Log::info("Successfully fetched models from Hugging Face Inference API");
                }
            } catch (\Exception $e) {
                Log::warning("Failed to fetch models from Hugging Face Inference API: " . $e->getMessage());
            }
            
            // Set categories for any remaining models without categories
            foreach ($models as $name => $modelInfo) {
                if (!isset($modelInfo['category'])) {
                    $models[$name]['category'] = 'standard';
                }
            }
            
            // Cache the discovered models for future use
            if ($success && count($models) > count($freeModels)) {
                $this->cacheModels($models);
            }
            
            // Update the model settings with discovered models
            $this->updateModelSettings($model, $models);
            
            return [
                'success' => $success,
                'models' => $models,
                'source' => implode(', ', $sourcesUsed),
                'model_count' => count($models),
                'categories' => [
                    'free' => count(array_filter($models, function($m) { return ($m['category'] ?? '') === 'free'; })),
                    'standard' => count(array_filter($models, function($m) { return ($m['category'] ?? '') === 'standard'; })),
                    'restricted' => count(array_filter($models, function($m) { return ($m['category'] ?? '') === 'restricted'; })),
                ]
            ];
        } catch (\Exception $e) {
            Log::error("Failed to discover Hugging Face models: " . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Cache discovered models
     * 
     * @param array $models
     * @return void
     */
    protected function cacheModels(array $models): void
    {
        $cacheKey = "huggingface_models";
        $cacheTtl = now()->addHours(12); // Cache for 12 hours
        
        Cache::put($cacheKey, $models, $cacheTtl);
        Log::info("Cached Hugging Face models", ['count' => count($models)]);
    }
    
    /**
     * Get cached models
     * 
     * @return array
     */
    protected function getCachedModels(): array
    {
        $cacheKey = "huggingface_models";
        $cachedModels = Cache::get($cacheKey, []);
        
        return $cachedModels;
    }
    
    /**
     * Fetch models from the Inference API
     * 
     * @param AIModel $model
     * @return array
     */
    protected function fetchInferenceApiModels(AIModel $model): array
    {
        try {
            // Try to get a list of featured models from the Inference API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->api_key,
            ])->timeout(15)->get('https://api-inference.huggingface.co/framework/text-generation');
            
            if ($response->successful()) {
                $models = $response->json();
                $discoveredModels = [];
                
                foreach ($models as $modelData) {
                    $modelId = $modelData['model'] ?? null;
                    if ($modelId) {
                        // Determine model category
                        $category = 'standard';
                        
                        // Free models are usually small models like flan-t5-small, gpt2, bart, etc.
                        if (strpos($modelId, 'flan-t5-small') !== false || 
                            strpos($modelId, 'gpt2') !== false || 
                            strpos($modelId, 'bart') !== false ||
                            strpos($modelId, 't5-small') !== false ||
                            strpos($modelId, 'distil') !== false) {
                            $category = 'free';
                        }
                        
                        // Restricted models usually include llama, mistral, falcon, etc.
                        if (strpos($modelId, 'llama') !== false || 
                            strpos($modelId, 'mistral') !== false || 
                            strpos($modelId, 'mixtral') !== false ||
                            strpos($modelId, 'falcon') !== false ||
                            strpos($modelId, 'gemma') !== false ||
                            strpos($modelId, 'phi') !== false) {
                            $category = 'restricted';
                        }
                        
                        $discoveredModels[$modelId] = [
                            'name' => $modelId,
                            'display_name' => $this->formatModelName($modelId),
                            'description' => $modelData['description'] ?? '',
                            'input_token_limit' => $modelData['max_input_length'] ?? 2048,
                            'output_token_limit' => $modelData['max_output_length'] ?? 1024,
                            'supported_features' => [
                                'streaming' => $modelData['streaming'] ?? false,
                                'vision' => false,
                            ],
                            'category' => $category,
                            'metadata' => [
                                'inference_api' => true,
                                'version' => $modelData['version'] ?? null,
                            ],
                        ];
                    }
                }
                
                // Add free models to ensure they're always available
                $freeModels = $this->getFreeTierModels();
                foreach ($freeModels as $name => $info) {
                    $info['category'] = 'free';
                    $discoveredModels[$name] = $info;
                }
                
                return $discoveredModels;
            }
            
            // If inference API fails, return empty array
            Log::warning("Failed to fetch Hugging Face Inference API models", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            return [];
        } catch (\Exception $e) {
            Log::warning("Error fetching Hugging Face Inference API models: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Format a model ID into a display name
     * 
     * @param string $modelId
     * @return string
     */
    protected function formatModelName(string $modelId): string
    {
        // Extract the model name from the model ID
        $parts = explode('/', $modelId);
        $modelName = end($parts);
        
        // Replace hyphens and underscores with spaces
        $modelName = str_replace(['-', '_'], ' ', $modelName);
        
        // Capitalize words
        $modelName = ucwords($modelName);
        
        // Special formatting for common prefixes
        $modelName = preg_replace('/\bLlama\b/i', 'Llama', $modelName);
        $modelName = preg_replace('/\bGpt\b/i', 'GPT', $modelName);
        $modelName = preg_replace('/\bT5\b/i', 'T5', $modelName);
        
        return $modelName;
    }
    
    /**
     * Get a list of popular Hugging Face models
     * 
     * @return array
     */
    protected function getPopularModels(): array
    {
        return [
            // Free and widely accessible models first
            'google/flan-t5-small' => [
                'name' => 'google/flan-t5-small',
                'display_name' => 'Flan-T5 Small',
                'description' => 'Google\'s smaller Flan-T5 model - free and widely accessible',
                'input_token_limit' => 512,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'facebook/bart-large-cnn' => [
                'name' => 'facebook/bart-large-cnn',
                'display_name' => 'BART CNN',
                'description' => 'BART model fine-tuned on CNN Daily Mail - free and accessible',
                'input_token_limit' => 1024,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'gpt2' => [
                'name' => 'gpt2',
                'display_name' => 'GPT-2',
                'description' => 'OpenAI\'s GPT-2 model - free and widely accessible',
                'input_token_limit' => 1024,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'EleutherAI/gpt-neo-1.3B' => [
                'name' => 'EleutherAI/gpt-neo-1.3B',
                'display_name' => 'GPT-Neo 1.3B',
                'description' => 'EleutherAI\'s GPT-Neo 1.3B model - free and accessible',
                'input_token_limit' => 2048,
                'output_token_limit' => 512,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'bigscience/bloom-560m' => [
                'name' => 'bigscience/bloom-560m',
                'display_name' => 'BLOOM 560M',
                'description' => 'BigScience\'s BLOOM 560M model - free and accessible',
                'input_token_limit' => 1024,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            
            // Meta Llama models (require access approval)
            'meta-llama/Llama-3-70b-chat-hf' => [
                'name' => 'meta-llama/Llama-3-70b-chat-hf',
                'display_name' => 'Llama 3 70B',
                'description' => 'Meta\'s Llama 3 70B parameter model fine-tuned for chat (requires approval)',
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'meta-llama/Llama-3-8b-chat-hf' => [
                'name' => 'meta-llama/Llama-3-8b-chat-hf',
                'display_name' => 'Llama 3 8B',
                'description' => 'Meta\'s Llama 3 8B parameter model fine-tuned for chat (requires approval)',
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'meta-llama/Llama-2-70b-chat-hf' => [
                'name' => 'meta-llama/Llama-2-70b-chat-hf',
                'display_name' => 'Llama 2 70B',
                'description' => 'Meta\'s Llama 2 70B parameter model fine-tuned for chat (requires approval)',
                'input_token_limit' => 4096,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'meta-llama/Llama-2-13b-chat-hf' => [
                'name' => 'meta-llama/Llama-2-13b-chat-hf',
                'display_name' => 'Llama 2 13B',
                'description' => 'Meta\'s Llama 2 13B parameter model fine-tuned for chat (requires approval)',
                'input_token_limit' => 4096,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            
            // Mistral models
            'mistralai/Mixtral-8x7B-Instruct-v0.1' => [
                'name' => 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                'display_name' => 'Mixtral 8x7B',
                'description' => 'Mistral\'s Mixtral 8x7B parameter model fine-tuned for instructions (requires approval)',
                'input_token_limit' => 32768,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'mistralai/Mistral-7B-Instruct-v0.2' => [
                'name' => 'mistralai/Mistral-7B-Instruct-v0.2',
                'display_name' => 'Mistral 7B v0.2',
                'description' => 'Mistral\'s 7B parameter model fine-tuned for instructions (v0.2) (requires approval)',
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            
            // Gemma models
            'google/gemma-7b-it' => [
                'name' => 'google/gemma-7b-it',
                'display_name' => 'Gemma 7B-IT',
                'description' => 'Google\'s Gemma 7B instruction-tuned model (requires approval)',
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'google/gemma-2b-it' => [
                'name' => 'google/gemma-2b-it',
                'display_name' => 'Gemma 2B-IT',
                'description' => 'Google\'s Gemma 2B instruction-tuned model (requires approval)',
                'input_token_limit' => 8192,
                'output_token_limit' => 2048,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            
            // Falcon models
            'tiiuae/falcon-7b-instruct' => [
                'name' => 'tiiuae/falcon-7b-instruct',
                'display_name' => 'Falcon 7B',
                'description' => 'TII UAE\'s Falcon 7B instruction-tuned model (requires approval)',
                'input_token_limit' => 2048,
                'output_token_limit' => 1024,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            
            // BLOOMZ models
            'bigscience/bloomz-7b1' => [
                'name' => 'bigscience/bloomz-7b1',
                'display_name' => 'BLOOMZ 7B',
                'description' => 'BigScience\'s multilingual BLOOMZ 7B model (requires approval)',
                'input_token_limit' => 2048,
                'output_token_limit' => 1024,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            
            // Specialized Multimodal models
            'microsoft/phi-2' => [
                'name' => 'microsoft/phi-2',
                'display_name' => 'Phi-2',
                'description' => 'Microsoft\'s 2.7B parameter language model with strong reasoning abilities',
                'input_token_limit' => 2048,
                'output_token_limit' => 1024,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'Salesforce/codegen25-7b-instruct' => [
                'name' => 'Salesforce/codegen25-7b-instruct',
                'display_name' => 'CodeGen 2.5 7B',
                'description' => 'Salesforce\'s CodeGen 2.5 7B model optimized for code generation (requires approval)',
                'input_token_limit' => 2048,
                'output_token_limit' => 1024,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
        ];
    }
    
    /**
     * Get a list of free tier models that are widely accessible
     * 
     * @return array
     */
    protected function getFreeTierModels(): array
    {
        return [
            'google/flan-t5-small' => [
                'name' => 'google/flan-t5-small',
                'display_name' => 'Flan-T5 Small',
                'description' => 'Google\'s smaller Flan-T5 model - free and widely accessible',
                'input_token_limit' => 512,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'facebook/bart-large-cnn' => [
                'name' => 'facebook/bart-large-cnn',
                'display_name' => 'BART CNN',
                'description' => 'BART model fine-tuned on CNN Daily Mail - free and accessible',
                'input_token_limit' => 1024,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'gpt2' => [
                'name' => 'gpt2',
                'display_name' => 'GPT-2',
                'description' => 'OpenAI\'s GPT-2 model - free and widely accessible',
                'input_token_limit' => 1024,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'distilbert-base-uncased' => [
                'name' => 'distilbert-base-uncased',
                'display_name' => 'DistilBERT Base',
                'description' => 'Smaller, faster version of BERT - free and widely accessible',
                'input_token_limit' => 512,
                'output_token_limit' => 512,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'EleutherAI/gpt-neo-125m' => [
                'name' => 'EleutherAI/gpt-neo-125m',
                'display_name' => 'GPT-Neo 125M',
                'description' => 'EleutherAI\'s smaller GPT-Neo model - free and accessible',
                'input_token_limit' => 2048,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'bigscience/bloom-560m' => [
                'name' => 'bigscience/bloom-560m',
                'display_name' => 'BLOOM 560M',
                'description' => 'BigScience\'s BLOOM 560M model - free and accessible',
                'input_token_limit' => 1024,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            't5-small' => [
                'name' => 't5-small',
                'display_name' => 'T5 Small',
                'description' => 'Google\'s T5 small model - free and accessible',
                'input_token_limit' => 512,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'sentence-transformers/all-MiniLM-L6-v2' => [
                'name' => 'sentence-transformers/all-MiniLM-L6-v2',
                'display_name' => 'MiniLM L6 v2',
                'description' => 'Efficient model for sentence embeddings - free and accessible',
                'input_token_limit' => 256,
                'output_token_limit' => 256,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
        ];
    }
    
    /**
     * Update model settings with discovered models
     * 
     * @param AIModel $model
     * @param array $discoveredModels
     * @return void
     */
    protected function updateModelSettings(AIModel $model, array $discoveredModels): void
    {
        $settings = $model->settings ?? [];
        $settings['available_models'] = $discoveredModels;
        
        // Set default model if not already set
        if (empty($settings['model_name']) || !isset($discoveredModels[$settings['model_name']])) {
            $defaultModel = $this->getConfig()['default_model'] ?? 'meta-llama/Llama-2-70b-chat-hf';
            $settings['model_name'] = isset($discoveredModels[$defaultModel]) ? $defaultModel : array_key_first($discoveredModels);
        }
        
        $model->settings = $settings;
        $model->save();
    }
    
    /**
     * Get model name with validation
     * 
     * @param AIModel $model
     * @return string
     */
    protected function getValidModelName(AIModel $model): string
    {
        $settings = $model->settings ?? [];
        $modelName = $settings['model_name'] ?? null;
        
        // Check if model exists in available models
        $availableModels = $settings['available_models'] ?? [];
        
        if ($modelName && isset($availableModels[$modelName])) {
            return $modelName;
        }
        
        // Get default from config
        $defaultModel = $this->getConfig()['default_model'] ?? 'meta-llama/Llama-2-70b-chat-hf';
        
        // If default exists in available models, use it
        if (!empty($availableModels) && isset($availableModels[$defaultModel])) {
            return $defaultModel;
        }
        
        // Otherwise use first available model or fallback to default
        return !empty($availableModels) ? array_key_first($availableModels) : $defaultModel;
    }
    
    /**
     * Get provider capabilities
     * 
     * @return array
     */
    public function getCapabilities(): array
    {
        return [
            'streaming' => false,
            'function_calling' => false,
            'vision' => false,
            'embeddings' => true,
            'max_context_length' => 8192,
        ];
    }
}
