<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AIModelController;
use App\Http\Controllers\ModelActivationRuleController;
use App\Http\Controllers\ModelAnalyticsController;
use App\Http\Controllers\WidgetController;
use App\Http\Controllers\WidgetConfigController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\EmbedCodeController;
use App\Http\Controllers\WidgetAnalyticsController;
use App\Http\Controllers\ApiTestController;
use App\Http\Controllers\GuestUserController;
use App\Http\Controllers\GuestUserAdminController;
use App\Http\Controllers\FollowUpController;
use App\Http\Controllers\BrandingController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\API\ProviderAPIController;
use App\Http\Controllers\KnowledgeBaseController;
use App\Http\Controllers\WebsiteSourceController;
use App\Http\Controllers\ContextController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// CORS test route
Route::options('/register', function() {
    return response()->json(['message' => 'CORS preflight request successful'], 200);
});

// Widget public routes (for embeddable widget)
Route::get('/widgets/public/{widgetId}', [WidgetController::class, 'getByWidgetId']);
Route::post('/chat/session/init', [ChatController::class, 'initSession']);
Route::post('/chat/message', [ChatController::class, 'sendMessage']);
Route::get('/chat/history', [ChatController::class, 'getHistory']);
Route::post('/widget/analytics/view', [WidgetAnalyticsController::class, 'trackEvent']);

