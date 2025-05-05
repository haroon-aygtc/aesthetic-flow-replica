<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\ApiTest\ApiTestRouteController;
use App\Http\Controllers\ApiTest\AIModelEndpointTestController;
use App\Http\Controllers\ApiTest\WidgetTestController;
use App\Http\Controllers\ApiTest\GuestUserTestController;
use App\Http\Controllers\ApiTest\ApiTestCoordinatorController;

class ApiTestController extends Controller
{
    /**
     * List all API routes for testing
     *
     * @return \Illuminate\Http\Response
     */
    public function listRoutes()
    {
        $routeController = new ApiTestRouteController();
        return $routeController->listRoutes();
    }

    /**
     * Test AI Models API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAIModelEndpoints(Request $request)
    {
        $controller = new AIModelEndpointTestController();
        return $controller->testAIModelEndpoints($request);
    }

    /**
     * Test Widget API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testWidgetEndpoints(Request $request)
    {
        $controller = new WidgetTestController();
        return $controller->testWidgetEndpoints($request);
    }

    /**
     * Test Guest User API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testGuestUserEndpoints(Request $request)
    {
        $controller = new GuestUserTestController();
        return $controller->testGuestUserEndpoints($request);
    }

    /**
     * Get all guest users
     *
     * @return \Illuminate\Http\Response
     */
    public function getAllGuestUsers()
    {
        $controller = new GuestUserTestController();
        return $controller->getAllGuestUsers();
    }

    /**
     * Run all API tests
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAllEndpoints(Request $request)
    {
        $controller = new ApiTestCoordinatorController();
        return $controller->testAllEndpoints($request);
    }
}
