<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AIProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProviderAPIController extends Controller
{
    /**
     * Get all active providers
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProviders()
    {
        try {
            $providers = AIProvider::where('is_active', true)
                ->select('id', 'name', 'slug', 'logo_path', 'description')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $providers
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching providers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching providers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get models for a specific provider
     * 
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProviderModels($slug)
    {
        try {
            $provider = AIProvider::where('slug', $slug)->firstOrFail();
            $models = $provider->models()
                ->select(
                    'model_id as value', 
                    'display_name as label', 
                    'is_free', 
                    'is_restricted', 
                    'description', 
                    'input_token_limit', 
                    'output_token_limit', 
                    'capabilities'
                )
                ->orderBy('display_order')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $models
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching provider models: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching provider models',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get parameters for a specific provider
     * 
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProviderParameters($slug)
    {
        try {
            $provider = AIProvider::where('slug', $slug)->firstOrFail();
            $parameters = $provider->parameters()
                ->orderBy('display_order')
                ->get()
                ->map(function($param) {
                    return [
                        'key' => $param->param_key,
                        'name' => $param->display_name,
                        'type' => $param->type,
                        'config' => $param->config,
                        'default' => $param->default_value,
                        'description' => $param->description,
                        'required' => $param->is_required,
                        'advanced' => $param->is_advanced
                    ];
                });
            
            // Format for easy frontend consumption
            $formattedParams = [
                'temperature' => $this->findParamByKey($parameters, 'temperature'),
                'maxTokens' => $this->findParamByKey($parameters, 'max_tokens'),
                'topP' => $this->findParamByKey($parameters, 'top_p'),
                'frequencyPenalty' => $this->findParamByKey($parameters, 'frequency_penalty'),
                'presencePenalty' => $this->findParamByKey($parameters, 'presence_penalty'),
                'other' => $parameters->filter(function($param) {
                    return !in_array($param['key'], [
                        'temperature', 'max_tokens', 'top_p', 
                        'frequency_penalty', 'presence_penalty'
                    ]);
                })->values()
            ];
            
            return response()->json([
                'success' => true,
                'data' => $formattedParams
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching provider parameters: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching provider parameters',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Find parameter by key
     * 
     * @param \Illuminate\Support\Collection $parameters
     * @param string $key
     * @return array|null
     */
    protected function findParamByKey($parameters, $key)
    {
        $param = $parameters->firstWhere('key', $key);
        return $param ?? null;
    }
} 