// Guest user routes for widget
Route::post('/guest/register', [GuestUserController::class, 'register']);
Route::post('/guest/validate', [GuestUserController::class, 'validateSession']);
Route::post('/guest/details', [GuestUserController::class, 'getDetails']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getCurrentUser']);

    // User management routes
    Route::apiResource('users', App\Http\Controllers\UserController::class);
    Route::apiResource('roles', App\Http\Controllers\RoleController::class);
    Route::apiResource('permissions', App\Http\Controllers\PermissionController::class);
    Route::post('/users/{user}/roles', [App\Http\Controllers\UserController::class, 'assignRoles']);
    Route::post('/roles/{role}/permissions', [App\Http\Controllers\RoleController::class, 'assignPermissions']);

    // Admin Provider Management Routes
    Route::apiResource('admin/providers', App\Http\Controllers\Admin\ProviderAdminController::class);

    // Provider Models
    Route::get('admin/providers/{id}/models', [App\Http\Controllers\Admin\ProviderAdminController::class, 'manageModels']);
    Route::post('admin/providers/{id}/models', [App\Http\Controllers\Admin\ProviderAdminController::class, 'storeModel']);
    Route::put('admin/providers/{providerId}/models/{modelId}', [App\Http\Controllers\Admin\ProviderAdminController::class, 'updateModel']);
    Route::delete('admin/providers/{providerId}/models/{modelId}', [App\Http\Controllers\Admin\ProviderAdminController::class, 'destroyModel']);
    Route::post('admin/providers/{id}/discover-models', [App\Http\Controllers\Admin\ProviderAdminController::class, 'discoverModels']);

    // Provider Parameters
    Route::get('admin/providers/{id}/parameters', [App\Http\Controllers\Admin\ProviderAdminController::class, 'manageParameters']);
    Route::post('admin/providers/{id}/parameters', [App\Http\Controllers\Admin\ProviderAdminController::class, 'updateParameters']);

    // AI Model routes
    Route::apiResource('ai-models', AIModelController::class);
    Route::post('/ai-models/{id}/test', [AIModelController::class, 'testConnection']);
    Route::post('/ai-models/{id}/test-chat', [AIModelController::class, 'testChat']);
    Route::get('/ai-models/{id}/fallback-options', [AIModelController::class, 'getFallbackOptions']);
    Route::post('/ai-models/{id}/toggle-activation', [AIModelController::class, 'toggleActivation']);
    Route::get('/ai-models/{id}/available-models', [AIModelController::class, 'getAvailableModels']);
    Route::post('/ai-models/{id}/discover-models', [AIModelController::class, 'discoverModels']);

    // Template routes
    Route::apiResource('templates', TemplateController::class);
    Route::get('/ai-models/{modelId}/templates', [TemplateController::class, 'getModelTemplates']);
    Route::post('/ai-models/{modelId}/templates', [TemplateController::class, 'assignTemplateToModel']);

    // Updated Template routes for new module
    Route::prefix('templates')->group(function () {
        Route::post('/{id}/versions', [TemplateController::class, 'createVersion']);
        Route::get('/{id}/versions', [TemplateController::class, 'getVersions']);
        Route::get('/{id}/versions/{versionId}', [TemplateController::class, 'getVersion']);
        Route::post('/{id}/versions/{versionId}/activate', [TemplateController::class, 'activateVersion']);
        Route::delete('/{id}/versions/{versionId}', [TemplateController::class, 'deleteVersion']);

        Route::post('/{id}/widgets/{widgetId}', [TemplateController::class, 'associateWithWidget']);
        Route::delete('/{id}/widgets/{widgetId}', [TemplateController::class, 'dissociateFromWidget']);
        Route::post('/{id}/preview', [TemplateController::class, 'previewTemplate']);
        Route::post('/detect-placeholders', [TemplateController::class, 'detectPlaceholders']);
    });

    Route::get('/widgets/{widgetId}/templates', [TemplateController::class, 'getWidgetTemplates']);

    // Context Module routes
    Route::apiResource('context-rules', ContextController::class);

    Route::prefix('context-rules')->group(function () {
        Route::post('/{id}/widgets/{widgetId}', [ContextController::class, 'associateWithWidget']);
        Route::delete('/{id}/widgets/{widgetId}', [ContextController::class, 'dissociateFromWidget']);
        Route::post('/{id}/test', [ContextController::class, 'testRule']);
    });

    Route::get('/widgets/{widgetId}/context-rules', [ContextController::class, 'getWidgetRules']);

    Route::prefix('context-sessions')->group(function () {
        Route::get('/{sessionId}', [ContextController::class, 'getSessionContext']);
        Route::post('/{sessionId}', [ContextController::class, 'storeSessionContext']);
        Route::delete('/{sessionId}', [ContextController::class, 'clearSessionContext']);
    });

    // Branding Module routes
    Route::apiResource('branding-settings', BrandingController::class);

    Route::prefix('branding-settings')->group(function () {
        Route::get('/default', [BrandingController::class, 'getDefault']);
        Route::post('/{id}/widgets/{widgetId}', [BrandingController::class, 'associateWithWidget']);
        Route::delete('/{id}/widgets/{widgetId}', [BrandingController::class, 'dissociateFromWidget']);
        Route::get('/{id}/css', [BrandingController::class, 'generateCss']);
    });

    Route::get('/widgets/{widgetId}/branding', [BrandingController::class, 'getWidgetBranding']);
    Route::get('/widgets/{widgetId}/branding/css', [BrandingController::class, 'generateWidgetCss']);

    // Model activation rules routes
    Route::get('/ai-models/{modelId}/rules', [ModelActivationRuleController::class, 'index']);
    Route::post('/ai-models/{modelId}/rules', [ModelActivationRuleController::class, 'store']);
    Route::put('/ai-models/{modelId}/rules/{ruleId}', [ModelActivationRuleController::class, 'update']);
    Route::delete('/ai-models/{modelId}/rules/{ruleId}', [ModelActivationRuleController::class, 'destroy']);

    // Model analytics routes
    Route::get('/analytics/models', [ModelAnalyticsController::class, 'getModelAnalytics']);
    Route::get('/analytics/models/{modelId}', [ModelAnalyticsController::class, 'getModelDetailedAnalytics']);
    Route::get('/analytics/models/{modelId}/detailed', [ModelAnalyticsController::class, 'getModelDetailedAnalytics']);
    Route::get('/analytics/models/{modelId}/errors', [ModelAnalyticsController::class, 'getModelErrorLogs']);

    // Widget routes
    Route::apiResource('widgets', WidgetController::class);
    Route::put('/widgets/{id}/knowledge-base', [WidgetController::class, 'updateKnowledgeBaseSettings']);

    // Widget Config routes
    Route::get('/widget-config/default', [WidgetConfigController::class, 'getDefault']);
    Route::get('/widget-config/{id}', [WidgetConfigController::class, 'show']);
    Route::post('/widget-config', [WidgetConfigController::class, 'store']);
    Route::put('/widget-config/{id}', [WidgetConfigController::class, 'update']);
    Route::delete('/widget-config/{id}', [WidgetConfigController::class, 'destroy']);

    // Guest user management routes (admin)
    Route::get('/guest-users', [GuestUserAdminController::class, 'index']);
    Route::get('/guest-users/{id}', [GuestUserAdminController::class, 'show']);
    Route::delete('/guest-users/{id}', [GuestUserAdminController::class, 'destroy']);
    Route::get('/chat/history', [GuestUserAdminController::class, 'getChatHistory'])->name('admin.chat.history');

    // Chat management routes (admin)
    Route::get('/chat/sessions', [ChatController::class, 'listSessions']);

    // Embed code generator
    Route::post('/embed-code/generate', [EmbedCodeController::class, 'generate']);

    // Analytics routes
    Route::get('/widgets/{widget_id}/analytics', [WidgetAnalyticsController::class, 'getAnalytics']);
    Route::get('/widgets/{widget_id}/analytics/summary', [WidgetAnalyticsController::class, 'getSummary']);

    // API Testing routes - should be disabled in production
    Route::prefix('test')->group(function () {
        Route::get('/routes', [ApiTestController::class, 'listRoutes']);
        Route::get('/ai-models', [ApiTestController::class, 'testAIModelEndpoints']);
        Route::get('/widgets', [ApiTestController::class, 'testWidgetEndpoints']);
        Route::get('/all', [ApiTestController::class, 'testAllEndpoints']);
    });

    // Follow-up Engine routes
    Route::get('/widgets/{widgetId}/follow-up', [FollowUpController::class, 'getSettings']);
    Route::put('/widgets/{widgetId}/follow-up', [FollowUpController::class, 'updateSettings']);
    Route::get('/widgets/{widgetId}/suggestions', [FollowUpController::class, 'getSuggestions']);
    Route::post('/widgets/{widgetId}/suggestions', [FollowUpController::class, 'addSuggestion']);
    Route::put('/widgets/{widgetId}/suggestions/{suggestionId}', [FollowUpController::class, 'updateSuggestion']);
    Route::delete('/widgets/{widgetId}/suggestions/{suggestionId}', [FollowUpController::class, 'deleteSuggestion']);
    Route::get('/widgets/{widgetId}/follow-up/stats', [FollowUpController::class, 'getStats']);

    // Branding Engine routes
    Route::get('/widgets/{widgetId}/branding', [BrandingController::class, 'getBrandingSettings']);
    Route::put('/widgets/{widgetId}/branding', [BrandingController::class, 'updateBrandingSettings']);
    Route::post('/widgets/{widgetId}/branding/preview', [BrandingController::class, 'generatePreview']);
    Route::get('/branding-templates', [BrandingController::class, 'getBrandingTemplates']);

    // Module Configuration routes
    Route::get('/module-configurations', [App\Http\Controllers\ModuleConfigurationController::class, 'index']);
    Route::get('/module-configurations/{moduleId}', [App\Http\Controllers\ModuleConfigurationController::class, 'show']);
    Route::put('/module-configurations/{moduleId}', [App\Http\Controllers\ModuleConfigurationController::class, 'update']);
    Route::post('/module-configurations/batch', [App\Http\Controllers\ModuleConfigurationController::class, 'batchUpdate']);

    // Add AI provider test route
    Route::post('/ai-test', [ApiTestController::class, 'testAIProvider']);

    // Public API test endpoint for discovering models without needing an existing model
    Route::post('/ai-test', [AIModelController::class, 'testAIConnection']);

    // Provider API routes
    Route::get('/providers', [ProviderAPIController::class, 'getProviders']);
    Route::get('/providers/{slug}/models', [ProviderAPIController::class, 'getProviderModels']);
    Route::get('/providers/{slug}/parameters', [ProviderAPIController::class, 'getProviderParameters']);

    // Knowledge Base routes
    Route::prefix('knowledge-base')->group(function () {
        Route::get('/documents', [KnowledgeBaseController::class, 'getDocuments']);
        Route::post('/documents/upload', [KnowledgeBaseController::class, 'uploadDocument']);
        Route::get('/documents/{id}', [KnowledgeBaseController::class, 'getDocument']);
        Route::delete('/documents/{id}', [KnowledgeBaseController::class, 'deleteDocument']);
        Route::post('/documents/{id}/process', [KnowledgeBaseController::class, 'processDocument']);
        Route::get('/documents/{id}/download', [KnowledgeBaseController::class, 'downloadDocument']);
        Route::get('/documents/{id}/embeddings', [KnowledgeBaseController::class, 'getDocumentEmbeddings']);

        Route::get('/qa-pairs', [KnowledgeBaseController::class, 'getQAPairs']);
        Route::post('/qa-pairs', [KnowledgeBaseController::class, 'createQAPair']);
        Route::put('/qa-pairs/{id}', [KnowledgeBaseController::class, 'updateQAPair']);
        Route::delete('/qa-pairs/{id}', [KnowledgeBaseController::class, 'deleteQAPair']);

        Route::get('/website-sources', [WebsiteSourceController::class, 'index']);
        Route::post('/website-sources', [WebsiteSourceController::class, 'store']);
        Route::get('/website-sources/{id}', [WebsiteSourceController::class, 'show']);
        Route::put('/website-sources/{id}', [WebsiteSourceController::class, 'update']);
        Route::delete('/website-sources/{id}', [WebsiteSourceController::class, 'destroy']);
        Route::post('/website-sources/{id}/refresh', [WebsiteSourceController::class, 'refresh']);
        Route::get('/website-sources/{id}/preview', [WebsiteSourceController::class, 'previewContent']);
        Route::post('/website-sources/{id}/export', [WebsiteSourceController::class, 'exportContent']);

        Route::get('/insights', [KnowledgeBaseController::class, 'getInsights']);
        Route::post('/search', [KnowledgeBaseController::class, 'search']);

        // New Knowledge Base routes
        Route::get('/bases', [KnowledgeBaseController::class, 'index']);
        Route::post('/bases', [KnowledgeBaseController::class, 'store']);
        Route::get('/bases/{id}', [KnowledgeBaseController::class, 'show']);
        Route::put('/bases/{id}', [KnowledgeBaseController::class, 'update']);
        Route::delete('/bases/{id}', [KnowledgeBaseController::class, 'destroy']);

        // Knowledge Base Source routes
        Route::get('/bases/{id}/sources', [KnowledgeBaseController::class, 'getSources']);
        Route::post('/bases/{id}/sources', [KnowledgeBaseController::class, 'addSource']);
        Route::put('/bases/{id}/sources/{sourceId}', [KnowledgeBaseController::class, 'updateSource']);
        Route::delete('/bases/{id}/sources/{sourceId}', [KnowledgeBaseController::class, 'deleteSource']);

        // Knowledge Base Entry routes
        Route::post('/bases/{id}/sources/{sourceId}/entries', [KnowledgeBaseController::class, 'addEntry']);
        Route::put('/bases/{id}/sources/{sourceId}/entries/{entryId}', [KnowledgeBaseController::class, 'updateEntry']);
        Route::delete('/bases/{id}/sources/{sourceId}/entries/{entryId}', [KnowledgeBaseController::class, 'deleteEntry']);

        // Document processing routes
        Route::post('/bases/upload-document', [KnowledgeBaseController::class, 'uploadDocumentFile']);
        Route::post('/sources/{sourceId}/process', [KnowledgeBaseController::class, 'processDocumentSource']);
        Route::get('/sources/{sourceId}/download', [KnowledgeBaseController::class, 'downloadDocumentSource']);

        // Knowledge search
        Route::post('/knowledge-search', [KnowledgeBaseController::class, 'searchKnowledge']);
    });
});
