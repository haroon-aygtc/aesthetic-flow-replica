<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\ModuleConfiguration;
use App\Models\AIModel;

class ModuleConfigurationController extends Controller
{
    /**
     * Get all module configurations
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $moduleConfigs = ModuleConfiguration::all();
            return response()->json(['data' => $moduleConfigs, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch module configurations: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch module configurations',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Get a specific module configuration
     *
     * @param string $moduleId
     * @return \Illuminate\Http\Response
     */
    public function show($moduleId)
    {
        try {
            $moduleConfig = ModuleConfiguration::where('module_id', $moduleId)->first();
            
            if (!$moduleConfig) {
                return response()->json([
                    'message' => 'Module configuration not found',
                    'success' => false
                ], 404);
            }
            
            return response()->json(['data' => $moduleConfig, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch module configuration: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch module configuration',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Update a module configuration
     *
     * @param Request $request
     * @param string $moduleId
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $moduleId)
    {
        $validator = Validator::make($request->all(), [
            'modelId' => 'nullable|integer',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            $moduleConfig = ModuleConfiguration::where('module_id', $moduleId)->first();
            
            if (!$moduleConfig) {
                // Create a new module configuration if it doesn't exist
                $moduleConfig = new ModuleConfiguration();
                $moduleConfig->module_id = $moduleId;
                $moduleConfig->name = $request->input('name', ucfirst(str_replace('_', ' ', $moduleId)));
                $moduleConfig->description = $request->input('description', '');
                $moduleConfig->icon = $request->input('icon', 'Settings');
            }
            
            // Update the model ID if provided
            if ($request->has('modelId')) {
                $modelId = $request->input('modelId');
                
                // Verify the model exists if a model ID is provided
                if ($modelId) {
                    $model = AIModel::find($modelId);
                    if (!$model) {
                        return response()->json([
                            'message' => 'AI Model not found',
                            'success' => false
                        ], 404);
                    }
                }
                
                $moduleConfig->model_id = $modelId;
            }
            
            // Update settings if provided
            if ($request->has('settings')) {
                $moduleConfig->settings = $request->input('settings');
            }
            
            $moduleConfig->save();
            
            return response()->json([
                'message' => 'Module configuration updated successfully',
                'data' => $moduleConfig,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update module configuration: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update module configuration',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Batch update module configurations
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function batchUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'modules' => 'required|array',
            'modules.*.id' => 'required|string',
            'modules.*.modelId' => 'nullable|integer',
            'modules.*.settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            $modules = $request->input('modules');
            
            foreach ($modules as $module) {
                $moduleId = $module['id'];
                $moduleConfig = ModuleConfiguration::where('module_id', $moduleId)->first();
                
                if (!$moduleConfig) {
                    // Create a new module configuration if it doesn't exist
                    $moduleConfig = new ModuleConfiguration();
                    $moduleConfig->module_id = $moduleId;
                    $moduleConfig->name = $module['name'] ?? ucfirst(str_replace('_', ' ', $moduleId));
                    $moduleConfig->description = $module['description'] ?? '';
                    $moduleConfig->icon = $module['icon'] ?? 'Settings';
                }
                
                // Update the model ID if provided
                if (isset($module['modelId'])) {
                    $moduleConfig->model_id = $module['modelId'];
                }
                
                // Update settings if provided
                if (isset($module['settings'])) {
                    $moduleConfig->settings = $module['settings'];
                }
                
                $moduleConfig->save();
            }
            
            return response()->json([
                'message' => 'Module configurations updated successfully',
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to batch update module configurations: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to batch update module configurations',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }
}
