<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ModuleConfiguration;
use App\Models\AIModel;

class ModuleConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the default AI model if available
        $defaultModel = AIModel::where('is_default', true)->first();
        $defaultModelId = $defaultModel ? $defaultModel->id : null;

        // Define the default module configurations
        $modules = [
            [
                'module_id' => 'chat',
                'name' => 'Chat Interface',
                'description' => 'Configure AI model settings for the chat widget',
                'icon' => 'MessageSquare',
                'model_id' => $defaultModelId,
                'settings' => [
                    'temperature' => 0.7,
                    'max_tokens' => 2048,
                    'system_prompt' => 'You are a helpful assistant.'
                ]
            ],
            [
                'module_id' => 'knowledge_base',
                'name' => 'Knowledge Base',
                'description' => 'Configure AI model settings for knowledge base interactions',
                'icon' => 'FileText',
                'model_id' => $defaultModelId,
                'settings' => [
                    'temperature' => 0.3,
                    'max_tokens' => 1024,
                    'system_prompt' => 'You are a knowledge base assistant. Answer questions based on the provided context.'
                ]
            ],
            [
                'module_id' => 'response_formatter',
                'name' => 'Response Formatter',
                'description' => 'Configure AI model settings for response formatting',
                'icon' => 'Sparkles',
                'model_id' => $defaultModelId,
                'settings' => [
                    'temperature' => 0.5,
                    'max_tokens' => 1024,
                    'system_prompt' => 'Format the following response according to the specified guidelines.'
                ]
            ],
            [
                'module_id' => 'follow_up',
                'name' => 'Follow-Up Engine',
                'description' => 'Configure AI model settings for generating follow-up suggestions',
                'icon' => 'Bell',
                'model_id' => $defaultModelId,
                'settings' => [
                    'temperature' => 0.8,
                    'max_tokens' => 512,
                    'system_prompt' => 'Generate follow-up questions or suggestions based on the conversation.'
                ]
            ],
            [
                'module_id' => 'branding',
                'name' => 'Branding Engine',
                'description' => 'Configure AI model settings for brand-aligned responses',
                'icon' => 'Star',
                'model_id' => $defaultModelId,
                'settings' => [
                    'temperature' => 0.6,
                    'max_tokens' => 1024,
                    'system_prompt' => 'Ensure responses align with the brand voice and guidelines.'
                ]
            ]
        ];

        // Create or update each module configuration
        foreach ($modules as $module) {
            ModuleConfiguration::updateOrCreate(
                ['module_id' => $module['module_id']],
                $module
            );
        }
    }
}
