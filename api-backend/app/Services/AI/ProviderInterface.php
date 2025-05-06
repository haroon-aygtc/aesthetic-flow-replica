<?php

namespace App\Services\AI;

use App\Models\AIModel;

interface ProviderInterface
{
    /**
     * Process a message using this provider
     * 
     * @param AIModel $model The AI model configuration
     * @param array $messages Array of messages to process
     * @param array $options Additional options for processing
     * @return array Response with content and metadata
     */
    public function processMessage(AIModel $model, array $messages, array $options = []);
    
    /**
     * Test connection to the provider
     * 
     * @param AIModel $model The AI model configuration
     * @return array Result of the connection test
     */
    public function testConnection(AIModel $model): array;
    
    /**
     * Discover available models from the provider
     * 
     * @param AIModel $model The AI model configuration
     * @return array Available models and their capabilities
     */
    public function discoverModels(AIModel $model): array;
    
    /**
     * Get provider capabilities
     * 
     * @return array Provider capabilities
     */
    public function getCapabilities(): array;
}
