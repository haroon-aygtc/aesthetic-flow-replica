<?php

namespace App\Http\Controllers;

use App\Models\Widget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WidgetController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $widgets = Widget::where('user_id', $request->user()->id)
                        ->with('aiModel')
                        ->get();

        return response()->json($widgets);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'ai_model_id' => 'nullable|exists:ai_models,id',
            'settings' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Merge default settings with provided settings
        $defaultSettings = Widget::getDefaultSettings();
        $providedSettings = $request->input('settings', []);
        $mergedSettings = array_merge($defaultSettings, $providedSettings);

        // Create the widget
        $widget = new Widget($request->except('settings'));
        $widget->user_id = $request->user()->id;
        $widget->widget_id = Str::random(12);
        $widget->settings = $mergedSettings;
        $widget->save();

        return response()->json($widget, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $widget = Widget::where('id', $id)
                       ->where('user_id', $request->user()->id)
                       ->with('aiModel')
                       ->firstOrFail();

        return response()->json($widget);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'ai_model_id' => 'nullable|exists:ai_models,id',
            'settings' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $widget = Widget::where('id', $id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        // If settings are provided, merge with existing settings
        if ($request->has('settings')) {
            $existingSettings = $widget->settings ?? [];
            $newSettings = $request->input('settings');

            // Special handling for knowledge base settings
            if (isset($newSettings['knowledge_base_settings'])) {
                $existingKbSettings = $existingSettings['knowledge_base_settings'] ?? [];
                $newSettings['knowledge_base_settings'] = array_merge($existingKbSettings, $newSettings['knowledge_base_settings']);
            }

            $mergedSettings = array_merge($existingSettings, $newSettings);
            $widget->settings = $mergedSettings;

            // Update other fields except settings
            $widget->update($request->except('settings'));
        } else {
            // Update all fields
            $widget->update($request->all());
        }

        return response()->json($widget);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $widget = Widget::where('id', $id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        $widget->delete();

        return response()->json(null, 204);
    }

    /**
     * Get a widget by its public widget_id.
     * This endpoint is public and used by the widget script.
     *
     * @param  string  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function getByWidgetId($widgetId)
    {
        $widget = Widget::where('widget_id', $widgetId)
                       ->where('is_active', true)
                       ->firstOrFail();

        // Return only the necessary public information
        return response()->json([
            'widget_id' => $widget->widget_id,
            'settings' => $widget->settings,
            'knowledge_base_enabled' => $widget->isKnowledgeBaseEnabled(),
        ]);
    }

    /**
     * Update knowledge base settings for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateKnowledgeBaseSettings(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'use_knowledge_base' => 'required|boolean',
            'knowledge_base_settings' => 'required_if:use_knowledge_base,true|array',
            'knowledge_base_settings.search_threshold' => 'numeric|min:0|max:1',
            'knowledge_base_settings.max_results' => 'integer|min:1|max:20',
            'knowledge_base_settings.sources' => 'array',
            'knowledge_base_settings.sources.*' => 'string|in:embeddings,qa_pairs,keywords',
            'knowledge_base_settings.categories' => 'array',
            'knowledge_base_settings.categories.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $widget = Widget::where('id', $id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        // Update knowledge base settings
        $settings = $widget->settings ?? [];
        $settings['use_knowledge_base'] = $request->input('use_knowledge_base');

        if ($request->has('knowledge_base_settings')) {
            $existingKbSettings = $settings['knowledge_base_settings'] ?? [];
            $newKbSettings = $request->input('knowledge_base_settings');
            $settings['knowledge_base_settings'] = array_merge($existingKbSettings, $newKbSettings);
        }

        $widget->settings = $settings;
        $widget->save();

        return response()->json([
            'success' => true,
            'widget' => $widget,
        ]);
    }
}
