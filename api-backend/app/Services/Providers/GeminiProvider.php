
<?php
namespace App\Services\Providers;

use App\Models\AIModel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiProvider extends AIProvider
{
    /**
     * Process a message using Google Gemini.
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
        } catch (\Exception $e) {
            return $this->handleError($e, 'Gemini');
        }
    }
    
    /**
     * Test the connection to Google Gemini.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @return array
     */
    public function testConnection(AIModel $aiModel): array
    {
        try {
            $apiKey = $aiModel->api_key;
            $response = Http::get("https://generativelanguage.googleapis.com/v1/models?key={$apiKey}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Successfully connected to Google Gemini API',
                    'data' => $response->json()
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to connect to Google Gemini: ' . $response->body()
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Google Gemini connection test failed: ' . $e->getMessage()
            ];
        }
    }
}
