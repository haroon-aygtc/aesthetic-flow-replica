<?php

namespace App\Http\Controllers\ApiTest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ApiTestCoordinatorController extends Controller
{
    /**
     * Run all API tests
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAllEndpoints(Request $request)
    {
        $allResults = [];

        // Test AI Models API
        $aiModelTestController = new AIModelEndpointTestController();
        $aiModelResults = $aiModelTestController->testAIModelEndpoints($request)->original;
        $allResults['ai_models'] = $aiModelResults;

        // Test Widgets API
        $widgetTestController = new WidgetTestController();
        $widgetResults = $widgetTestController->testWidgetEndpoints($request)->original;
        $allResults['widgets'] = $widgetResults;

        // Overall success
        $overallSuccess =
            ($aiModelResults['success'] ?? false) &&
            ($widgetResults['success'] ?? false);

        return response()->json([
            'success' => $overallSuccess,
            'results' => $allResults,
            'message' => $overallSuccess ? 'All API tests completed successfully' : 'Some API tests failed'
        ]);
    }
}
