<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\AIProvider;

try {
    echo "Attempting to fetch OpenAI provider...\n";
    $provider = AIProvider::where('slug', 'openai')->firstOrFail();
    echo "Found provider: " . $provider->name . "\n";
    
    echo "\nProvider details:\n";
    echo "ID: " . $provider->id . "\n";
    echo "Slug: " . $provider->slug . "\n";
    echo "API Base URL: " . $provider->api_base_url . "\n";
    
    echo "\nFetching parameters...\n";
    $parameters = $provider->parameters;
    echo "Found " . count($parameters) . " parameters.\n";
    foreach ($parameters as $param) {
        echo "- " . $param->param_key . " (" . $param->display_name . ")\n";
    }
    
    echo "\nFetching models...\n";
    $models = $provider->models;
    echo "Found " . count($models) . " models.\n";
    foreach ($models as $model) {
        echo "- " . $model->model_id . " (" . $model->display_name . ")\n";
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
} 