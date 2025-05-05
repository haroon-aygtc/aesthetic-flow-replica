
<?php
namespace App\Services\Providers;

use App\Models\AIModel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnthropicProvider extends AIProvider
{
    /**
     * Process a message using Anthropic.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @param  array  $messages
     * @param  float  $temperature
     * @param  int  $maxTokens
     * @param  array|null  $widgetSettings
     * @return array
     */
    public function processMessage(AIModel $aiModel, array $messages, float $temperature, int $maxTokens, ?array $widgetSettings = null)
    {
        try {
            // Apply system prompt from widget settings if available
            $messages = $this->applySystemPrompt($messages, $widgetSettings);
            
            // Apply template if configured
            $messages = $this->applyTemplateIfConfigured($messages, $aiModel);
            
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
        } catch (\Exception $e) {
            return $this->handleError($e, 'Anthropic');
        }
    }
    
    /**
     * Test the connection to Anthropic.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @return array
     */
    public function testConnection(AIModel $aiModel): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $aiModel->api_key,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ])->get('https://api.anthropic.com/v1/models');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Successfully connected to Anthropic API',
                    'data' => $response->json()
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to connect to Anthropic: ' . $response->body()
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Anthropic connection test failed: ' . $e->getMessage()
            ];
        }
    }
}
