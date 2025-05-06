<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ProviderRegistry
{
    /**
     * Registered providers
     * 
     * @var array
     */
    protected $providers = [];
    
    /**
     * Register a provider implementation
     * 
     * @param string $providerName
     * @param string $providerClass
     * @return void
     * @throws \InvalidArgumentException
     */
    public function register(string $providerName, string $providerClass): void
    {
        if (!class_exists($providerClass)) {
            throw new \InvalidArgumentException("Provider class {$providerClass} does not exist");
        }
        
        if (!is_subclass_of($providerClass, ProviderInterface::class)) {
            throw new \InvalidArgumentException("Provider class {$providerClass} must implement ProviderInterface");
        }
        
        $this->providers[$providerName] = $providerClass;
        
        // Clear provider cache
        Cache::forget('ai_providers_list');
    }
    
    /**
     * Get a provider instance by name
     * 
     * @param string $providerName
     * @return ProviderInterface|null
     */
    public function getProvider(string $providerName): ?ProviderInterface
    {
        $providerClass = $this->providers[$providerName] ?? null;
        
        if (!$providerClass) {
            Log::warning("Provider {$providerName} not found in registry");
            return null;
        }
        
        return app($providerClass);
    }
    
    /**
     * Get all registered providers
     * 
     * @return array
     */
    public function getAllProviders(): array
    {
        return $this->providers;
    }
    
    /**
     * Get provider capabilities
     * 
     * @param string $providerName
     * @return array
     */
    public function getProviderCapabilities(string $providerName): array
    {
        $provider = $this->getProvider($providerName);
        
        if (!$provider) {
            return [];
        }
        
        return $provider->getCapabilities();
    }
}
