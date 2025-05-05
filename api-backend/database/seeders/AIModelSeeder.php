<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AIModel;

class AIModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default AI models
        $openAIModel = AIModel::create([
            'name' => 'OpenAI GPT-4',
            'provider' => 'OpenAI',
            'description' => 'OpenAI\'s GPT-4 model for general purpose AI tasks',
            'api_key' => env('OPENAI_API_KEY', 'your-api-key-here'),
            'settings' => [
                'model_name' => 'gpt-4',
                'temperature' => 0.7,
                'max_tokens' => 2048,
            ],
            'is_default' => true,
            'active' => true,
            'confidence_threshold' => 0.7,
        ]);

        $anthropicModel = AIModel::create([
            'name' => 'Anthropic Claude',
            'provider' => 'Anthropic',
            'description' => 'Anthropic\'s Claude model for conversational AI',
            'api_key' => env('ANTHROPIC_API_KEY', 'your-api-key-here'),
            'settings' => [
                'model_name' => 'claude-2',
                'temperature' => 0.7,
                'max_tokens' => 2048,
            ],
            'is_default' => false,
            'active' => true,
            'confidence_threshold' => 0.7,
            'fallback_model_id' => $openAIModel->id,
        ]);

        $googleModel = AIModel::create([
            'name' => 'Google Gemini',
            'provider' => 'Google',
            'description' => 'Google\'s Gemini model for advanced reasoning',
            'api_key' => env('GOOGLE_API_KEY', 'your-api-key-here'),
            'settings' => [
                'model_name' => 'gemini-pro',
                'temperature' => 0.7,
                'max_tokens' => 2048,
            ],
            'is_default' => false,
            'active' => true,
            'confidence_threshold' => 0.7,
            'fallback_model_id' => $openAIModel->id,
        ]);

        $this->command->info('AI Models seeded successfully!');
    }
}
