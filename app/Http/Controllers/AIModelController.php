
<?php

namespace App\Http\Controllers;

use App\Models\AIModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AIModelController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $aiModels = AIModel::all();
        return response()->json($aiModels);
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
            'provider' => 'required|string|max:255',
            'description' => 'nullable|string',
            'api_key' => 'nullable|string',
            'settings' => 'nullable|array',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // If this model is set as default, unset other defaults
        if ($request->input('is_default')) {
            AIModel::where('is_default', true)->update(['is_default' => false]);
        }

        $aiModel = AIModel::create($request->all());
        return response()->json($aiModel, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $aiModel = AIModel::findOrFail($id);
        return response()->json($aiModel);
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
            'provider' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'api_key' => 'nullable|string',
            'settings' => 'nullable|array',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $aiModel = AIModel::findOrFail($id);

        // If this model is being set as default, unset other defaults
        if ($request->has('is_default') && $request->input('is_default') && !$aiModel->is_default) {
            AIModel::where('is_default', true)->update(['is_default' => false]);
        }

        $aiModel->update($request->all());
        return response()->json($aiModel);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $aiModel = AIModel::findOrFail($id);
        
        // Check if model is in use by any widgets
        if ($aiModel->widgets()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete this AI model because it is being used by one or more widgets.'
            ], 422);
        }

        $aiModel->delete();
        return response()->json(null, 204);
    }

    /**
     * Test connection to the AI model provider.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function testConnection(Request $request, $id)
    {
        $aiModel = AIModel::findOrFail($id);
        
        // TODO: Implement actual connection testing logic
        // This would typically involve making a test call to the AI provider API
        // and checking if it returns a valid response
        
        return response()->json([
            'success' => true,
            'message' => 'Connection test successful'
        ]);
    }
}
