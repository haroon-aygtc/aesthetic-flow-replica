<?php

namespace App\Services\AI;

use App\Models\AIModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

abstract class AbstractProvider implements ProviderInterface
{
    /**
     * Provider configuration
     * 
     * @return array
     */
    protected function getConfig(): array
    {
        return config('ai.providers.' . $this->getProviderName(), []);
    }
    
    /**
     * Get provider name
     * 
     * @return string
     */
    abstract protected function getProviderName(): string;
    
    /**
     * Get API base URL
     * 
     * @return string
     */
    protected function getBaseUrl(): string
    {
        return $this->getConfig()['base_url'] ?? '';
    }
    
    /**
     * Make an API request with error handling and retries
     * 
     * @param string $method HTTP method
     * @param string $endpoint API endpoint
     * @param array $options Request options
     * @return array|null Response data
     * @throws \Exception
     */
    protected function makeRequest(string $method, string $endpoint, array $options = [])
    {
        $baseUrl = $this->getBaseUrl();
        $url = $baseUrl . $endpoint;
        $maxRetries = $options['max_retries'] ?? $this->getConfig()['retry_attempts'] ?? 3;
        $retryDelay = $options['retry_delay'] ?? 1000; // ms
        
        $headers = $options['headers'] ?? [];
        $data = $options['data'] ?? [];
        
        $attempt = 0;
        
        while ($attempt < $maxRetries) {
            try {
                $response = Http::withHeaders($headers)
                    ->timeout($options['timeout'] ?? $this->getConfig()['timeout'] ?? 30)
                    ->$method($url, $data);
                
                if ($response->successful()) {
                    return $response->json();
                }
                
                // Handle rate limiting
                if ($response->status() === 429) {
                    $retryAfter = $response->header('Retry-After', 1);
                    sleep((int)$retryAfter);
                    $attempt++;
                    continue;
                }
                
                // Handle server errors
                if ($response->serverError()) {
                    Log::warning("Server error from {$this->getProviderName()} API", [
                        'status' => $response->status(),
                        'body' => $response->body(),
                        'attempt' => $attempt + 1,
                    ]);
                    
                    $attempt++;
                    usleep($retryDelay * 1000 * ($attempt)); // Exponential backoff
                    continue;
                }
                
                // Client errors are likely not recoverable
                if ($response->clientError()) {
                    Log::error("Client error from {$this->getProviderName()} API", [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                    
                    throw new \Exception("API error: " . $response->body());
                }
            } catch (\Exception $e) {
                if ($attempt >= $maxRetries - 1) {
                    throw $e;
                }
                
                Log::warning("Exception during {$this->getProviderName()} API request", [
                    'exception' => $e->getMessage(),
                    'attempt' => $attempt + 1,
                ]);
                
                $attempt++;
                usleep($retryDelay * 1000 * ($attempt));
            }
        }
        
        throw new \Exception("Max retries exceeded for {$this->getProviderName()} API request");
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
        
        // If current model_name is invalid, update to a valid one
        if (!empty($discoveredModels)) {
            $currentModelName = $settings['model_name'] ?? null;
            
            if (!$currentModelName || !isset($discoveredModels[$currentModelName])) {
                // Find default model from config
                $defaultModel = $this->getConfig()['default_model'] ?? null;
                
                // If default model exists in discovered models, use it
                if ($defaultModel && isset($discoveredModels[$defaultModel])) {
                    $settings['model_name'] = $defaultModel;
                } else {
                    // Otherwise use the first available model
                    $settings['model_name'] = array_key_first($discoveredModels);
                }
                
                Log::info("Updated model_name for {$model->name} to {$settings['model_name']}");
            }
        }
        
        $model->settings = $settings;
        $model->save();
    }
    
    /**
     * Cache model capabilities
     * 
     * @param AIModel $model
     * @param array $capabilities
     * @return void
     */
    protected function cacheModelCapabilities(AIModel $model, array $capabilities): void
    {
        $cacheKey = "ai_model_{$model->id}_capabilities";
        $cacheTtl = now()->addDay(); // Cache for 24 hours
        
        Cache::put($cacheKey, $capabilities, $cacheTtl);
    }
    
    /**
     * Get cached model capabilities
     * 
     * @param AIModel $model
     * @return array|null
     */
    protected function getCachedModelCapabilities(AIModel $model): ?array
    {
        $cacheKey = "ai_model_{$model->id}_capabilities";
        return Cache::get($cacheKey);
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
            'embeddings' => false,
            'max_context_length' => 4096,
        ];
    }
}
