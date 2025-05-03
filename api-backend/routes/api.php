
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AIModelController;
use App\Http\Controllers\WidgetController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\EmbedCodeController;
use App\Http\Controllers\WidgetAnalyticsController;
use App\Http\Controllers\ApiTestController;
use App\Http\Controllers\GuestUserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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
    Route::get('/user', [AuthController::class, 'user']);

    // User management routes
    Route::apiResource('users', App\Http\Controllers\UserController::class);
    Route::apiResource('roles', App\Http\Controllers\RoleController::class);
    Route::apiResource('permissions', App\Http\Controllers\PermissionController::class);
    Route::post('/users/{user}/roles', [App\Http\Controllers\UserController::class, 'assignRoles']);
    Route::post('/roles/{role}/permissions', [App\Http\Controllers\RoleController::class, 'assignPermissions']);

    // AI Model routes
    Route::apiResource('ai-models', AIModelController::class);
    Route::post('/ai-models/{id}/test', [AIModelController::class, 'testConnection']);

    // Widget routes
    Route::apiResource('widgets', WidgetController::class);

    // Chat management routes (admin)
    Route::get('/chat/sessions', [ChatController::class, 'listSessions']);

    // Embed code generator
    Route::post('/embed-code/generate', [EmbedCodeController::class, 'generate']);

    // Analytics routes
    Route::get('/widgets/{widget_id}/analytics', [WidgetAnalyticsController::class, 'getAnalytics']);
    Route::get('/widgets/{widget_id}/analytics/summary', [WidgetAnalyticsController::class, 'getSummary']);
    
    // API Testing routes
    Route::prefix('test')->group(function () {
        Route::get('/routes', [ApiTestController::class, 'listRoutes']);
        Route::get('/ai-models', [ApiTestController::class, 'testAIModelEndpoints']);
        Route::get('/widgets', [ApiTestController::class, 'testWidgetEndpoints']);
        Route::get('/all', [ApiTestController::class, 'testAllEndpoints']);
    });
});
