<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Widget;
use Illuminate\Support\Str;

class WidgetConfigController extends Controller
{
    /**
     * Get default widget configuration
     *
     * @return \Illuminate\Http\Response
     */
    public function getDefault()
    {
        // Return default configuration
        return response()->json([
            'initiallyOpen' => false,
            'contextMode' => 'restricted',
            'contextName' => 'Website Assistance',
            'title' => 'ChatEmbed Demo',
            'primaryColor' => '#4f46e5',
            'position' => 'bottom-right',
            'showOnMobile' => true,
        ]);
    }

    /**
     * Get a specific widget configuration
     *
     * @param string $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $widget = Widget::where('widget_id', $id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        // Convert widget settings to the format expected by the frontend
        return response()->json([
            'initiallyOpen' => $widget->settings['initiallyOpen'] ?? false,
            'contextMode' => $widget->settings['contextMode'] ?? 'restricted',
            'contextName' => $widget->settings['contextName'] ?? 'Website Assistance',
            'title' => $widget->settings['headerTitle'] ?? 'Chat Assistant',
            'primaryColor' => $widget->settings['primaryColor'] ?? '#4f46e5',
            'position' => $widget->settings['position'] ?? 'bottom-right',
            'showOnMobile' => $widget->settings['showOnMobile'] ?? true,
        ]);
    }

    /**
     * Create a new widget configuration
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Create a new widget with the provided configuration
        $widget = new Widget();
        $widget->name = $request->input('title', 'New Widget');
        $widget->user_id = $user->id;
        $widget->widget_id = Str::random(12);
        $widget->is_active = true;

        // Convert frontend config format to widget settings
        $widget->settings = [
            'initiallyOpen' => $request->input('initiallyOpen', false),
            'contextMode' => $request->input('contextMode', 'restricted'),
            'contextName' => $request->input('contextName', 'Website Assistance'),
            'headerTitle' => $request->input('title', 'Chat Assistant'),
            'primaryColor' => $request->input('primaryColor', '#4f46e5'),
            'position' => $request->input('position', 'bottom-right'),
            'showOnMobile' => $request->input('showOnMobile', true),
        ];

        $widget->save();

        return response()->json([
            'id' => $widget->widget_id,
            'initiallyOpen' => $widget->settings['initiallyOpen'],
            'contextMode' => $widget->settings['contextMode'],
            'contextName' => $widget->settings['contextName'],
            'title' => $widget->settings['headerTitle'],
            'primaryColor' => $widget->settings['primaryColor'],
            'position' => $widget->settings['position'],
            'showOnMobile' => $widget->settings['showOnMobile'],
        ]);
    }

    /**
     * Update an existing widget configuration
     *
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $widget = Widget::where('widget_id', $id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        // Update widget settings
        $settings = $widget->settings ?? [];
        $settings['initiallyOpen'] = $request->input('initiallyOpen', $settings['initiallyOpen'] ?? false);
        $settings['contextMode'] = $request->input('contextMode', $settings['contextMode'] ?? 'restricted');
        $settings['contextName'] = $request->input('contextName', $settings['contextName'] ?? 'Website Assistance');
        $settings['headerTitle'] = $request->input('title', $settings['headerTitle'] ?? 'Chat Assistant');
        $settings['primaryColor'] = $request->input('primaryColor', $settings['primaryColor'] ?? '#4f46e5');
        $settings['position'] = $request->input('position', $settings['position'] ?? 'bottom-right');
        $settings['showOnMobile'] = $request->input('showOnMobile', $settings['showOnMobile'] ?? true);

        $widget->settings = $settings;
        if ($request->has('title')) {
            $widget->name = $request->input('title');
        }

        $widget->save();

        return response()->json([
            'id' => $widget->widget_id,
            'initiallyOpen' => $widget->settings['initiallyOpen'],
            'contextMode' => $widget->settings['contextMode'],
            'contextName' => $widget->settings['contextName'],
            'title' => $widget->settings['headerTitle'],
            'primaryColor' => $widget->settings['primaryColor'],
            'position' => $widget->settings['position'],
            'showOnMobile' => $widget->settings['showOnMobile'],
        ]);
    }

    /**
     * Delete a widget configuration
     *
     * @param string $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $widget = Widget::where('widget_id', $id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        $widget->delete();

        return response()->json(['success' => true], 200);
    }
}
