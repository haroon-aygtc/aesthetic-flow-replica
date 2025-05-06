<?php

namespace App\Services\AI\Providers;

use App\Models\AIModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Services\AI\AbstractProvider;

class GrokProvider extends AbstractProvider
{
    /**
     * Get provider name
     * 
     * @return string
     */
    protected function getProviderName(): string
    {
        return 'grok';
    }
    
    /**
     * Process a message using Grok
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
            
            // Format messages for Grok (similar to OpenAI format)
            $formattedMessages = [];
            foreach ($messages as $message) {
                $formattedMessages[] = [
                    'role' => $message['role'],
                    'content' => $message['content'],
                ];
            }
            
            $payload = [
                'model' => $modelName,
                'messages' => $formattedMessages,
                'temperature' => $temperature,
                'max_tokens' => $maxTokens,
            ];
            
            $response = $this->makeRequest('post', '/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $model->api_key,
                    'Content-Type' => 'application/json',
                ],
                'data' => $payload,
            ]);
            
            return [
                'content' => $response['choices'][0]['message']['content'] ?? 'No response content',
                'metadata' => [
                    'model' => $modelName,
                    'provider' => $this->getProviderName(),
                    'finish_reason' => $response['choices'][0]['finish_reason'] ?? null,
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Grok API error: " . $e->getMessage(), [
                'model_id' => $model->id,
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Test connection to Grok
     * 
     * @param AIModel $model
     * @return array
     */
    public function testConnection(AIModel $model): array
    {
        try {
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
                'message' => 'Successfully connected to Grok API',
                'data' => [
                    'available_models' => array_keys($discoveredModels),
                ],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Grok connection test failed: ' . $e->getMessage(),
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
            Log::error("Failed to discover Grok models: " . $e->getMessage());
            
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
        
        foreach ($response['data'] ?? [] as $model) {
            $modelId = $model['id'] ?? '';
            
            if (empty($modelId)) {
                continue;
            }
            
            $models[$modelId] = [
                'name' => $modelId,
                'display_name' => $model['name'] ?? $modelId,
                'description' => $model['description'] ?? '',
                'input_token_limit' => $model['context_length'] ?? 0,
                'output_token_limit' => $model['max_output_tokens'] ?? 0,
                'supported_features' => [
                    'streaming' => true,
                    'vision' => false,
                ],
            ];
        }
        
        // If no models found, add default model
        if (empty($models)) {
            $defaultModel = $this->getConfig()['default_model'] ?? 'grok-1';
            $models[$defaultModel] = [
                'name' => $defaultModel,
                'display_name' => 'Grok-1',
                'description' => 'Grok AI model',
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => true,
                    'vision' => false,
                ],
            ];
        }
        
        return $models;
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
            $defaultModel = $this->getConfig()['default_model'] ?? 'grok-1';
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
        $defaultModel = $this->getConfig()['default_model'] ?? 'grok-1';
        
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
            'max_context_length' => 8192,
        ];
    }
}
