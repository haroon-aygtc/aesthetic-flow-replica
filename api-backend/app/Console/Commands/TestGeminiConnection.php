<?php

namespace App\Console\Commands;

use App\Models\AIModel;
use App\Services\AI\Providers\GeminiProvider;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestGeminiConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:gemini {api_key?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test connection to the Gemini API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Gemini API connection...');
        
        // Get API key from command line or environment
        $apiKey = $this->argument('api_key') ?? env('GEMINI_API_KEY');
        
        if (empty($apiKey)) {
            $this->error('No API key provided. Please provide an API key as an argument or set GEMINI_API_KEY in your .env file.');
            return 1;
        }
        
        // Create a temporary model with the API key
        $model = new AIModel();
        $model->id = 0;
        $model->name = 'Gemini Test';
        $model->api_key = $apiKey;
        $model->settings = [
            'model_name' => env('GEMINI_DEFAULT_MODEL', 'gemini-1.5-pro'),
        ];
        
        // Create provider
        $provider = new GeminiProvider();
        
        // Test connection
        $this->info('Connecting to Gemini API...');
        $result = $provider->testConnection($model);
        
        if ($result['success']) {
            $this->info('✅ Connection successful!');
            $this->info('Available models: ' . implode(', ', $result['data']['available_models'] ?? []));
            
            // Test a simple message
            $this->info('Testing message processing...');
            
            $messages = [
                [
                    'role' => 'user',
                    'content' => 'Hello, can you tell me what time it is?'
                ]
            ];
            
            try {
                $response = $provider->processMessage($model, $messages);
                $this->info('✅ Message processed successfully!');
                $this->info('Response: ' . $response['content']);
                
                return 0;
            } catch (\Exception $e) {
                $this->error('❌ Message processing failed: ' . $e->getMessage());
                return 1;
            }
        } else {
            $this->error('❌ Connection failed: ' . $result['message']);
            return 1;
        }
    }
}
