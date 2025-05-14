<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking ai_providers table structure...\n";
$columns = \Illuminate\Support\Facades\Schema::getColumnListing('ai_providers');
echo "Columns: " . implode(', ', $columns) . "\n";

echo "\nChecking for providers...\n";
$providers = \Illuminate\Support\Facades\DB::table('ai_providers')->get();
echo "Found " . count($providers) . " providers.\n";

foreach ($providers as $provider) {
    echo "\nProvider ID: " . $provider->id . "\n";
    foreach ((array)$provider as $key => $value) {
        if (is_object($value) || is_array($value)) {
            $value = json_encode($value);
        }
        echo "- $key: " . $value . "\n";
    }
    
    // Check for related parameters
    echo "\nChecking parameters...\n";
    try {
        $parameters = \Illuminate\Support\Facades\DB::table('provider_parameters')
            ->where('provider_id', $provider->id)
            ->get();
        echo "Found " . count($parameters) . " parameters.\n";
        foreach ($parameters as $param) {
            echo "  - " . $param->param_key . " (" . $param->display_name . ")\n";
        }
    } catch (\Exception $e) {
        echo "Error fetching parameters: " . $e->getMessage() . "\n";
    }
    
    // Check for related models
    echo "\nChecking models...\n";
    try {
        $models = \Illuminate\Support\Facades\DB::table('provider_models')
            ->where('provider_id', $provider->id)
            ->get();
        echo "Found " . count($models) . " models.\n";
        foreach ($models as $model) {
            echo "  - " . $model->model_id . " (" . $model->display_name . ")\n";
        }
    } catch (\Exception $e) {
        echo "Error fetching models: " . $e->getMessage() . "\n";
    }
} 