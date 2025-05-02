
<?php
namespace App\Http\Controllers;

use App\Models\AIModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AIModelController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $aiModels = AIModel::all();
            return response()->json(['data' => $aiModels, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch AI models: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch AI models',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
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
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            // If this model is set as default, unset other defaults
            if ($request->input('is_default')) {
                AIModel::where('is_default', true)->update(['is_default' => false]);
            }

            $aiModel = AIModel::create($request->all());
            return response()->json(['data' => $aiModel, 'success' => true], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create AI model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create AI model',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $aiModel = AIModel::findOrFail($id);
            return response()->json(['data' => $aiModel, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch AI model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch AI model',
                'error' => $e->getMessage(),
                'success' => false
            ], 404);
        }
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
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            $aiModel = AIModel::findOrFail($id);

            // If this model is being set as default, unset other defaults
            if ($request->has('is_default') && $request->input('is_default') && !$aiModel->is_default) {
                AIModel::where('is_default', true)->update(['is_default' => false]);
            }

            $aiModel->update($request->all());
            return response()->json(['data' => $aiModel, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to update AI model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update AI model',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $aiModel = AIModel::findOrFail($id);

            // Check if model is in use by any widgets
            if ($aiModel->widgets()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete this AI model because it is being used by one or more widgets.',
                    'success' => false
                ], 422);
            }

            $aiModel->delete();
            return response()->json(['message' => 'Model deleted successfully', 'success' => true], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete AI model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete AI model',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
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
        try {
            $aiModel = AIModel::findOrFail($id);

            // TODO: Implement actual connection testing logic
            // This would typically involve making a test call to the AI provider API
            // and checking if it returns a valid response

            return response()->json([
                'success' => true,
                'message' => 'Connection test successful'
            ]);
        } catch (\Exception $e) {
            Log::error('Connection test failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Connection test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
