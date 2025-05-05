<?php

namespace Tests\Unit;

use Tests\TestCase;
use Database\Seeders\RolePermissionSeeder;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RolePermissionSeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the seeder creates the expected roles and permissions.
     */
    public function test_seeder_creates_roles_and_permissions(): void
    {
        // Run the seeder
        $seeder = new RolePermissionSeeder();
        $seeder->run();

        // Check that roles were created
        $this->assertDatabaseHas('roles', ['name' => 'Super Admin']);
        $this->assertDatabaseHas('roles', ['name' => 'Admin']);
        $this->assertDatabaseHas('roles', ['name' => 'Manager']);
        $this->assertDatabaseHas('roles', ['name' => 'Editor']);
        $this->assertDatabaseHas('roles', ['name' => 'Viewer']);

        // Check that permissions were created
        $this->assertDatabaseHas('permissions', ['name' => 'user.view']);
        $this->assertDatabaseHas('permissions', ['name' => 'ai_model.view']);
        $this->assertDatabaseHas('permissions', ['name' => 'widget.view']);

        // Check that role-permission relationships were created
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        $this->assertNotNull($superAdminRole);
        
        $userViewPermission = Permission::where('name', 'user.view')->first();
        $this->assertNotNull($userViewPermission);
        
        $this->assertTrue($superAdminRole->permissions->contains($userViewPermission->id));
    }
}
