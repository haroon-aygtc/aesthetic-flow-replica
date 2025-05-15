<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Template;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default templates
        Template::create([
            'name' => 'General Assistant',
            'description' => 'A general-purpose template for handling various queries',
            'category' => 'General',
            'content' => 'You are a helpful AI assistant. Answer the user\'s questions accurately and concisely.',
            'version' => 1.0,
            'is_default' => true,
            'metadata' => json_encode(['user_name' => 'John Doe']),
            'variables' => json_encode(['user_name', 'company_name']),
            'slug' => 'general-assistant'
        ]);

        Template::create([
            'name' => 'Customer Support',
            'description' => 'Template optimized for customer support interactions',
            'category' => 'Support',
            'content' => 'You are a customer support assistant. Help users with their questions and issues in a friendly and professional manner.',
            'version' => 1.0,
            'is_default' => false,
            'metadata' => json_encode(['company_name' => 'Example Corp']),
            'variables' => json_encode(['user_name', 'product_name', 'company_name']),
            'slug' => 'customer-support'
        ]);

        Template::create([
            'name' => 'Technical Documentation',
            'description' => 'Template for generating technical documentation and explanations',
            'category' => 'Technical',
            'content' => 'You are a technical documentation assistant. Provide clear, accurate, and detailed explanations of technical concepts and procedures.',
            'version' => 1.0,
            'is_default' => false,
            'metadata' => json_encode(['product_name' => 'Example Product']),
            'variables' => json_encode(['product_name', 'version', 'platform']),
            'slug' => 'technical-documentation'
        ]);

        $this->command->info('Templates seeded successfully!');
    }
}
