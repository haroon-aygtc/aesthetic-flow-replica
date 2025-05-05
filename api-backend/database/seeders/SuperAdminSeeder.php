<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin user if it doesn't exist
        $superAdminEmail = 'admin@example.com';
        
        if (!User::where('email', $superAdminEmail)->exists()) {
            $user = User::create([
                'name' => 'Super Admin',
                'email' => $superAdminEmail,
                'password' => Hash::make('password'), // Default password, should be changed after first login
                'email_verified_at' => now(),
                'status' => 'active',
            ]);
            
            // Find the Super Admin role
            $superAdminRole = Role::where('name', 'Super Admin')->first();
            
            // If the role doesn't exist, create it
            if (!$superAdminRole) {
                $superAdminRole = Role::create([
                    'name' => 'Super Admin',
                    'description' => 'Full access to all system features'
                ]);
            }
            
            // Assign the Super Admin role to the user
            $user->roles()->attach($superAdminRole->id);
            
            $this->command->info('Super Admin user created successfully!');
            $this->command->info('Email: ' . $superAdminEmail);
            $this->command->info('Password: password');
            $this->command->info('Please change the password after first login.');
        } else {
            $this->command->info('Super Admin user already exists.');
        }
    }
}
