<?php

namespace App\Services\AI\Providers;

use App\Models\AIModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Services\AI\AbstractProvider;

class CohereProvider extends AbstractProvider
{
    /**
     * Get provider name
     * 
     * @return string
     */
    protected function getProviderName(): string
    {
        return 'cohere';
    }
    
    /**
     * Process a message using Cohere
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
            
            // Format messages for Cohere
            // Cohere uses a different format than OpenAI
            $chatHistory = [];
            $message = '';
            
            foreach ($messages as $index => $msg) {
                // The last user message becomes the main message
                if ($index == count($messages) - 1 && $msg['role'] === 'user') {
                    $message = $msg['content'];
                } else {
                    // Previous messages go into chat history
                    $chatHistory[] = [
                        'role' => $msg['role'] === 'assistant' ? 'CHATBOT' : 'USER',
                        'message' => $msg['content'],
                    ];
                }
            }
            
            $payload = [
                'model' => $modelName,
                'message' => $message,
                'temperature' => $temperature,
                'max_tokens' => $maxTokens,
                'chat_history' => $chatHistory,
            ];
            
            // Add system prompt if available
            $systemPrompt = $this->extractSystemPrompt($messages);
            if ($systemPrompt) {
                $payload['preamble'] = $systemPrompt;
            }
            
            $response = $this->makeRequest('post', '/chat', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $model->api_key,
                    'Content-Type' => 'application/json',
                ],
                'data' => $payload,
            ]);
            
            return [
                'content' => $response['text'] ?? 'No response content',
                'metadata' => [
                    'model' => $modelName,
                    'provider' => $this->getProviderName(),
                    'finish_reason' => $response['finish_reason'] ?? null,
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Cohere API error: " . $e->getMessage(), [
                'model_id' => $model->id,
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Extract system prompt from messages
     * 
     * @param array $messages
     * @return string|null
     */
    protected function extractSystemPrompt(array $messages): ?string
    {
        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                return $message['content'];
            }
        }
        
        return null;
    }
    
    /**
     * Test connection to Cohere
     * 
     * @param AIModel $model
     * @return array
     */
    public function testConnection(AIModel $model): array
    {
        try {
            // Cohere doesn't have a dedicated endpoint for testing connections
            // We'll use a simple model info request instead
            $response = $this->makeRequest('get', '/models', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $model->api_key,
                    'Content-Type' => 'application/json',
                ],
            ]);
            
            // Discover and update available models
            $discoveredModels = $this->parseModelsFromResponse($response);
            $this->updateModelSettings($model, $discoveredModels);
            
            return [
                'success' => true,
                'message' => 'Successfully connected to Cohere API',
                'data' => [
                    'available_models' => array_keys($discoveredModels),
                ],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Cohere connection test failed: ' . $e->getMessage(),
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
            $response = $this->makeRequest('get', '/models', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $model->api_key,
                    'Content-Type' => 'application/json',
                ],
            ]);
            
            $discoveredModels = $this->parseModelsFromResponse($response);
            
            // Update model settings
            $this->updateModelSettings($model, $discoveredModels);
            
            return [
                'success' => true,
                'models' => $discoveredModels,
            ];
        } catch (\Exception $e) {
            Log::error("Failed to discover Cohere models: " . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Parse models from API response
     * 
     * @param array $response
     * @return array
     */
    protected function parseModelsFromResponse(array $response): array
    {
        $models = [];
        
        foreach ($response['models'] ?? [] as $model) {
            if (isset($model['name']) && strpos($model['name'], 'command') !== false) {
                $modelId = $model['name'];
                
                $models[$modelId] = [
                    'name' => $modelId,
                    'display_name' => $model['display_name'] ?? $modelId,
                    'description' => $model['description'] ?? '',
                    'input_token_limit' => $model['context_window'] ?? 4096,
                    'output_token_limit' => $model['max_tokens'] ?? 2048,
                    'supported_features' => [
                        'streaming' => true,
                        'vision' => false,
                    ],
                ];
            }
        }
        
        // If no models found, add default models
        if (empty($models)) {
            $models = $this->getDefaultModels();
        }
        
        return $models;
    }
    
    /**
     * Get default models when API doesn't return any
     * 
     * @return array
     */
    protected function getDefaultModels(): array
    {
        return [
            'command' => [
                'name' => 'command',
                'display_name' => 'Command',
                'description' => 'Cohere\'s flagship model for chat and text generation',
                'input_token_limit' => 4096,
                'output_token_limit' => 2048,
                'supported_features' => [
                    'streaming' => true,
                    'vision' => false,
                ],
            ],
            'command-light' => [
                'name' => 'command-light',
                'display_name' => 'Command Light',
                'description' => 'Lighter and faster version of Command',
                'input_token_limit' => 4096,
                'output_token_limit' => 2048,
                'supported_features' => [
                    'streaming' => true,
                    'vision' => false,
                ],
            ],
            'command-r' => [
                'name' => 'command-r',
                'display_name' => 'Command R',
                'description' => 'Cohere\'s most advanced model with reasoning capabilities',
                'input_token_limit' => 128000,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => true,
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
            $defaultModel = $this->getConfig()['default_model'] ?? 'command';
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
        $defaultModel = $this->getConfig()['default_model'] ?? 'command';
        
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
            'streaming' => true,
            'function_calling' => true,
            'vision' => false,
            'embeddings' => true,
            'max_context_length' => 128000, // Command-R has a large context window
        ];
    }
}
