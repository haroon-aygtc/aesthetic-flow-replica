<?php

namespace App\Services;

use App\Models\Widget;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;

class WidgetService
{
    /**
     * Get a widget by ID
     *
     * @param int $id
     * @return Widget|null
     */
    public function getWidget(int $id): ?Widget
    {
        return Widget::find($id);
    }

    /**
     * Get a widget by public ID
     *
     * @param string $publicId
     * @return Widget|null
     */
    public function getWidgetByPublicId(string $publicId): ?Widget
    {
        return Widget::where('public_id', $publicId)->first();
    }

    /**
     * Create a new widget
     *
     * @param array $data
     * @return Widget
     */
    public function createWidget(array $data): Widget
    {
        // Generate a public ID if not provided
        if (!isset($data['public_id'])) {
            $data['public_id'] = $this->generatePublicId();
        }

        // Set default settings if not provided
        if (!isset($data['settings']) || !is_array($data['settings'])) {
            $data['settings'] = $this->getDefaultSettings();
        }

        return Widget::create($data);
    }

    /**
     * Update a widget
     *
     * @param int $id
     * @param array $data
     * @return Widget|null
     */
    public function updateWidget(int $id, array $data): ?Widget
    {
        $widget = $this->getWidget($id);

        if (!$widget) {
            return null;
        }

        // Merge settings if provided
        if (isset($data['settings']) && is_array($data['settings'])) {
            $currentSettings = $widget->settings ?? [];
            $data['settings'] = array_merge($currentSettings, $data['settings']);
        }

        $widget->update($data);
        return $widget;
    }

    /**
     * Delete a widget
     *
     * @param int $id
     * @return bool
     */
    public function deleteWidget(int $id): bool
    {
        $widget = $this->getWidget($id);

        if (!$widget) {
            return false;
        }

        return $widget->delete();
    }

    /**
     * Generate embed code for a widget
     *
     * @param Widget $widget
     * @param string $embedType
     * @param array $customizations
     * @return string
     */
    public function generateEmbedCode(Widget $widget, string $embedType = 'standard', array $customizations = []): string
    {
        $publicId = $widget->public_id;
        $baseUrl = config('app.url');

        switch ($embedType) {
            case 'iframe':
                return $this->generateIframeEmbedCode($publicId, $baseUrl, $customizations);
            case 'web-component':
                return $this->generateWebComponentEmbedCode($publicId, $baseUrl, $customizations);
            case 'standard':
            default:
                return $this->generateStandardEmbedCode($publicId, $baseUrl, $customizations);
        }
    }

    /**
     * Generate standard embed code (JavaScript snippet)
     *
     * @param string $publicId
     * @param string $baseUrl
     * @param array $customizations
     * @return string
     */
    protected function generateStandardEmbedCode(string $publicId, string $baseUrl, array $customizations = []): string
    {
        $scriptUrl = "{$baseUrl}/widget/v1/loader.js";
        $customizationsJson = json_encode($customizations);

        return <<<HTML
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AIChatWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;js.id=o;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aiChat','{$scriptUrl}'));
  aiChat('init', '{$publicId}', {$customizationsJson});
</script>
HTML;
    }

    /**
     * Generate iframe embed code
     *
     * @param string $publicId
     * @param string $baseUrl
     * @param array $customizations
     * @return string
     */
    protected function generateIframeEmbedCode(string $publicId, string $baseUrl, array $customizations = []): string
    {
        $iframeUrl = "{$baseUrl}/widget/v1/iframe/{$publicId}";
        $customizationsParams = '';

        if (!empty($customizations)) {
            $customizationsParams = '?' . http_build_query($customizations);
        }

        return <<<HTML
<iframe
  src="{$iframeUrl}{$customizationsParams}"
  width="100%"
  height="600px"
  frameborder="0"
  allow="microphone"
  style="border: 1px solid #eaeaea; border-radius: 8px;"
></iframe>
HTML;
    }

    /**
     * Generate web component embed code
     *
     * @param string $publicId
     * @param string $baseUrl
     * @param array $customizations
     * @return string
     */
    protected function generateWebComponentEmbedCode(string $publicId, string $baseUrl, array $customizations = []): string
    {
        $scriptUrl = "{$baseUrl}/widget/v1/web-component.js";
        $customizationsAttrs = '';

        foreach ($customizations as $key => $value) {
            if (is_bool($value)) {
                $value = $value ? 'true' : 'false';
            } elseif (is_array($value)) {
                $value = json_encode($value);
            }
            $customizationsAttrs .= " {$key}=\"{$value}\"";
        }

        return <<<HTML
<script src="{$scriptUrl}"></script>
<ai-chat-widget widget-id="{$publicId}"{$customizationsAttrs}></ai-chat-widget>
HTML;
    }

    /**
     * Generate a unique public ID for a widget
     *
     * @return string
     */
    protected function generatePublicId(): string
    {
        $publicId = 'widget_' . Str::random(12);

        // Ensure uniqueness
        while (Widget::where('public_id', $publicId)->exists()) {
            $publicId = 'widget_' . Str::random(12);
        }

        return $publicId;
    }

    /**
     * Get default widget settings
     *
     * @return array
     */
    public function getDefaultSettings(): array
    {
        return [
            'primaryColor' => '#4f46e5',
            'secondaryColor' => '#4f46e5',
            'fontFamily' => 'Inter',
            'borderRadius' => 8,
            'chatIconSize' => 40,
            'position' => 'bottom-right',
            'headerTitle' => 'AI Assistant',
            'initialMessage' => 'Hello! How can I help you today?',
            'inputPlaceholder' => 'Type your message...',
            'sendButtonText' => 'Send',
            'avatar' => [
                'enabled' => false,
                'imageUrl' => '',
                'fallbackInitial' => 'A'
            ],
            'requireGuestInfo' => false,
            'guestFields' => ['name', 'email'],
            'allowAttachments' => false,
            'maxAttachmentSize' => 5, // MB
            'allowedFileTypes' => ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
            'showBranding' => true,
            'customCSS' => '',
        ];
    }

    /**
     * Generate preview HTML for the widget
     *
     * @param array $settings
     * @return string
     */
    public function generatePreviewHtml(array $settings): string
    {
        try {
            // Merge with default settings
            $settings = array_merge($this->getDefaultSettings(), $settings);
            
            // Generate the HTML using a view
            return View::make('widgets.preview', [
                'settings' => $settings
            ])->render();
        } catch (\Exception $e) {
            Log::error('Error generating widget preview HTML: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return a basic error HTML
            return $this->generateErrorHtml($e->getMessage());
        }
    }
    
    /**
     * Generate error HTML
     *
     * @param string $message
     * @return string
     */
    protected function generateErrorHtml(string $message): string
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Preview Error</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .error-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
            max-width: 500px;
            text-align: center;
        }
        .error-icon {
            color: #ef4444;
            font-size: 48px;
            margin-bottom: 16px;
        }
        .error-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .error-message {
            color: #666;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Widget Preview Error</div>
        <div class="error-message">
            {$message}
        </div>
    </div>
</body>
</html>
HTML;
    }
}
