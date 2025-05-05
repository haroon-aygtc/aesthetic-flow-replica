
<?php
namespace App\Services;

use App\Models\AIModel;
use App\Services\Providers\AIProvider;
use App\Services\Providers\OpenAIProvider;
use App\Services\Providers\AnthropicProvider;
use App\Services\Providers\GeminiProvider;
use Illuminate\Support\Facades\Log;

class AIService
{
    /**
     * Process a message with the appropriate AI model.
     *
     * @param  array  $messages
     * @param  \App\Models\AIModel|null  $aiModel
     * @param  array|null  $widgetSettings
     * @return array
     */
    public function processMessage(array $messages, ?AIModel $aiModel = null, ?array $widgetSettings = null)
    {
        // If no specific AI model is provided, use the default one
        if (!$aiModel) {
            $aiModel = AIModel::where('is_default', true)->first();

            // If still no AI model, return an error message
            if (!$aiModel) {
                return [
                    'content' => 'Sorry, no AI model is currently configured. Please contact support.',
                    'metadata' => ['error' => 'no_ai_model_configured'],
                ];
            }
        }

        // Get model settings with fallbacks
        $modelSettings = $aiModel->settings ?? [];
        $temperature = $modelSettings['temperature'] ?? 0.7;
        $maxTokens = $modelSettings['max_tokens'] ?? 500;

        try {
            // Get the appropriate provider
            $provider = $this->getProviderForModel($aiModel);
            
            // Process the message with the provider
            return $provider->processMessage($aiModel, $messages, $temperature, $maxTokens, $widgetSettings);
        } catch (\Exception $e) {
            Log::error('AI processing error: ' . $e->getMessage(), [
                'provider' => $aiModel->provider,
                'error' => $e->getMessage(),
            ]);

            return [
                'content' => 'Sorry, I encountered an error while processing your request. Please try again later.',
                'metadata' => ['error' => $e->getMessage()],
            ];
        }
    }
    
    /**
     * Get the appropriate AI provider for the given model.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @return \App\Services\Providers\AIProvider
     * @throws \Exception
     */
    private function getProviderForModel(AIModel $aiModel): AIProvider
    {
        switch ($aiModel->provider) {
            case 'openai':
                return new OpenAIProvider();
                
            case 'anthropic':
                return new AnthropicProvider();
                
            case 'gemini':
                return new GeminiProvider();
                
            default:
                throw new \Exception("Unsupported AI provider: {$aiModel->provider}");
        }
    }
}
