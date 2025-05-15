<?php

namespace App\Services;

use App\Models\Template;
use App\Models\TemplateVersion;
use App\Models\Widget;
use Illuminate\Support\Facades\Log;
use Exception;

class TemplateService
{
    /**
     * The context service instance.
     *
     * @var \App\Services\ContextService
     */
    protected $contextService;

    /**
     * Create a new service instance.
     *
     * @param  \App\Services\ContextService  $contextService
     * @return void
     */
    public function __construct(ContextService $contextService = null)
    {
        $this->contextService = $contextService;
    }

    /**
     * Get templates for a user.
     *
     * @param  int  $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTemplates($userId)
    {
        return Template::where('user_id', $userId)
                      ->with('versions')
                      ->get();
    }

    /**
     * Get a template by ID.
     *
     * @param  int  $id
     * @param  int  $userId
     * @return \App\Models\Template
     * @throws \Exception
     */
    public function getTemplate($id, $userId)
    {
        $template = Template::where('id', $id)
                          ->where('user_id', $userId)
                          ->with('versions')
                          ->first();

        if (!$template) {
            throw new Exception("Template not found");
        }

        return $template;
    }

    /**
     * Create a new template.
     *
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\Template
     */
    public function createTemplate($userId, array $data)
    {
        $template = new Template();
        $template->user_id = $userId;
        $template->name = $data['name'];
        $template->description = $data['description'] ?? null;
        $template->content = $data['content'];
        $template->priority = $data['priority'] ?? 0;
        $template->is_active = $data['is_active'] ?? true;

        // Auto-detect placeholders if not provided
        if (!isset($data['placeholders'])) {
            $template->placeholders = $template->detectPlaceholders();
        } else {
            $template->placeholders = $data['placeholders'];
        }

        $template->settings = $data['settings'] ?? [];
        $template->save();

        // Create initial version
        $template->createVersion([
            'version_name' => 'Version 1',
            'change_notes' => 'Initial version',
            'is_active' => true,
        ], $userId);

        return $template;
    }

    /**
     * Update a template.
     *
     * @param  int  $id
     * @param  int  $userId
     * @param  array  $data
     * @param  bool  $createVersion
     * @return \App\Models\Template
     * @throws \Exception
     */
    public function updateTemplate($id, $userId, array $data, $createVersion = true)
    {
        $template = $this->getTemplate($id, $userId);

        // Check if content has changed
        $contentChanged = isset($data['content']) && $data['content'] !== $template->content;

        // Update template attributes
        if (isset($data['name'])) {
            $template->name = $data['name'];
        }

        if (isset($data['description'])) {
            $template->description = $data['description'];
        }

        if (isset($data['content'])) {
            $template->content = $data['content'];

            // Auto-detect placeholders if not provided
            if (!isset($data['placeholders'])) {
                $template->placeholders = $template->detectPlaceholders();
            }
        }

        if (isset($data['placeholders'])) {
            $template->placeholders = $data['placeholders'];
        }

        if (isset($data['settings'])) {
            $template->settings = $data['settings'];
        }

        if (isset($data['priority'])) {
            $template->priority = $data['priority'];
        }

        if (isset($data['is_active'])) {
            $template->is_active = $data['is_active'];
        }

        $template->save();

        // Create a new version if content changed and createVersion is true
        if ($contentChanged && $createVersion) {
            $versionData = [
                'content' => $template->content,
                'placeholders' => $template->placeholders,
                'settings' => $template->settings,
                'version_name' => $data['version_name'] ?? null,
                'change_notes' => $data['change_notes'] ?? 'Content updated',
                'is_active' => $data['set_version_active'] ?? false,
            ];

            $template->createVersion($versionData, $userId);
        }

        return $template;
    }

    /**
     * Delete a template.
     *
     * @param  int  $id
     * @param  int  $userId
     * @return bool
     * @throws \Exception
     */
    public function deleteTemplate($id, $userId)
    {
        $template = $this->getTemplate($id, $userId);
        return $template->delete();
    }

    /**
     * Create a new template version.
     *
     * @param  int  $templateId
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\TemplateVersion
     * @throws \Exception
     */
    public function createTemplateVersion($templateId, $userId, array $data)
    {
        $template = $this->getTemplate($templateId, $userId);

        $versionData = [
            'content' => $data['content'] ?? $template->content,
            'placeholders' => $data['placeholders'] ?? $template->placeholders,
            'settings' => $data['settings'] ?? $template->settings,
            'version_name' => $data['version_name'] ?? null,
            'change_notes' => $data['change_notes'] ?? null,
            'is_active' => $data['is_active'] ?? false,
        ];

        return $template->createVersion($versionData, $userId);
    }

    /**
     * Activate a template version.
     *
     * @param  int  $versionId
     * @param  int  $userId
     * @return \App\Models\TemplateVersion
     * @throws \Exception
     */
    public function activateTemplateVersion($versionId, $userId)
    {
        $version = TemplateVersion::findOrFail($versionId);
        $template = $this->getTemplate($version->template_id, $userId);

        return $version->makeActive();
    }

