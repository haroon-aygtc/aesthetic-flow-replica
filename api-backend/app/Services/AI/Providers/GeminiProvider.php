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
            // Validate API key
            $apiKey = $model->api_key;
            if (empty($apiKey)) {
                throw new \Exception("Gemini API key is not configured");
            }

            $modelName = $this->getValidModelName($model);
            $temperature = $options['temperature'] ?? $model->settings['temperature'] ?? 0.7;
            $maxTokens = $options['max_tokens'] ?? $model->settings['max_tokens'] ?? 2048;

            Log::debug("Processing message with Gemini model: {$modelName}");

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

            // Ensure we have at least one message
            if (empty($contents)) {
                $contents[] = [
                    'role' => 'user',
                    'parts' => [
                        ['text' => 'Hello']
                    ],
                ];

                Log::warning("No valid messages provided to Gemini, using default greeting");
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

            // Use increased timeout and retry settings for content generation
            $response = $this->makeRequest('post', $endpoint . "?key={$apiKey}", [
                'headers' => ['Content-Type' => 'application/json'],
                'data' => $payload,
                'timeout' => $options['timeout'] ?? $this->getConfig()['timeout'] ?? 60,
                'max_retries' => $options['max_retries'] ?? $this->getConfig()['retry_attempts'] ?? 5,
                'retry_delay' => $options['retry_delay'] ?? $this->getConfig()['retry_delay'] ?? 2000,
            ]);

            // Validate response structure
            if (!isset($response['candidates']) || empty($response['candidates'])) {
                Log::warning("Unexpected Gemini API response structure", ['response' => $response]);
                throw new \Exception("Unexpected response from Gemini API: Missing candidates");
            }

            if (!isset($response['candidates'][0]['content']) ||
                !isset($response['candidates'][0]['content']['parts']) ||
                empty($response['candidates'][0]['content']['parts'])) {
                Log::warning("Unexpected Gemini API response content structure", ['response' => $response]);
                throw new \Exception("Unexpected response from Gemini API: Missing content");
            }

            $content = $response['candidates'][0]['content']['parts'][0]['text'] ?? 'No response content';

            return [
                'content' => $content,
                'metadata' => [
                    'model' => $modelName,
                    'provider' => $this->getProviderName(),
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Gemini processing error: " . $e->getMessage(), [
                'model_id' => $model->id,
                'model_name' => $model->name,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $errorMessage = $e->getMessage();
            $userMessage = "I'm sorry, I encountered an error while processing your request. Please try again later.";

            // Provide more specific error messages for common issues
            if (strpos($errorMessage, 'Authentication error') !== false ||
                strpos($errorMessage, 'API key') !== false) {
                $userMessage = "I'm sorry, there's an issue with the API configuration. Please contact the administrator to check the Gemini API key.";
            } else if (strpos($errorMessage, 'Max retries exceeded') !== false) {
                $userMessage = "I'm sorry, I'm having trouble connecting to the Gemini service right now. Please try again in a few moments.";
            } else if (strpos($errorMessage, 'timeout') !== false) {
                $userMessage = "I'm sorry, the request to the Gemini service timed out. Please try again with a simpler query.";
            }

            return [
                'content' => $userMessage,
                'metadata' => [
                    'error' => $errorMessage,
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

            // Validate API key format
            if (empty($apiKey)) {
                Log::warning("Empty Gemini API key provided");
                return [
                    'success' => false,
                    'message' => 'Google Gemini API key is empty. Please provide a valid API key.',
                ];
            }

            // Log the API key length and first/last few characters for debugging
            $keyLength = strlen($apiKey);
            $keyPrefix = substr($apiKey, 0, 4);
            $keySuffix = substr($apiKey, -4);
            Log::debug("Testing Gemini API connection with key of length {$keyLength}, prefix: {$keyPrefix}..., suffix: ...{$keySuffix}");

            $endpoint = "/models?key={$apiKey}";

            $response = $this->makeRequest('get', $endpoint, [
                'timeout' => 30, // Use a reasonable timeout for the test
            ]);

            // Discover and update available models
            $discoveredModels = $this->parseModelsFromResponse($response);

            if (empty($discoveredModels)) {
                Log::warning("No Gemini models discovered in API response");
                return [
                    'success' => false,
                    'message' => 'Connected to Google Gemini API but no compatible models were found.',
                ];
            }

            $this->updateModelSettings($model, $discoveredModels);

            return [
                'success' => true,
                'message' => 'Successfully connected to Google Gemini API',
                'data' => [
                    'available_models' => array_keys($discoveredModels),
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Gemini connection test failed: " . $e->getMessage());

            // Provide more user-friendly error messages based on common issues
            $errorMessage = $e->getMessage();

            if (strpos($errorMessage, 'Authentication error') !== false) {
                return [
                    'success' => false,
                    'message' => 'Google Gemini API key is invalid or has expired. Please check your API key.',
                ];
            } else if (strpos($errorMessage, 'cURL error 28') !== false) {
                return [
                    'success' => false,
                    'message' => 'Connection to Google Gemini API timed out. Please check your network connection and try again.',
                ];
            } else if (strpos($errorMessage, 'Max retries exceeded') !== false) {
                return [
                    'success' => false,
                    'message' => 'Failed to connect to Google Gemini API after multiple attempts. Please check your network connection and try again.',
                ];
            }

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
