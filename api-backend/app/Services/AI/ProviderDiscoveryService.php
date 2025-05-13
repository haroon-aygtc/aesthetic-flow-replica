<?php

namespace App\Services\AI;

use App\Models\AIProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProviderDiscoveryService
{
    /**
     * Discover models for a provider
     * 
     * @param AIProvider $provider
     * @param string $apiKey
     * @return array
     * @throws \Exception
     */
    public function discoverModels(AIProvider $provider, string $apiKey)
    {
        $method = 'discover' . ucfirst($provider->slug) . 'Models';
        
        if (method_exists($this, $method)) {
            return $this->$method($apiKey, $provider->api_base_url);
        }
        
        throw new \Exception("Model discovery not supported for {$provider->name}");
    }
    
    /**
     * Discover OpenAI models
     * 
     * @param string $apiKey
     * @param string|null $baseUrl
     * @return array
     * @throws \Exception
     */
    protected function discoverOpenaiModels(string $apiKey, ?string $baseUrl = null)
    {
        $url = $baseUrl ?? 'https://api.openai.com/v1/models';
        
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json'
        ])->get($url);
        
        if (!$response->successful()) {
            throw new \Exception("API error: " . $response->body());
        }
        
        $data = $response->json();
        $models = [];
        
        foreach ($data['data'] as $model) {
            // Filter for chat models
            if (strpos($model['id'], 'gpt') !== false) {
                $models[] = [
                    'id' => $model['id'],
                    'name' => $this->formatModelName($model['id']),
                    'description' => $this->getModelDescription($model['id']),
                    'context_length' => $this->getModelContextLength($model['id']),
                    'capabilities' => $this->getModelCapabilities($model['id']),
                    'is_free' => strpos($model['id'], '3.5') !== false,
                    'is_restricted' => strpos($model['id'], 'gpt-4') !== false && strpos($model['id'], 'preview') !== false
                ];
            }
        }
        
        return $models;
    }
    
    /**
     * Discover Anthropic models
     * 
     * @param string $apiKey
     * @param string|null $baseUrl
     * @return array
     * @throws \Exception
     */
    protected function discoverAnthropicModels(string $apiKey, ?string $baseUrl = null)
    {
        // Anthropic doesn't have a models endpoint, so we return hardcoded models
        return [
            [
                'id' => 'claude-3-opus-20240229',
                'name' => 'Claude 3 Opus',
                'description' => 'Most capable Claude model for complex tasks',
                'context_length' => 100000,
                'capabilities' => ['chat', 'vision'],
                'is_free' => false,
                'is_restricted' => false
            ],
            [
                'id' => 'claude-3-sonnet-20240229',
                'name' => 'Claude 3 Sonnet',
                'description' => 'Balanced model for most tasks',
                'context_length' => 100000,
                'capabilities' => ['chat', 'vision'],
                'is_free' => false,
                'is_restricted' => false
            ],
            [
                'id' => 'claude-3-haiku-20240307',
                'name' => 'Claude 3 Haiku',
                'description' => 'Fast and efficient model for simpler tasks',
                'context_length' => 100000,
                'capabilities' => ['chat', 'vision'],
                'is_free' => false,
                'is_restricted' => false
            ]
        ];
    }
    
    /**
     * Discover Google models
     * 
     * @param string $apiKey
     * @param string|null $baseUrl
     * @return array
     * @throws \Exception
     */
    protected function discoverGeminiModels(string $apiKey, ?string $baseUrl = null)
    {
        // Google doesn't have a public models endpoint, so we return hardcoded models
        return [
            [
                'id' => 'gemini-1.5-pro',
                'name' => 'Gemini 1.5 Pro',
                'description' => 'Advanced multimodal model with long context',
                'context_length' => 1000000,
                'capabilities' => ['chat', 'vision', 'code'],
                'is_free' => false,
                'is_restricted' => false
            ],
            [
                'id' => 'gemini-1.5-flash',
                'name' => 'Gemini 1.5 Flash',
                'description' => 'Fast and efficient model for most tasks',
                'context_length' => 1000000,
                'capabilities' => ['chat', 'vision', 'code'],
                'is_free' => false,
                'is_restricted' => false
            ],
            [
                'id' => 'gemini-1.0-pro',
                'name' => 'Gemini 1.0 Pro',
                'description' => 'Balanced model for most tasks',
                'context_length' => 32000,
                'capabilities' => ['chat', 'vision', 'code'],
                'is_free' => true,
                'is_restricted' => false
            ]
        ];
    }
    
    /**
     * Format model ID to display name
     * 
     * @param string $modelId
     * @return string
     */
    protected function formatModelName($modelId)
    {
        // Format model ID to display name
        // e.g., "gpt-4-turbo" -> "GPT-4 Turbo"
        $name = ucfirst(str_replace(['-', '.'], [' ', ' '], $modelId));
        
        // Special case formatting
        $name = preg_replace('/\bgpt\b/i', 'GPT', $name);
        $name = preg_replace('/\bgpt(\d+)\b/i', 'GPT-$1', $name);
        
        return $name;
    }
    
    /**
     * Get model description based on model ID
     * 
     * @param string $modelId
     * @return string
     */
    protected function getModelDescription($modelId)
    {
        // Return appropriate description based on model ID
        if (strpos($modelId, 'gpt-4') !== false) {
            if (strpos($modelId, 'turbo') !== false) {
                return 'Fastest version of GPT-4 with improved instruction following';
            }
            if (strpos($modelId, 'vision') !== false) {
                return 'GPT-4 with image understanding capabilities';
            }
            return 'Advanced reasoning, complex tasks, and specialized knowledge';
        }
        
        if (strpos($modelId, 'gpt-3.5') !== false) {
            if (strpos($modelId, 'turbo') !== false) {
                return 'Fast and cost-effective for everyday tasks';
            }
            return 'Balanced model for most tasks';
        }
        
        return 'AI language model';
    }
    
    /**
     * Get model context length based on model ID
     * 
     * @param string $modelId
     * @return int
     */
    protected function getModelContextLength($modelId)
    {
        // Return appropriate context length based on model ID
        if (strpos($modelId, 'gpt-4o') !== false) {
            return 128000;
        }
        
        if (strpos($modelId, 'gpt-4-turbo') !== false) {
            return 128000;
        }
        
        if (strpos($modelId, 'gpt-4-32k') !== false) {
            return 32768;
        }
        
        if (strpos($modelId, 'gpt-4') !== false) {
            return 8192;
        }
        
        if (strpos($modelId, 'gpt-3.5-turbo-16k') !== false) {
            return 16384;
        }
        
        if (strpos($modelId, 'gpt-3.5') !== false) {
            return 4096;
        }
        
        return 2048;
    }
    
    /**
     * Get model capabilities based on model ID
     * 
     * @param string $modelId
     * @return array
     */
    protected function getModelCapabilities($modelId)
    {
        // Return capabilities based on model ID
        $capabilities = ['chat'];
        
        if (strpos($modelId, 'vision') !== false || strpos($modelId, 'gpt-4o') !== false) {
            $capabilities[] = 'vision';
        }
        
        if (strpos($modelId, 'gpt-4') !== false) {
            $capabilities[] = 'function_calling';
            $capabilities[] = 'json_mode';
        }
        
        return $capabilities;
    }
} 