    /**
     * Get a template version.
     *
     * @param  int  $versionId
     * @param  int  $userId
     * @return \App\Models\TemplateVersion
     * @throws \Exception
     */
    public function getTemplateVersion($versionId, $userId)
    {
        $version = TemplateVersion::findOrFail($versionId);
        $template = $this->getTemplate($version->template_id, $userId);

        return $version;
    }

    /**
     * Delete a template version.
     *
     * @param  int  $versionId
     * @param  int  $userId
     * @return bool
     * @throws \Exception
     */
    public function deleteTemplateVersion($versionId, $userId)
    {
        $version = TemplateVersion::findOrFail($versionId);
        $template = $this->getTemplate($version->template_id, $userId);

        // Check if this is the only version
        if ($template->versions()->count() <= 1) {
            throw new Exception("Cannot delete the only version of a template");
        }

        // Check if this is the active version
        if ($version->is_active) {
            throw new Exception("Cannot delete the active version of a template");
        }

        return $version->delete();
    }

    /**
     * Associate a template with a widget.
     *
     * @param  int  $templateId
     * @param  int  $widgetId
     * @param  int  $userId
     * @param  array  $settings
     * @return \App\Models\Widget
     * @throws \Exception
     */
    public function associateTemplateWithWidget($templateId, $widgetId, $userId, array $settings = [])
    {
        $template = $this->getTemplate($templateId, $userId);
        $widget = Widget::findOrFail($widgetId);

        // Check if widget belongs to user
        if ($widget->user_id !== $userId) {
            throw new Exception("Widget not found");
        }

        $widget->templates()->sync([$templateId => ['settings' => $settings]], false);

        return $widget;
    }

    /**
     * Dissociate a template from a widget.
     *
     * @param  int  $templateId
     * @param  int  $widgetId
     * @param  int  $userId
     * @return \App\Models\Widget
     * @throws \Exception
     */
    public function dissociateTemplateFromWidget($templateId, $widgetId, $userId)
    {
        $template = $this->getTemplate($templateId, $userId);
        $widget = Widget::findOrFail($widgetId);

        // Check if widget belongs to user
        if ($widget->user_id !== $userId) {
            throw new Exception("Widget not found");
        }

        $widget->templates()->detach($templateId);

        return $widget;
    }

    /**
     * Find the best template for a context.
     *
     * @param  int  $widgetId
     * @param  array  $context
     * @return \App\Models\Template|null
     */
    public function findTemplateForContext($widgetId, array $context = [])
    {
        $widget = Widget::findOrFail($widgetId);

        // Get all templates associated with the widget
        $templates = $widget->templates()
                           ->active()
                           ->orderByPriority()
                           ->get();

        if ($templates->isEmpty()) {
            return null;
        }

        // If there's a context service and context, use it to find the best template
        if ($this->contextService && !empty($context)) {
            foreach ($templates as $template) {
                $templateSettings = $template->pivot->settings ?? [];

                // Check if template has context rules
                if (!empty($templateSettings['context_rules'])) {
                    $matches = $this->contextService->evaluateContextRules(
                        $templateSettings['context_rules'],
                        $context
                    );

                    if ($matches) {
                        return $template;
                    }
                }
            }
        }

        // If no context-specific template found, return the highest priority one
        return $templates->first();
    }

    /**
     * Render a template with context.
     *
     * @param  int  $templateId
     * @param  array  $data
     * @return string
     * @throws \Exception
     */
    public function renderTemplate($templateId, array $data = [])
    {
        $template = Template::findOrFail($templateId);

        // If template has an active version, use that for rendering
        $activeVersion = $template->activeVersion();
        if ($activeVersion) {
            return $activeVersion->render($data);
        }

        // Otherwise use the template itself
        return $template->render($data);
    }

    /**
     * Enhance AI prompt with template.
     *
     * @param  array  $messages
     * @param  int  $widgetId
     * @param  array  $context
     * @param  array  $data
     * @return array
     */
    public function enhancePromptWithTemplate(array $messages, $widgetId, array $context = [], array $data = [])
    {
        try {
            // Find the best template for the context
            $template = $this->findTemplateForContext($widgetId, $context);

            if (!$template) {
                return $messages;
            }

            // Render the template
            $renderedContent = $this->renderTemplate($template->id, $data);

            // Add as system message or replace existing system message
            $systemMessage = null;
            foreach ($messages as $key => $message) {
                if ($message['role'] === 'system') {
                    $systemMessage = $message;
                    $systemMessage['content'] = $renderedContent;
                    $messages[$key] = $systemMessage;
                    break;
                }
            }

            // If no system message, add one
            if (!$systemMessage) {
                array_unshift($messages, [
                    'role' => 'system',
                    'content' => $renderedContent
                ]);
            }

            return $messages;
        } catch (Exception $e) {
            Log::error('Error enhancing prompt with template: ' . $e->getMessage());
            return $messages;
        }
    }
}
