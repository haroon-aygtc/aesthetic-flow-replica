<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data to avoid duplicates
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Permission::truncate();
        Role::truncate();
        DB::table('permission_role')->truncate();
        DB::table('role_user')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Create roles
        $superAdminRole = Role::create([
            'name' => 'Super Admin',
            'description' => 'Full access to all system features'
        ]);

        $adminRole = Role::create([
            'name' => 'Admin',
            'description' => 'Administrative access with some restrictions'
        ]);

        $managerRole = Role::create([
            'name' => 'Manager',
            'description' => 'Can manage content and configurations'
        ]);

        $editorRole = Role::create([
            'name' => 'Editor',
            'description' => 'Can edit content but not manage system settings'
        ]);

        $viewerRole = Role::create([
            'name' => 'Viewer',
            'description' => 'Read-only access to the system'
        ]);

        // Define permission categories based on modules
        $categories = [
            'user' => 'User Management',
            'role' => 'Role Management',
            'permission' => 'Permission Management',
            'ai_model' => 'AI Model Management',
            'model_activation' => 'Model Activation Rules',
            'widget' => 'Widget Configuration',
            'chat' => 'Chat Management',
            'guest_user' => 'Guest User Management',
            'analytics' => 'Analytics',
            'knowledge_base' => 'Knowledge Base',
            'prompt_template' => 'Prompt Templates',
            'response_formatter' => 'Response Formatter',
            'branding' => 'Branding Engine',
            'follow_up' => 'Follow-Up Engine',
            'embed_code' => 'Embed Code Generator',
            'api_test' => 'API Testing'
        ];

        // Create permissions for each category
        $allPermissions = [];

        foreach ($categories as $key => $category) {
            // Create read permissions
            $allPermissions[] = Permission::create([
                'name' => $key . '.view',
                'description' => 'View ' . $category,
                'category' => $category,
                'type' => 'read'
            ]);

            // Create write permissions
            $allPermissions[] = Permission::create([
                'name' => $key . '.create',
                'description' => 'Create ' . $category,
                'category' => $category,
                'type' => 'write'
            ]);

            $allPermissions[] = Permission::create([
                'name' => $key . '.edit',
                'description' => 'Edit ' . $category,
                'category' => $category,
                'type' => 'write'
            ]);

            // Create delete permissions
            $allPermissions[] = Permission::create([
                'name' => $key . '.delete',
                'description' => 'Delete ' . $category,
                'category' => $category,
                'type' => 'delete'
            ]);
        }

        // Additional specific permissions
        $specificPermissions = [
            // User specific
            Permission::create([
                'name' => 'user.assign_roles',
                'description' => 'Assign roles to users',
                'category' => $categories['user'],
                'type' => 'write'
            ]),

            // Role specific
            Permission::create([
                'name' => 'role.assign_permissions',
                'description' => 'Assign permissions to roles',
                'category' => $categories['role'],
                'type' => 'write'
            ]),

            // AI Model specific
            Permission::create([
                'name' => 'ai_model.test_connection',
                'description' => 'Test AI model connection',
                'category' => $categories['ai_model'],
                'type' => 'read'
            ]),
            Permission::create([
                'name' => 'ai_model.toggle_activation',
                'description' => 'Toggle AI model activation',
                'category' => $categories['ai_model'],
                'type' => 'write'
            ]),

            // Widget specific
            Permission::create([
                'name' => 'widget.preview',
                'description' => 'Preview widget',
                'category' => $categories['widget'],
                'type' => 'read'
            ]),

            // Analytics specific
            Permission::create([
                'name' => 'analytics.export',
                'description' => 'Export analytics data',
                'category' => $categories['analytics'],
                'type' => 'read'
            ]),

            // Knowledge Base specific
            Permission::create([
                'name' => 'knowledge_base.upload',
                'description' => 'Upload documents to knowledge base',
                'category' => $categories['knowledge_base'],
                'type' => 'write'
            ]),

            // Chat specific
            Permission::create([
                'name' => 'chat.view_history',
                'description' => 'View chat history',
                'category' => $categories['chat'],
                'type' => 'read'
            ]),
            Permission::create([
                'name' => 'chat.delete_history',
                'description' => 'Delete chat history',
                'category' => $categories['chat'],
                'type' => 'delete'
            ]),
        ];

        // Merge all permissions
        $allPermissions = array_merge($allPermissions, $specificPermissions);

        // Assign all permissions to Super Admin
        $superAdminRole->permissions()->attach(
            collect($allPermissions)->pluck('id')->toArray()
        );

        // Assign permissions to Admin (all except permission management)
        $adminPermissions = collect($allPermissions)->filter(function ($permission) {
            return !str_starts_with($permission->name, 'permission.');
        })->pluck('id')->toArray();

        $adminRole->permissions()->attach($adminPermissions);

        // Assign permissions to Manager (no user, role, permission management)
        $managerPermissions = collect($allPermissions)->filter(function ($permission) {
            return !str_starts_with($permission->name, 'user.') &&
                   !str_starts_with($permission->name, 'role.') &&
                   !str_starts_with($permission->name, 'permission.');
        })->pluck('id')->toArray();

        $managerRole->permissions()->attach($managerPermissions);

        // Assign permissions to Editor (only content editing, no deletion)
        $editorPermissions = collect($allPermissions)->filter(function ($permission) {
            return ($permission->type === 'read' || $permission->type === 'write') &&
                   !str_starts_with($permission->name, 'user.') &&
                   !str_starts_with($permission->name, 'role.') &&
                   !str_starts_with($permission->name, 'permission.');
        })->pluck('id')->toArray();

        $editorRole->permissions()->attach($editorPermissions);

        // Assign permissions to Viewer (read-only)
        $viewerPermissions = collect($allPermissions)->filter(function ($permission) {
            return $permission->type === 'read';
        })->pluck('id')->toArray();

        $viewerRole->permissions()->attach($viewerPermissions);

        // Assign Super Admin role to the first user (if exists)
        $user = User::first();
        if ($user) {
            $user->roles()->attach($superAdminRole->id);
        }

        $this->command->info('Roles and Permissions seeded successfully!');
    }
}
