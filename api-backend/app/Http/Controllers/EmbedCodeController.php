<?php

namespace App\Http\Controllers;

use App\Models\Widget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmbedCodeController extends Controller
{
    /**
     * Generate embed code for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|integer|exists:widgets,id',
            'type' => 'required|string|in:standard,iframe,web-component',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Ensure widget belongs to authenticated user
        $widget = Widget::where('id', $request->widget_id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        $embedCode = $this->generateEmbedCode($widget, $request->type);

        return response()->json([
            'embed_code' => $embedCode,
        ]);
    }

    /**
     * Generate different types of embed codes.
     *
     * @param  \App\Models\Widget  $widget
     * @param  string  $type
     * @return string
     */
    private function generateEmbedCode(Widget $widget, string $type)
    {
        $baseUrl = config('app.url');
        $widgetId = $widget->widget_id;

        // Extract relevant settings for the embed code
        $settings = $widget->settings;
        $primaryColor = $settings['primaryColor'] ?? '#4f46e5';
        $borderRadius = $settings['borderRadius'] ?? '8';

        switch ($type) {
            case 'standard':
                return '<script src="' . $baseUrl . '/widget/v1/script.js"
  data-widget-id="' . $widgetId . '"
  data-primary-color="' . $primaryColor . '"
  data-border-radius="' . $borderRadius . '"
  async>
</script>';

            case 'iframe':
                return '<iframe
  src="' . $baseUrl . '/widget/v1/iframe/' . $widgetId . '"
  id="ai-chat-iframe"
  style="position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; border: none; z-index: 9999;"
  allow="microphone"
  loading="lazy">
</iframe>';

            case 'web-component':
                return '<script type="module" src="' . $baseUrl . '/widget/v1/web-component.js"></script>
<ai-chat-widget
  widget-id="' . $widgetId . '"
  primary-color="' . $primaryColor . '"
  border-radius="' . $borderRadius . '">
</ai-chat-widget>';

            default:
                return '';
        }
    }
}
