<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AIModelController;
use App\Http\Controllers\ModelActivationRuleController;
use App\Http\Controllers\ModelAnalyticsController;
use App\Http\Controllers\WidgetController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\EmbedCodeController;
use App\Http\Controllers\WidgetAnalyticsController;
use App\Http\Controllers\ApiTestController;
use App\Http\Controllers\GuestUserController;
use App\Http\Controllers\GuestUserAdminController;
use App\Http\Controllers\FollowUpController;
use App\Http\Controllers\BrandingController;
use App\Http\Controllers\TemplateController;

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

    // Model activation rules routes
    Route::get('/ai-models/{modelId}/rules', [ModelActivationRuleController::class, 'index']);
    Route::post('/ai-models/{modelId}/rules', [ModelActivationRuleController::class, 'store']);
    Route::put('/ai-models/{modelId}/rules/{ruleId}', [ModelActivationRuleController::class, 'update']);
    Route::delete('/ai-models/{modelId}/rules/{ruleId}', [ModelActivationRuleController::class, 'destroy']);

    // Model analytics routes
    Route::get('/analytics/models', [ModelAnalyticsController::class, 'getModelAnalytics']);
    Route::get('/analytics/models/{modelId}', [ModelAnalyticsController::class, 'getModelDetailedAnalytics']);
    Route::get('/analytics/models/{modelId}/errors', [ModelAnalyticsController::class, 'getModelErrorLogs']);

    // Widget routes
    Route::apiResource('widgets', WidgetController::class);

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
});
