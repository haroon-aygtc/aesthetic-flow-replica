<?php

namespace Database\Seeders;

use App\Models\AIProvider;
use Illuminate\Database\Seeder;

class ProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create OpenAI provider
        $openai = AIProvider::create([
            'name' => 'OpenAI',
            'slug' => 'openai',
            'description' => 'OpenAI API integration for GPT models',
            'api_base_url' => 'https://api.openai.com/v1',
            'capabilities' => ['chat', 'embeddings', 'vision', 'function_calling'],
            'auth_config' => [
                'type' => 'bearer',
                'header_name' => 'Authorization',
                'prefix' => 'Bearer'
            ],
            'supports_streaming' => true,
            'requires_model_selection' => true,
            'is_active' => true
        ]);
        
        // Add OpenAI models
        $openai->models()->createMany([
            [
                'model_id' => 'gpt-4o',
                'display_name' => 'GPT-4o',
                'description' => 'Most capable multimodal model for text and vision tasks',
                'is_free' => false,
                'is_restricted' => false,
                'is_featured' => true,
                'input_token_limit' => 128000,
                'output_token_limit' => 4096,
                'capabilities' => ['chat', 'vision', 'function_calling'],
                'display_order' => 10
            ],
            [
                'model_id' => 'gpt-4-turbo',
                'display_name' => 'GPT-4 Turbo',
                'description' => 'Fast and powerful model for complex tasks',
                'is_free' => false,
                'is_restricted' => false,
                'is_featured' => false,
                'input_token_limit' => 128000,
                'output_token_limit' => 4096,
                'capabilities' => ['chat', 'function_calling'],
                'display_order' => 20
            ],
            [
                'model_id' => 'gpt-3.5-turbo',
                'display_name' => 'GPT-3.5 Turbo',
                'description' => 'Fast and cost-effective for everyday tasks',
                'is_free' => true,
                'is_restricted' => false,
                'is_featured' => false,
                'input_token_limit' => 16384,
                'output_token_limit' => 4096,
                'capabilities' => ['chat', 'function_calling'],
                'display_order' => 30
            ]
        ]);
        
        // Add OpenAI parameters
        $openai->parameters()->createMany([
            [
                'param_key' => 'temperature',
                'display_name' => 'Temperature',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 2,
                    'step' => 0.1,
                    'presets' => ['precise' => 0.2, 'balanced' => 0.7, 'creative' => 1.0]
                ],
                'default_value' => 0.7,
                'description' => 'Controls randomness in responses',
                'is_required' => true,
                'display_order' => 10
            ],
            [
                'param_key' => 'max_tokens',
                'display_name' => 'Max Tokens',
                'type' => 'number',
                'config' => [
                    'min' => 1,
                    'max' => 16000,
                    'step' => 1,
                ],
                'default_value' => 4000,
                'description' => 'Maximum length of the generated response',
                'is_required' => true,
                'display_order' => 20
            ],
            [
                'param_key' => 'top_p',
                'display_name' => 'Top P',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 1,
                    'step' => 0.01,
                ],
                'default_value' => 1,
                'description' => 'Controls diversity via nucleus sampling',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 30
            ],
            [
                'param_key' => 'frequency_penalty',
                'display_name' => 'Frequency Penalty',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 2,
                    'step' => 0.01,
                ],
                'default_value' => 0,
                'description' => 'Reduces repetition by penalizing tokens that have already appeared',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 40
            ],
            [
                'param_key' => 'presence_penalty',
                'display_name' => 'Presence Penalty',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 2,
                    'step' => 0.01,
                ],
                'default_value' => 0,
                'description' => 'Encourages talking about new topics',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 50
            ]
        ]);
        
        // Create Anthropic provider
        $anthropic = AIProvider::create([
            'name' => 'Anthropic',
            'slug' => 'anthropic',
            'description' => 'Anthropic API integration for Claude models',
            'api_base_url' => 'https://api.anthropic.com/v1',
            'capabilities' => ['chat', 'vision'],
            'auth_config' => [
                'type' => 'bearer',
                'header_name' => 'x-api-key',
                'prefix' => ''
            ],
            'supports_streaming' => true,
            'requires_model_selection' => true,
            'is_active' => true
        ]);
        
        // Add Anthropic models
        $anthropic->models()->createMany([
            [
                'model_id' => 'claude-3-opus-20240229',
                'display_name' => 'Claude 3 Opus',
                'description' => 'Most capable Claude model for complex tasks',
                'is_free' => false,
                'is_restricted' => false,
                'is_featured' => true,
                'input_token_limit' => 100000,
                'output_token_limit' => 4096,
                'capabilities' => ['chat', 'vision'],
                'display_order' => 10
            ],
            [
                'model_id' => 'claude-3-sonnet-20240229',
                'display_name' => 'Claude 3 Sonnet',
                'description' => 'Balanced model for most tasks',
                'is_free' => false,
                'is_restricted' => false,
                'is_featured' => false,
                'input_token_limit' => 100000,
                'output_token_limit' => 4096,
                'capabilities' => ['chat', 'vision'],
                'display_order' => 20
            ],
            [
                'model_id' => 'claude-3-haiku-20240307',
                'display_name' => 'Claude 3 Haiku',
                'description' => 'Fast and efficient model for simpler tasks',
                'is_free' => false,
                'is_restricted' => false,
                'is_featured' => false,
                'input_token_limit' => 100000,
                'output_token_limit' => 4096,
                'capabilities' => ['chat', 'vision'],
                'display_order' => 30
            ]
        ]);
        
        // Add Anthropic parameters
        $anthropic->parameters()->createMany([
            [
                'param_key' => 'temperature',
                'display_name' => 'Temperature',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 1,
                    'step' => 0.1,
                    'presets' => ['precise' => 0.1, 'balanced' => 0.7, 'creative' => 1.0]
                ],
                'default_value' => 0.7,
                'description' => 'Controls randomness in responses',
                'is_required' => true,
                'display_order' => 10
            ],
            [
                'param_key' => 'max_tokens',
                'display_name' => 'Max Tokens',
                'type' => 'number',
                'config' => [
                    'min' => 1,
                    'max' => 100000,
                    'step' => 1,
                ],
                'default_value' => 4000,
                'description' => 'Maximum length of the generated response',
                'is_required' => true,
                'display_order' => 20
            ]
        ]);
    }
} 