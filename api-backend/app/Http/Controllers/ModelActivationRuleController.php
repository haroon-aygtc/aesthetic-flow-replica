<?php

namespace App\Http\Controllers;

use App\Models\AIModel;
use App\Models\ModelActivationRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ModelActivationRuleController extends Controller
{
    /**
     * Get all rules for a specific model.
     *
     * @param  int  $modelId
     * @return \Illuminate\Http\Response
     */
    public function index($modelId)
    {
        try {
            $aiModel = AIModel::findOrFail($modelId);
            $rules = $aiModel->activationRules()->orderBy('priority')->get();

            return response()->json(['data' => $rules, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch model rules: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch model rules',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Store a new rule.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $modelId
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $modelId)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'query_type' => 'nullable|string|max:255',
            'use_case' => 'nullable|string|max:255',
            'tenant_id' => 'nullable|integer',
            'active' => 'boolean',
            'priority' => 'integer|min:1',
            'conditions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            $aiModel = AIModel::findOrFail($modelId);

            $rule = $aiModel->activationRules()->create($request->all());

            return response()->json(['data' => $rule, 'success' => true], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create rule: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create rule',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Update an existing rule.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $modelId
     * @param  int  $ruleId
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $modelId, $ruleId)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'query_type' => 'nullable|string|max:255',
            'use_case' => 'nullable|string|max:255',
            'tenant_id' => 'nullable|integer',
            'active' => 'boolean',
            'priority' => 'integer|min:1',
            'conditions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors(), 'success' => false], 422);
        }

        try {
            $aiModel = AIModel::findOrFail($modelId);
            $rule = $aiModel->activationRules()->findOrFail($ruleId);

            $rule->update($request->all());

            return response()->json(['data' => $rule, 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to update rule: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update rule',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Delete a rule.
     *
     * @param  int  $modelId
     * @param  int  $ruleId
     * @return \Illuminate\Http\Response
     */
    public function destroy($modelId, $ruleId)
    {
        try {
            $aiModel = AIModel::findOrFail($modelId);
            $rule = $aiModel->activationRules()->findOrFail($ruleId);

            $rule->delete();

            return response()->json(['message' => 'Rule deleted', 'success' => true]);
        } catch (\Exception $e) {
            Log::error('Failed to delete rule: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete rule',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }
}
