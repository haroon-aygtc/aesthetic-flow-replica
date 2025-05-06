<?php

namespace App\Services\AI\Providers;

use App\Models\AIModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Services\AI\AbstractProvider;

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
                ],
            ];
            
            // Hugging Face API requires the model name in the URL
            $response = $this->makeRequest('post', "/{$modelName}", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $model->api_key,
                    'Content-Type' => 'application/json',
                ],
                'data' => $payload,
            ]);
            
            // Hugging Face returns an array of generated texts
            $generatedText = $response[0]['generated_text'] ?? 'No response content';
            
            return [
                'content' => $generatedText,
                'metadata' => [
                    'model' => $modelName,
                    'provider' => $this->getProviderName(),
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Hugging Face API error: " . $e->getMessage(), [
                'model_id' => $model->id,
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
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
            $modelName = $this->getValidModelName($model);
            
            // Hugging Face doesn't have a dedicated endpoint for testing connections
            // We'll use a simple model info request instead
            $response = $this->makeRequest('get', "/{$modelName}", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $model->api_key,
                ],
            ]);
            
            // If we get here, the connection was successful
            return [
                'success' => true,
                'message' => 'Successfully connected to Hugging Face API',
                'data' => [
                    'model_info' => $response,
                ],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Hugging Face connection test failed: ' . $e->getMessage(),
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
            // Hugging Face doesn't have a simple API to list all available models
            // We'll use a predefined list of popular models instead
            $discoveredModels = $this->getPopularModels();
            
            // Update model settings
            $this->updateModelSettings($model, $discoveredModels);
            
            return [
                'success' => true,
                'models' => $discoveredModels,
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
     * Get a list of popular Hugging Face models
     * 
     * @return array
     */
    protected function getPopularModels(): array
    {
        return [
            'meta-llama/Llama-2-70b-chat-hf' => [
                'name' => 'meta-llama/Llama-2-70b-chat-hf',
                'display_name' => 'Llama 2 70B',
                'description' => 'Meta\'s Llama 2 70B parameter model fine-tuned for chat',
                'input_token_limit' => 4096,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'meta-llama/Llama-3-70b-chat-hf' => [
                'name' => 'meta-llama/Llama-3-70b-chat-hf',
                'display_name' => 'Llama 3 70B',
                'description' => 'Meta\'s Llama 3 70B parameter model fine-tuned for chat',
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'supported_features' => [
                    'streaming' => false,
                    'vision' => false,
                ],
            ],
            'mistralai/Mixtral-8x7B-Instruct-v0.1' => [
                'name' => 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                'display_name' => 'Mixtral 8x7B',
                'description' => 'Mistral\'s Mixtral 8x7B parameter model fine-tuned for instructions',
                'input_token_limit' => 32768,
                'output_token_limit' => 4096,
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
