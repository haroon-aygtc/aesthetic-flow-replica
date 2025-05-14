<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\API\ProviderAPIController;
use Illuminate\Http\Request;

try {
    echo "Testing the ProviderAPIController directly...\n";
    
    // Create a controller instance
    $controller = new ProviderAPIController();
    
    echo "\nTesting getProviders method...\n";
    $response = $controller->getProviders();
    $data = json_decode($response->getContent(), true);
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    echo "Provider count: " . count($data['data']) . "\n";
    
    echo "\nTesting getProviderModels method for 'openai'...\n";
    $response = $controller->getProviderModels('openai');
    $data = json_decode($response->getContent(), true);
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    echo "Model count: " . count($data['data']) . "\n";
    
    echo "\nTesting getProviderParameters method for 'openai'...\n";
    $response = $controller->getProviderParameters('openai');
    $data = json_decode($response->getContent(), true);
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    echo "Parameters returned: " . json_encode($data['data']) . "\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
} 