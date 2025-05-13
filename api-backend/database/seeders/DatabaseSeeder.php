<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user if none exists
        if (User::count() === 0) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Call the seeders
        $this->call([
            RolePermissionSeeder::class,
            TemplateSeeder::class,
            AIModelSeeder::class,
            SuperAdminSeeder::class,
            WidgetSeeder::class,
            ModuleConfigurationSeeder::class,
            ProviderSeeder::class,
        ]);
    }
}
