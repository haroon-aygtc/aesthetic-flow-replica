
<?php

namespace App\Services;

use App\Models\AIModel;
use Illuminate\Support\Facades\Http;
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
            // Process based on provider
            switch ($aiModel->provider) {
                case 'openai':
                    return $this->processWithOpenAI($aiModel, $messages, $temperature, $maxTokens, $widgetSettings);
                
                case 'anthropic':
                    return $this->processWithAnthropic($aiModel, $messages, $temperature, $maxTokens, $widgetSettings);
                
                case 'gemini':
                    return $this->processWithGemini($aiModel, $messages, $temperature, $maxTokens, $widgetSettings);
                
                default:
                    return [
                        'content' => 'Sorry, the configured AI provider is not supported.',
                        'metadata' => ['error' => 'unsupported_provider'],
                    ];
            }
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
     * Process with OpenAI API.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @param  array  $messages
     * @param  float  $temperature
     * @param  int  $maxTokens
     * @param  array|null  $widgetSettings
     * @return array
     */
    private function processWithOpenAI(AIModel $aiModel, array $messages, float $temperature, int $maxTokens, ?array $widgetSettings)
    {
        // Prepare system message based on widget settings if not already included
        $hasSystemMessage = collect($messages)->contains(function ($message) {
            return $message['role'] === 'system';
        });

        if (!$hasSystemMessage && !empty($widgetSettings['systemPrompt'])) {
            array_unshift($messages, [
                'role' => 'system',
                'content' => $widgetSettings['systemPrompt'],
            ]);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $aiModel->api_key,
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $aiModel->settings['model_name'] ?? 'gpt-3.5-turbo',
            'messages' => $messages,
            'temperature' => $temperature,
            'max_tokens' => $maxTokens,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return [
                'content' => $data['choices'][0]['message']['content'] ?? 'No response content',
                'metadata' => [
                    'model' => $data['model'] ?? null,
                    'finish_reason' => $data['choices'][0]['finish_reason'] ?? null,
                ],
            ];
        } else {
            Log::error('OpenAI API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            throw new \Exception('Error from OpenAI API: ' . $response->body());
        }
    }

    /**
     * Process with Anthropic API.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @param  array  $messages
     * @param  float  $temperature
     * @param  int  $maxTokens
     * @param  array|null  $widgetSettings
     * @return array
     */
    private function processWithAnthropic(AIModel $aiModel, array $messages, float $temperature, int $maxTokens, ?array $widgetSettings)
    {
        // Convert messages to Anthropic format
        $formattedMessages = [];
        foreach ($messages as $message) {
            // Anthropic doesn't use system messages in the same way, so we include as user message
            if ($message['role'] === 'system') {
                $formattedMessages[] = [
                    'role' => 'user',
                    'content' => 'System instruction: ' . $message['content'],
                ];
            } else {
                $formattedMessages[] = [
                    'role' => $message['role'],
                    'content' => $message['content'],
                ];
            }
        }

        $response = Http::withHeaders([
            'x-api-key' => $aiModel->api_key,
            'Content-Type' => 'application/json',
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => $aiModel->settings['model_name'] ?? 'claude-2',
            'messages' => $formattedMessages,
            'temperature' => $temperature,
            'max_tokens' => $maxTokens,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return [
                'content' => $data['content'][0]['text'] ?? 'No response content',
                'metadata' => [
                    'model' => $data['model'] ?? null,
                ],
            ];
        } else {
            Log::error('Anthropic API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            throw new \Exception('Error from Anthropic API: ' . $response->body());
        }
    }

    /**
     * Process with Google Gemini API.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @param  array  $messages
     * @param  float  $temperature
     * @param  int  $maxTokens
     * @param  array|null  $widgetSettings
     * @return array
     */
    private function processWithGemini(AIModel $aiModel, array $messages, float $temperature, int $maxTokens, ?array $widgetSettings)
    {
        // Convert messages to Gemini format
        $contents = [];
        $systemPrompt = null;

        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                $systemPrompt = $message['content'];
            } else {
                $contents[] = [
                    'role' => $message['role'],
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

        $modelName = $aiModel->settings['model_name'] ?? 'gemini-1.0-pro';
        $apiUrl = "https://generativelanguage.googleapis.com/v1/models/{$modelName}:generateContent";
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->withToken($aiModel->api_key)
            ->post($apiUrl, $payload);

        if ($response->successful()) {
            $data = $response->json();
            return [
                'content' => $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No response content',
                'metadata' => [
                    'model' => $modelName,
                ],
            ];
        } else {
            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            throw new \Exception('Error from Gemini API: ' . $response->body());
        }
    }
}
