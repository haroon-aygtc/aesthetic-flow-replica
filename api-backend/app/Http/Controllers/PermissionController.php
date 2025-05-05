<?php
namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permissions = Permission::all();

        return response()->json($permissions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'type' => 'required|in:read,write,delete',
        ]);

        $permission = Permission::create($validated);

        return response()->json($permission, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        $permission->load('roles');

        return response()->json($permission);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:permissions,name,' . $permission->id,
            'description' => 'nullable|string',
            'category' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:read,write,delete',
        ]);

        $permission->update($validated);

        return response()->json($permission);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        $permission->delete();

        return response()->json(null, 204);
    }
}
