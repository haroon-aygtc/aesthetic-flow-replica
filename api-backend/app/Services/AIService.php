
<?php
namespace App\Services;

use App\Models\AIModel;
use App\Models\ModelUsageLog;
use App\Services\Providers\AIProvider;
use App\Services\Providers\OpenAIProvider;
use App\Services\Providers\AnthropicProvider;
use App\Services\Providers\GeminiProvider;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected $modelSelector;

    public function __construct(AIModelSelector $modelSelector)
    {
        $this->modelSelector = $modelSelector;
    }

    /**
     * Process a message with the appropriate AI model.
     *
     * @param  array  $messages
     * @param  \App\Models\AIModel|null  $aiModel
     * @param  array|null  $widgetSettings
     * @param  array|null  $context
     * @return array
     */
    public function processMessage(array $messages, ?AIModel $aiModel = null, ?array $widgetSettings = null, ?array $context = null)
    {
        $startTime = microtime(true);
        $context = $context ?? [];
        $context['widget_settings'] = $widgetSettings;
        
        // If no specific AI model is provided, use the selector to find the best one
        if (!$aiModel) {
            $aiModel = $this->modelSelector->selectModel($context);

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
        $confidenceThreshold = $aiModel->confidence_threshold ?? 0.7;

        // Get the fallback chain for this model
        $fallbackChain = $this->modelSelector->getFallbackChain($aiModel);
        $usedFallback = false;
        $lastError = null;
        $tokensInput = $this->countTokens($messages);
        $tokensOutput = 0;
        $confidenceScore = null;

        // Try each model in the fallback chain
        foreach ($fallbackChain as $model) {
            try {
                // Get the appropriate provider
                $provider = $this->getProviderForModel($model);
                
                // Process the message with the provider
                $response = $provider->processMessage($model, $messages, $temperature, $maxTokens, $widgetSettings);
                
                // Estimate token count for output
                $tokensOutput = $this->countTokens([$response['content']]);
                
                // Extract or calculate confidence score
                $confidenceScore = $response['metadata']['confidence'] ?? 1.0;
                
                // Check if the response meets the confidence threshold
                if ($confidenceScore >= $confidenceThreshold) {
                    // Log the successful response
                    $this->logModelUsage(
                        $model->id,
                        $context['user_id'] ?? null,
                        $context['tenant_id'] ?? null,
                        $context['widget_id'] ?? null,
                        $context['query_type'] ?? null,
                        $context['use_case'] ?? null,
                        $tokensInput,
                        $tokensOutput,
                        microtime(true) - $startTime,
                        $confidenceScore,
                        $usedFallback,
                        true,
                        null
                    );
                    
                    return $response;
                }
                
                // If we're here, response didn't meet confidence threshold
                $usedFallback = true;
                $lastError = "Response didn't meet confidence threshold of {$confidenceThreshold}";
                
            } catch (\Exception $e) {
                Log::error("AI processing error with {$model->provider}: " . $e->getMessage());
                $usedFallback = true;
                $lastError = $e->getMessage();
            }
        }

        // Log the failed attempt
        $this->logModelUsage(
            $aiModel->id,
            $context['user_id'] ?? null,
            $context['tenant_id'] ?? null,
            $context['widget_id'] ?? null,
            $context['query_type'] ?? null,
            $context['use_case'] ?? null,
            $tokensInput,
            $tokensOutput,
            microtime(true) - $startTime,
            $confidenceScore,
            $usedFallback,
            false,
            $lastError
        );

        return [
            'content' => 'Sorry, I encountered an error while processing your request. Please try again later.',
            'metadata' => ['error' => $lastError],
        ];
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

    /**
     * Log the AI model usage
     *
     * @param int $modelId
     * @param int|null $userId
     * @param int|null $tenantId
     * @param int|null $widgetId
     * @param string|null $queryType
     * @param string|null $useCase
     * @param int $tokensInput
     * @param int $tokensOutput
     * @param float $responseTime
     * @param float|null $confidenceScore
     * @param bool $fallbackUsed
     * @param bool $success
     * @param string|null $errorMessage
     * @return void
     */
    private function logModelUsage(
        $modelId,
        $userId,
        $tenantId,
        $widgetId,
        $queryType,
        $useCase,
        $tokensInput,
        $tokensOutput,
        $responseTime,
        $confidenceScore,
        $fallbackUsed,
        $success,
        $errorMessage
    ) {
        try {
            ModelUsageLog::create([
                'model_id' => $modelId,
                'user_id' => $userId,
                'tenant_id' => $tenantId,
                'widget_id' => $widgetId,
                'query_type' => $queryType,
                'use_case' => $useCase,
                'tokens_input' => $tokensInput,
                'tokens_output' => $tokensOutput,
                'response_time' => $responseTime,
                'confidence_score' => $confidenceScore,
                'fallback_used' => $fallbackUsed,
                'success' => $success,
                'error_message' => $errorMessage,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log model usage: ' . $e->getMessage());
        }
    }

    /**
     * Simple token counter (estimate)
     * 
     * @param array $messages
     * @return int
     */
    private function countTokens(array $messages): int
    {
        $text = '';
        
        foreach ($messages as $message) {
            if (is_array($message) && isset($message['content'])) {
                $text .= $message['content'] . ' ';
            } elseif (is_string($message)) {
                $text .= $message . ' ';
            }
        }
        
        // Very rough approximation: 1 token ≈ 4 characters
        return (int)ceil(strlen($text) / 4);
    }
}
