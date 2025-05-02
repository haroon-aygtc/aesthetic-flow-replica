
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

        $widget = new Widget($request->all());
        $widget->user_id = $request->user()->id;
        $widget->widget_id = Str::random(12);
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
                       
        $widget->update($request->all());
        
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
        ]);
    }
}
