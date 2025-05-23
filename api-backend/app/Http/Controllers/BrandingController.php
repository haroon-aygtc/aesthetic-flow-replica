<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\BrandingSetting;
use App\Models\Widget;
use App\Services\BrandingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class BrandingController extends Controller
{
    protected $brandingService;

    public function __construct(BrandingService $brandingService)
    {
        $this->brandingService = $brandingService;
    }

    /**
     * Get all branding settings for a user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $settings = $this->brandingService->getSettings($request->user()->id);
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific branding setting.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $setting = $this->brandingService->getSetting($id, $request->user()->id);
            return response()->json([
                'success' => true,
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new branding setting.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'logo_url' => 'nullable|string|max:2048',
            'colors' => 'nullable|array',
            'typography' => 'nullable|array',
            'elements' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $setting = $this->brandingService->createSetting(
                $request->user()->id,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Branding setting created successfully',
                'data' => $setting
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a branding setting.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'logo_url' => 'nullable|string|max:2048',
            'colors' => 'nullable|array',
            'typography' => 'nullable|array',
            'elements' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $setting = $this->brandingService->updateSetting(
                $id,
                $request->user()->id,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Branding setting updated successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Delete a branding setting.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $result = $this->brandingService->deleteSetting($id, $request->user()->id);
            return response()->json([
                'success' => true,
                'message' => 'Branding setting deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get the default branding setting.
     */
    public function getDefault(Request $request): JsonResponse
    {
        try {
            $setting = $this->brandingService->getDefaultSetting($request->user()->id);

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'No default branding setting found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Associate a branding setting with a widget.
     */
    public function associateWithWidget(Request $request, $id, $widgetId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'overrides' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $widget = $this->brandingService->associateSettingWithWidget(
                $id,
                $widgetId,
                $request->user()->id,
                $request->input('overrides', [])
            );

            return response()->json([
                'success' => true,
                'message' => 'Branding setting associated with widget successfully',
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
     * Dissociate a branding setting from a widget.
     */
    public function dissociateFromWidget(Request $request, $id, $widgetId): JsonResponse
    {
        try {
            $widget = $this->brandingService->dissociateSettingFromWidget(
                $id,
                $widgetId,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Branding setting dissociated from widget successfully',
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
     * Get branding settings for a widget.
     */
    public function getWidgetBranding(Request $request, $widgetId): JsonResponse
    {
        try {
            $settings = $this->brandingService->getWidgetBrandingSettings(
                $widgetId,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Generate CSS variables for a branding setting.
     */
    public function generateCss(Request $request, $id): JsonResponse
    {
        try {
            $setting = $this->brandingService->getSetting($id, $request->user()->id);
            $css = $this->brandingService->generateCssVariables($setting->getMergedSettings());

            return response()->json([
                'success' => true,
                'data' => [
                    'css' => $css
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
     * Generate CSS variables for a widget's branding.
     */
    public function generateWidgetCss(Request $request, $widgetId): JsonResponse
    {
        try {
            $settings = $this->brandingService->getWidgetBrandingSettings(
                $widgetId,
                $request->user()->id
            );

            $css = $this->brandingService->generateCssVariables($settings);

            return response()->json([
                'success' => true,
                'data' => [
                    'css' => $css
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }
}
