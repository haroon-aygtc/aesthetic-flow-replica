<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Widget;
use App\Services\WidgetService;

class WidgetPreviewController extends Controller
{
    protected $widgetService;

    public function __construct(WidgetService $widgetService)
    {
        $this->widgetService = $widgetService;
    }

    /**
     * Generate a widget preview iframe
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function preview(Request $request)
    {
        try {
            // Validate request parameters
            $validator = Validator::make($request->all(), [
                'widget_id' => 'required|string',
                'preview_mode' => 'required|string|in:true',
                'preview_token' => 'required|string',
                'timestamp' => 'required|numeric',
                'primary_color' => 'nullable|string',
                'secondary_color' => 'nullable|string',
                'border_radius' => 'nullable|numeric',
                'font_family' => 'nullable|string',
                'header_title' => 'nullable|string',
                'initial_message' => 'nullable|string',
                'input_placeholder' => 'nullable|string',
                'send_button_text' => 'nullable|string',
                'avatar_enabled' => 'nullable|string|in:true,false',
                'avatar_image_url' => 'nullable|string',
                'avatar_fallback' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid preview parameters',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify the preview token is valid (basic security check)
            $timestamp = (int)$request->input('timestamp');
            $currentTime = time() * 1000; // Convert to milliseconds
            $timeDifference = abs($currentTime - $timestamp);
            
            // Token should be recent (within 5 minutes)
            if ($timeDifference > 300000) { // 5 minutes in milliseconds
                return response()->json([
                    'success' => false,
                    'message' => 'Preview token expired'
                ], 401);
            }

            // Get widget if it exists
            $widgetId = $request->input('widget_id');
            $widget = null;
            
            if ($widgetId !== 'preview_widget') {
                $widget = Widget::find($widgetId);
                
                if (!$widget) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Widget not found'
                    ], 404);
                }
            }

            // Merge widget settings with preview parameters
            $settings = $this->mergeSettings($widget, $request);

            // Generate the preview HTML
            $html = $this->generatePreviewHtml($settings);

            return response($html)->header('Content-Type', 'text/html');
        } catch (\Exception $e) {
            Log::error('Widget preview error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate widget preview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Merge widget settings with preview parameters
     *
     * @param  Widget|null  $widget
     * @param  Request  $request
     * @return array
     */
    protected function mergeSettings(?Widget $widget, Request $request): array
    {
        $settings = [];
        
        // If widget exists, start with its settings
        if ($widget) {
            $settings = $widget->settings ?? [];
        }
        
        // Override with preview parameters
        $paramMap = [
            'primary_color' => 'primaryColor',
            'secondary_color' => 'secondaryColor',
            'border_radius' => 'borderRadius',
            'font_family' => 'fontFamily',
            'header_title' => 'headerTitle',
            'initial_message' => 'initialMessage',
            'input_placeholder' => 'inputPlaceholder',
            'send_button_text' => 'sendButtonText',
        ];
        
        foreach ($paramMap as $param => $settingKey) {
            if ($request->has($param)) {
                $value = $request->input($param);
                
                // Handle numeric values
                if (is_numeric($value) && in_array($param, ['border_radius'])) {
                    $value = (int)$value;
                }
                
                // Handle URL encoded values
                if (in_array($param, ['primary_color', 'secondary_color', 'font_family', 'header_title', 'initial_message', 'input_placeholder', 'send_button_text'])) {
                    $value = urldecode($value);
                }
                
                $settings[$settingKey] = $value;
            }
        }
        
        // Handle avatar settings
        if ($request->has('avatar_enabled')) {
            $avatarEnabled = $request->input('avatar_enabled') === 'true';
            $settings['avatar'] = $settings['avatar'] ?? [];
            $settings['avatar']['enabled'] = $avatarEnabled;
            
            if ($request->has('avatar_image_url')) {
                $settings['avatar']['imageUrl'] = $request->input('avatar_image_url');
            }
            
            if ($request->has('avatar_fallback')) {
                $settings['avatar']['fallbackInitial'] = $request->input('avatar_fallback');
            }
        }
        
        return $settings;
    }

    /**
     * Generate the preview HTML
     *
     * @param  array  $settings
     * @return string
     */
    protected function generatePreviewHtml(array $settings): string
    {
        // Extract settings
        $primaryColor = $settings['primaryColor'] ?? '#4f46e5';
        $secondaryColor = $settings['secondaryColor'] ?? '#4f46e5';
        $borderRadius = $settings['borderRadius'] ?? 8;
        $fontFamily = $settings['fontFamily'] ?? 'Inter';
        $headerTitle = $settings['headerTitle'] ?? 'AI Assistant';
        $initialMessage = $settings['initialMessage'] ?? 'Hello! How can I help you today?';
        $inputPlaceholder = $settings['inputPlaceholder'] ?? 'Type your message...';
        $sendButtonText = $settings['sendButtonText'] ?? 'Send';
        
        // Avatar settings
        $avatarEnabled = $settings['avatar']['enabled'] ?? false;
        $avatarImageUrl = $settings['avatar']['imageUrl'] ?? '';
        $avatarFallback = $settings['avatar']['fallbackInitial'] ?? 'A';
        
        // Generate the HTML
        $html = $this->widgetService->generatePreviewHtml([
            'primaryColor' => $primaryColor,
            'secondaryColor' => $secondaryColor,
            'borderRadius' => $borderRadius,
            'fontFamily' => $fontFamily,
            'headerTitle' => $headerTitle,
            'initialMessage' => $initialMessage,
            'inputPlaceholder' => $inputPlaceholder,
            'sendButtonText' => $sendButtonText,
            'avatar' => [
                'enabled' => $avatarEnabled,
                'imageUrl' => $avatarImageUrl,
                'fallbackInitial' => $avatarFallback
            ],
            'previewMode' => true
        ]);
        
        return $html;
    }
}
