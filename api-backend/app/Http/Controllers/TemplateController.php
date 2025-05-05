<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\AIModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TemplateController extends Controller
{
    /**
     * Display a listing of the templates.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $templates = Template::orderBy('name')->get();
            return response()->json(['data' => $templates, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch templates: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch templates',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Store a newly created template in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category' => 'required|string|max:100',
                'content' => 'required|string',
                'version' => 'nullable|numeric',
                'is_default' => 'nullable|boolean',
                'variables' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'success' => false
                ], 422);
            }

            // If this is set as default, unset any existing default
            if ($request->input('is_default', false)) {
                Template::where('is_default', true)->update(['is_default' => false]);
            }

            $template = Template::create($request->all());
            return response()->json([
                'data' => $template,
                'message' => 'Template created successfully',
                'success' => true
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create template: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create template',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Display the specified template.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $template = Template::findOrFail($id);
            return response()->json(['data' => $template, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch template: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch template',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Update the specified template in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $template = Template::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'category' => 'sometimes|required|string|max:100',
                'content' => 'sometimes|required|string',
                'version' => 'nullable|numeric',
                'is_default' => 'nullable|boolean',
                'variables' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'success' => false
                ], 422);
            }

            // If this is set as default, unset any existing default
            if ($request->input('is_default', false) && !$template->is_default) {
                Template::where('is_default', true)->update(['is_default' => false]);
            }

            $template->update($request->all());
            return response()->json([
                'data' => $template,
                'message' => 'Template updated successfully',
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update template: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update template',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Remove the specified template from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $template = Template::findOrFail($id);
            
            // Check if any models are using this template
            $modelsUsingTemplate = AIModel::where('template_id', $id)->count();
            if ($modelsUsingTemplate > 0) {
                return response()->json([
                    'message' => 'Cannot delete template that is in use by AI models',
                    'success' => false
                ], 422);
            }
            
            $template->delete();
            return response()->json([
                'message' => 'Template deleted successfully',
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete template: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete template',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Get templates for a specific model.
     *
     * @param  int  $modelId
     * @return \Illuminate\Http\Response
     */
    public function getModelTemplates($modelId)
    {
        try {
            // Verify the model exists
            $model = AIModel::findOrFail($modelId);
            
            // Get all templates
            $templates = Template::orderBy('name')->get();
            
            return response()->json(['data' => $templates, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch model templates: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch model templates',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Assign a template to a model.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $modelId
     * @return \Illuminate\Http\Response
     */
    public function assignTemplateToModel(Request $request, $modelId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'template_id' => 'nullable|exists:templates,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'success' => false
                ], 422);
            }

            $model = AIModel::findOrFail($modelId);
            $model->template_id = $request->input('template_id');
            $model->save();

            return response()->json([
                'data' => $model,
                'message' => 'Template assigned successfully',
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to assign template to model: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to assign template to model',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }
}
