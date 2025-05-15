<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\Widget;
use App\Services\TemplateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class TemplateController extends Controller
{
    protected $templateService;

    public function __construct(TemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    /**
     * Get all templates for a user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $templates = $this->templateService->getTemplates($request->user()->id);
            return response()->json([
                'success' => true,
                'data' => $templates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific template.
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $template = $this->templateService->getTemplate($id, $request->user()->id);
            return response()->json([
                'success' => true,
                'data' => $template
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new template.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'content' => 'required|string',
            'description' => 'nullable|string',
            'placeholders' => 'nullable|array',
            'placeholders.*.name' => 'required|string',
            'placeholders.*.description' => 'nullable|string',
            'placeholders.*.default_value' => 'nullable|string',
            'placeholders.*.required' => 'nullable|boolean',
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
            $template = $this->templateService->createTemplate(
                $request->user()->id,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Template created successfully',
                'data' => $template
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a template.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'placeholders' => 'nullable|array',
            'placeholders.*.name' => 'required|string',
            'placeholders.*.description' => 'nullable|string',
            'placeholders.*.default_value' => 'nullable|string',
            'placeholders.*.required' => 'nullable|boolean',
            'settings' => 'nullable|array',
            'priority' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'create_version' => 'nullable|boolean',
            'version_name' => 'nullable|string|max:255',
            'change_notes' => 'nullable|string',
            'set_version_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $createVersion = $request->input('create_version', true);
            $template = $this->templateService->updateTemplate(
                $id,
                $request->user()->id,
                $request->all(),
                $createVersion
            );

            return response()->json([
                'success' => true,
                'message' => 'Template updated successfully',
                'data' => $template
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Delete a template.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $result = $this->templateService->deleteTemplate($id, $request->user()->id);
            return response()->json([
                'success' => true,
                'message' => 'Template deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new version of a template.
     */
    public function createVersion(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|required|string',
            'placeholders' => 'nullable|array',
            'settings' => 'nullable|array',
            'version_name' => 'nullable|string|max:255',
            'change_notes' => 'nullable|string',
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
            $version = $this->templateService->createTemplateVersion(
                $id,
                $request->user()->id,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Template version created successfully',
                'data' => $version
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all versions of a template.
     */
    public function getVersions(Request $request, $id): JsonResponse
    {
        try {
            $template = $this->templateService->getTemplate($id, $request->user()->id);
            $versions = $template->versions()->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $versions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get a specific version of a template.
     */
    public function getVersion(Request $request, $id, $versionId): JsonResponse
    {
        try {
            $version = $this->templateService->getTemplateVersion($versionId, $request->user()->id);
            return response()->json([
                'success' => true,
                'data' => $version
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Activate a specific version of a template.
     */
    public function activateVersion(Request $request, $id, $versionId): JsonResponse
    {
        try {
            $version = $this->templateService->activateTemplateVersion($versionId, $request->user()->id);
            return response()->json([
                'success' => true,
                'message' => 'Template version activated successfully',
                'data' => $version
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Delete a specific version of a template.
     */
    public function deleteVersion(Request $request, $id, $versionId): JsonResponse
    {
        try {
            $result = $this->templateService->deleteTemplateVersion($versionId, $request->user()->id);
            return response()->json([
                'success' => true,
                'message' => 'Template version deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Associate a template with a widget.
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
            $widget = $this->templateService->associateTemplateWithWidget(
                $id,
                $widgetId,
                $request->user()->id,
                $request->input('settings', [])
            );

            return response()->json([
                'success' => true,
                'message' => 'Template associated with widget successfully',
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
     * Dissociate a template from a widget.
     */
    public function dissociateFromWidget(Request $request, $id, $widgetId): JsonResponse
    {
        try {
            $widget = $this->templateService->dissociateTemplateFromWidget(
                $id,
                $widgetId,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Template dissociated from widget successfully',
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
     * Get templates associated with a widget.
     */
    public function getWidgetTemplates(Request $request, $widgetId): JsonResponse
    {
        try {
            $widget = Widget::findOrFail($widgetId);

            // Check if widget belongs to user
            if ($widget->user_id !== $request->user()->id) {
                throw new \Exception("Widget not found");
            }

            $templates = $widget->templates()->with('versions')->get();

            return response()->json([
                'success' => true,
                'data' => $templates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Preview a template with data.
     */
    public function previewTemplate(Request $request, $id): JsonResponse
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
            $rendered = $this->templateService->renderTemplate(
                $id,
                $request->input('data', [])
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'rendered' => $rendered
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
     * Detect placeholders in template content.
     */
    public function detectPlaceholders(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $template = new Template();
            $template->content = $request->input('content');
            $placeholders = $template->detectPlaceholders();

            return response()->json([
                'success' => true,
                'data' => [
                    'placeholders' => $placeholders
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
