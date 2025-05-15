<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ContextRule;
use App\Models\Widget;
use App\Services\ContextService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class ContextController extends Controller
{
    protected $contextService;

    public function __construct(ContextService $contextService)
    {
        $this->contextService = $contextService;
    }

    /**
     * Get all context rules for a user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $rules = $this->contextService->getRules($request->user()->id);
            return response()->json([
                'success' => true,
                'data' => $rules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific context rule.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $rule = $this->contextService->getRule($id, $request->user()->id);
            return response()->json([
                'success' => true,
                'data' => $rule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new context rule.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'conditions' => 'required|array',
            'settings' => 'nullable|array',
            'priority' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $rule = $this->contextService->createRule(
                $request->user()->id,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Context rule created successfully',
                'data' => $rule
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a context rule.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'conditions' => 'sometimes|required|array',
            'settings' => 'nullable|array',
            'priority' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $rule = $this->contextService->updateRule(
                $id,
                $request->user()->id,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Context rule updated successfully',
                'data' => $rule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Delete a context rule.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $result = $this->contextService->deleteRule($id, $request->user()->id);
            return response()->json([
                'success' => true,
                'message' => 'Context rule deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Associate a context rule with a widget.
     */
    public function associateWithWidget(Request $request, $id, $widgetId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $widget = $this->contextService->associateRuleWithWidget(
                $id,
                $widgetId,
                $request->user()->id,
                $request->input('settings', [])
            );

            return response()->json([
                'success' => true,
                'message' => 'Context rule associated with widget successfully',
                'data' => $widget
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Dissociate a context rule from a widget.
     */
    public function dissociateFromWidget(Request $request, $id, $widgetId): JsonResponse
    {
        try {
            $widget = $this->contextService->dissociateRuleFromWidget(
                $id,
                $widgetId,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Context rule dissociated from widget successfully',
                'data' => $widget
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get context rules associated with a widget.
     */
    public function getWidgetRules(Request $request, $widgetId): JsonResponse
    {
        try {
            $widget = Widget::findOrFail($widgetId);

            // Check if widget belongs to user
            if ($widget->user_id !== $request->user()->id) {
                throw new \Exception("Widget not found");
            }

            $rules = $widget->contextRules()->get();

            return response()->json([
                'success' => true,
                'data' => $rules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Test a context rule with sample data.
     */
    public function testRule(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'context' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $rule = $this->contextService->getRule($id, $request->user()->id);
            $result = $rule->evaluateCondition($request->input('context', []));

            return response()->json([
                'success' => true,
                'data' => [
                    'matches' => $result,
                    'rule' => $rule
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get session context data.
     */
    public function getSessionContext(Request $request, $sessionId): JsonResponse
    {
        try {
            $contextData = $this->contextService->getContextSession($sessionId);
            return response()->json([
                'success' => true,
                'data' => $contextData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store session context data.
     */
    public function storeSessionContext(Request $request, $sessionId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $session = $this->contextService->storeContextSession(
                $sessionId,
                $request->input('data', [])
            );

            return response()->json([
                'success' => true,
                'message' => 'Context data stored successfully',
                'data' => $session
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear session context data.
     */
    public function clearSessionContext(Request $request, $sessionId): JsonResponse
    {
        try {
            $result = $this->contextService->clearContextSession($sessionId);
            return response()->json([
                'success' => true,
                'message' => $result ? 'Context data cleared successfully' : 'No context data found to clear'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
