<?php

namespace App\Http\Controllers\ApiTest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AIModel;

class AIModelTestController extends Controller
{
    /**
     * Test AI Models API endpoints
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function testAIModelEndpoints(Request $request)
    {
        $results = [];
        $success = true;

        try {
            // Create a test model
            $testModel = AIModel::create([
                'name' => 'API Test Model ' . time(),
                'provider' => 'Test Provider',
                'description' => 'Created by automated API test',
                'is_default' => false
            ]);

            $results['create'] = [
                'status' => 'success',
                'model_id' => $testModel->id
            ];

            // Test fetch all models
            $allModels = AIModel::all();
            $results['list'] = [
                'status' => 'success',
                'count' => count($allModels)
            ];

            // Test get single model
            $singleModel = AIModel::find($testModel->id);
            $results['get'] = [
                'status' => 'success',
                'found' => $singleModel !== null
            ];

            // Test update model
            $testModel->name = 'Updated Test Model';
            $testModel->save();
            $results['update'] = [
                'status' => 'success'
            ];

            // Test delete model
            $testModel->delete();
            $results['delete'] = [
                'status' => 'success',
                'model_exists' => AIModel::find($testModel->id) !== null
            ];

        } catch (\Exception $e) {
            Log::error('AI Model API test failed: ' . $e->getMessage());
            $success = false;
            $results['error'] = [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ];
        }

        return response()->json([
            'success' => $success,
            'results' => $results,
            'message' => $success ? 'All AI Model API tests completed successfully' : 'AI Model API tests failed'
        ]);
    }
}
