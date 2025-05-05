<?php

namespace Database\Seeders;

use App\Models\Widget;
use App\Models\AIModel;
use App\Models\User;
use Illuminate\Database\Seeder;

class WidgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user
        $user = User::first();
        
        if (!$user) {
            $this->command->info('No users found. Please run the UserSeeder first.');
            return;
        }
        
        // Get the default AI model
        $aiModel = AIModel::where('is_default', true)->first();
        
        if (!$aiModel) {
            $this->command->info('No default AI model found. Please run the AIModelSeeder first.');
            return;
        }
        
        // Create a default widget if none exists
        if (Widget::count() === 0) {
            Widget::create([
                'user_id' => $user->id,
                'name' => 'Default Widget',
                'ai_model_id' => $aiModel->id,
                'settings' => [
                    'theme' => 'light',
                    'position' => 'right',
                    'initialMessage' => 'How can I help you today?',
                    'bubbleIcon' => 'chat',
                    'bubbleText' => 'Chat with us',
                    'primaryColor' => '#4f46e5',
                    'secondaryColor' => '#ffffff',
                    'textColor' => '#1f2937',
                    'followUp' => [
                        'enabled' => true,
                        'position' => 'end',
                        'suggestionsCount' => 3,
                        'suggestionsStyle' => 'buttons',
                        'buttonStyle' => 'rounded',
                        'contexts' => ['all'],
                        'customPrompt' => '',
                    ]
                ],
                'is_active' => true,
            ]);
            
            $this->command->info('Default widget created successfully!');
        } else {
            $this->command->info('Widgets already exist. No new widgets created.');
        }
    }
}
