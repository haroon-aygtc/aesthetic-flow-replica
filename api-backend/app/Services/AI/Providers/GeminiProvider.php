<?php

namespace App\Services\AI\Providers;

use App\Models\AIModel;
use App\Services\AI\AbstractProvider;
use Illuminate\Support\Facades\Log;

class GeminiProvider extends AbstractProvider
{
    /**
     * Get provider name
     * 
     * @return string
     */
    protected function getProviderName(): string
    {
        return 'gemini';
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
        $defaultModel = $this->getConfig()['default_model'] ?? 'gemini-1.5-pro';
        
        // If default exists in available models, use it
        if (!empty($availableModels) && isset($availableModels[$defaultModel])) {
            return $defaultModel;
        }
        
        // If we have available models, use the first one
        if (!empty($availableModels)) {
            return array_key_first($availableModels);
        }
        
        // Last resort: use config default
        return $defaultModel;
    }
    
    /**
     * Process a message using Gemini
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
            
            // Format messages for Gemini
            $contents = [];
            $systemPrompt = null;
            
            foreach ($messages as $message) {
                if ($message['role'] === 'system') {
                    $systemPrompt = $message['content'];
                } else {
                    $contents[] = [
                        'role' => $message['role'] === 'assistant' ? 'model' : 'user',
                        'parts' => [
                            ['text' => $message['content']]
                        ],
                    ];
                }
            }
            
            $payload = [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => $temperature,
                    'maxOutputTokens' => $maxTokens,
                ],
            ];
            
            // Add system instruction if present
            if ($systemPrompt) {
                $payload['systemInstruction'] = ['parts' => [['text' => $systemPrompt]]];
            }
            
            $endpoint = "/models/{$modelName}:generateContent";
            $apiKey = $model->api_key;
            
            $response = $this->makeRequest('post', $endpoint . "?key={$apiKey}", [
                'headers' => ['Content-Type' => 'application/json'],
                'data' => $payload,
            ]);
            
            return [
                'content' => $response['candidates'][0]['content']['parts'][0]['text'] ?? 'No response content',
                'metadata' => [
                    'model' => $modelName,
                    'provider' => $this->getProviderName(),
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Gemini processing error: " . $e->getMessage(), [
                'model_id' => $model->id,
                'model_name' => $model->name,
            ]);
            
            return [
                'content' => "I'm sorry, I encountered an error while processing your request. Please try again later.",
                'metadata' => [
                    'error' => $e->getMessage(),
                    'provider' => $this->getProviderName(),
                ],
            ];
        }
    }
    
    /**
     * Test connection to Gemini
     * 
     * @param AIModel $model
     * @return array
     */
    public function testConnection(AIModel $model): array
    {
        try {
            $apiKey = $model->api_key;
            $endpoint = "/models?key={$apiKey}";
            
            $response = $this->makeRequest('get', $endpoint);
            
            // Discover and update available models
            $discoveredModels = $this->parseModelsFromResponse($response);
            $this->updateModelSettings($model, $discoveredModels);
            
            return [
                'success' => true,
                'message' => 'Successfully connected to Google Gemini API',
                'data' => [
                    'available_models' => array_keys($discoveredModels),
                ],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Google Gemini connection test failed: ' . $e->getMessage(),
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
            $apiKey = $model->api_key;
            $endpoint = "/models?key={$apiKey}";
            
            $response = $this->makeRequest('get', $endpoint);
            $discoveredModels = $this->parseModelsFromResponse($response);
            
            // Update model settings
            $this->updateModelSettings($model, $discoveredModels);
            
            return [
                'success' => true,
                'models' => $discoveredModels,
            ];
        } catch (\Exception $e) {
            Log::error("Failed to discover Gemini models: " . $e->getMessage());
            
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
        $modelsList = $response['models'] ?? [];
        
        foreach ($modelsList as $model) {
            $name = $model['name'] ?? '';
            // Extract model name from path (e.g., "models/gemini-1.5-pro" -> "gemini-1.5-pro")
            $modelName = basename($name);
            
            // Only include models that support text generation
            $supportedMethods = $model['supportedGenerationMethods'] ?? [];
            if (!in_array('generateContent', $supportedMethods)) {
                continue;
            }
            
            $models[$modelName] = [
                'name' => $modelName,
                'display_name' => $model['displayName'] ?? $modelName,
                'description' => $model['description'] ?? '',
                'input_token_limit' => $model['inputTokenLimit'] ?? 0,
                'output_token_limit' => $model['outputTokenLimit'] ?? 0,
                'supported_features' => [
                    'streaming' => in_array('streamGenerateContent', $supportedMethods),
                    'vision' => $model['supportsMimeTypes'] ?? false,
                ],
            ];
        }
        
        return $models;
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
            'function_calling' => false,
            'vision' => true,
            'embeddings' => true,
            'max_context_length' => 32768,
        ];
    }
}
