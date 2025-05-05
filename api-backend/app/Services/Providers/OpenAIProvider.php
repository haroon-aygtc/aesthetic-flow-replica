
<?php
namespace App\Services\Providers;

use App\Models\AIModel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIProvider extends AIProvider
{
    /**
     * Process a message using OpenAI.
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
        } catch (\Exception $e) {
            return $this->handleError($e, 'OpenAI');
        }
    }
    
    /**
     * Test the connection to OpenAI.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @return array
     */
    public function testConnection(AIModel $aiModel): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $aiModel->api_key,
                'Content-Type' => 'application/json',
            ])->get('https://api.openai.com/v1/models');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Successfully connected to OpenAI API',
                    'data' => $response->json()
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to connect to OpenAI: ' . $response->body()
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'OpenAI connection test failed: ' . $e->getMessage()
            ];
        }
    }
}
