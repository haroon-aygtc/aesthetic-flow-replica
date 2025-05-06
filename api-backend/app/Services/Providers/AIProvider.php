<?php

namespace App\Services\Providers;

use App\Models\AIModel;
use Illuminate\Support\Facades\Log;

abstract class AIProvider
{
    /**
     * Process a message using this provider.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @param  array  $messages
     * @param  float  $temperature
     * @param  int  $maxTokens
     * @param  array|null  $widgetSettings
     * @return array
     */
    abstract public function processMessage(AIModel $aiModel, array $messages, float $temperature, int $maxTokens, ?array $widgetSettings = null);

    /**
     * Test the connection to this provider.
     *
     * @param  \App\Models\AIModel  $aiModel
     * @return array
     */
    abstract public function testConnection(AIModel $aiModel): array;

    /**
     * Handle error logging and response generation.
     *
     * @param  \Exception  $e
     * @param  string  $providerName
     * @return array
     */
    protected function handleError(\Exception $e, string $providerName): array
    {
        Log::error("$providerName API error: " . $e->getMessage());

        return [
            'content' => "Sorry, I encountered an error while processing your request. Please try again later.",
            'metadata' => [
                'error' => $e->getMessage(),
                'provider' => $providerName
            ],
        ];
    }

    /**
     * Apply system prompt from widget settings if available.
     *
     * @param  array  $messages
     * @param  array|null  $widgetSettings
     * @return array
     */
    protected function applySystemPrompt(array $messages, ?array $widgetSettings): array
    {
        // Check if a system message is already included
        $hasSystemMessage = collect($messages)->contains(function ($message) {
            return $message['role'] === 'system';
        });

        // If no system message and widget settings include a system prompt, add it
        if (!$hasSystemMessage && !empty($widgetSettings['systemPrompt'])) {
            array_unshift($messages, [
                'role' => 'system',
                'content' => $widgetSettings['systemPrompt'],
            ]);
        }

        return $messages;
    }

    /**
     * Check if template should be applied and merge with messages.
     *
     * @param  array  $messages
     * @param  \App\Models\AIModel  $aiModel
     * @return array
     */
    protected function applyTemplateIfConfigured(array $messages, AIModel $aiModel): array
    {
        // Check if model has a template configured
        if (!empty($aiModel->settings['template_id'])) {
            // Fetch template content from the database
            $templateContent = $this->getTemplateContent($aiModel->settings['template_id']);

            if ($templateContent) {
                // Add template as system message if none exists
                $hasSystemMessage = collect($messages)->contains(function ($message) {
                    return $message['role'] === 'system';
                });

                if (!$hasSystemMessage) {
                    array_unshift($messages, [
                        'role' => 'system',
                        'content' => $templateContent,
                    ]);
                } else {
                    // If system message exists, replace or append to it
                    foreach ($messages as &$message) {
                        if ($message['role'] === 'system') {
                            $message['content'] = $templateContent . "\n\n" . $message['content'];
                            break;
                        }
                    }
                }
            }
        }

        return $messages;
    }

    /**
     * Get template content by ID from the database.
     *
     * @param  string|int  $templateId
     * @return string|null
     */
    private function getTemplateContent($templateId): ?string
    {
        try {
            // Get the template from the database
            $template = \App\Models\Template::find($templateId);

            // Return the content if template exists
            if ($template) {
                return $template->content;
            }

            return null;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching template: ' . $e->getMessage());
            return null;
        }
    }
}
