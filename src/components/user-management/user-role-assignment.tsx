
import { useState } from "react";
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Search, Shield, UserRound, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

// Mock data for users and roles
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", avatar: null },
  { id: 2, name: "Jane Smith", email: "jane@example.com", avatar: null },
  { id: 3, name: "Robert Johnson", email: "robert@example.com", avatar: null },
  { id: 4, name: "Emily Davis", email: "emily@example.com", avatar: null },
  { id: 5, name: "Michael Brown", email: "michael@example.com", avatar: null },
];

const mockRoles = [
  { id: 1, name: "Admin", description: "Full access to all features" },
  { id: 2, name: "Editor", description: "Can edit content but not system settings" },
  { id: 3, name: "Viewer", description: "Read-only access to content" },
  { id: 4, name: "Guest", description: "Limited access to public content" },
];

const mockPermissions = [
  { id: 1, name: "view:users", category: "Users" },
  { id: 2, name: "create:users", category: "Users" },
  { id: 3, name: "edit:users", category: "Users" },
  { id: 4, name: "delete:users", category: "Users" },
  { id: 5, name: "view:content", category: "Content" },
  { id: 6, name: "edit:content", category: "Content" },
  { id: 7, name: "view:settings", category: "Settings" },
  { id: 8, name: "edit:settings", category: "Settings" },
];

// Mock assignment data - which user has which roles
const mockUserRoles = [
  { userId: 1, roleIds: [1] }, // John has Admin
  { userId: 2, roleIds: [2] }, // Jane has Editor
  { userId: 3, roleIds: [3] }, // Robert has Viewer
  { userId: 4, roleIds: [2, 3] }, // Emily has Editor and Viewer
  { userId: 5, roleIds: [4] }, // Michael has Guest
];

// Mock assignment data - which role has which permissions
const mockRolePermissions = [
  { roleId: 1, permissionIds: [1, 2, 3, 4, 5, 6, 7, 8] }, // Admin has all permissions
  { roleId: 2, permissionIds: [1, 5, 6] }, // Editor has view:users, view:content, edit:content
  { roleId: 3, permissionIds: [1, 5] }, // Viewer has view:users, view:content
  { roleId: 4, permissionIds: [5] }, // Guest has view:content
];

export function UserRoleAssignment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoles, setUserRoles] = useState(mockUserRoles);
  const [rolePermissions, setRolePermissions] = useState(mockRolePermissions);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openUserRoleDrawer = (userId: number) => {
    setCurrentUserId(userId);
    setIsUserDrawerOpen(true);
  };

  const openRolePermissionDrawer = (roleId: number) => {
    setCurrentRoleId(roleId);
    setIsRoleDrawerOpen(true);
  };

  const getUserRoles = (userId: number) => {
    const assignment = userRoles.find(ur => ur.userId === userId);
    if (!assignment) return [];
    return assignment.roleIds.map(roleId => 
      mockRoles.find(role => role.id === roleId)
    ).filter(Boolean);
  };

  const getRolePermissions = (roleId: number) => {
    const assignment = rolePermissions.find(rp => rp.roleId === roleId);
    if (!assignment) return [];
    return assignment.permissionIds.map(permId => 
      mockPermissions.find(perm => perm.id === permId)
    ).filter(Boolean);
  };

  const toggleRoleForUser = (userId: number, roleId: number) => {
    setUserRoles(prevUserRoles => {
      const userRoleIndex = prevUserRoles.findIndex(ur => ur.userId === userId);
      
      if (userRoleIndex === -1) {
        // User doesn't have any roles yet, add new entry
        return [...prevUserRoles, { userId, roleIds: [roleId] }];
      } else {
        // User already has roles, modify existing entry
        const userRole = prevUserRoles[userRoleIndex];
        const hasRole = userRole.roleIds.includes(roleId);
        
        const updatedRoleIds = hasRole
          ? userRole.roleIds.filter(id => id !== roleId)
          : [...userRole.roleIds, roleId];
        
        const updatedUserRoles = [...prevUserRoles];
        updatedUserRoles[userRoleIndex] = { ...userRole, roleIds: updatedRoleIds };
        
        return updatedUserRoles;
      }
    });
  };

  const togglePermissionForRole = (roleId: number, permissionId: number) => {
    setRolePermissions(prevRolePermissions => {
      const rolePermIndex = prevRolePermissions.findIndex(rp => rp.roleId === roleId);
      
      if (rolePermIndex === -1) {
        // Role doesn't have any permissions yet, add new entry
        return [...prevRolePermissions, { roleId, permissionIds: [permissionId] }];
      } else {
        // Role already has permissions, modify existing entry
        const rolePerm = prevRolePermissions[rolePermIndex];
        const hasPermission = rolePerm.permissionIds.includes(permissionId);
        
        const updatedPermissionIds = hasPermission
          ? rolePerm.permissionIds.filter(id => id !== permissionId)
          : [...rolePerm.permissionIds, permissionId];
        
        const updatedRolePermissions = [...prevRolePermissions];
        updatedRolePermissions[rolePermIndex] = { ...rolePerm, permissionIds: updatedPermissionIds };
        
        return updatedRolePermissions;
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="user-to-role">
        <TabsList className="mb-4">
          <TabsTrigger value="user-to-role">Assign Roles to Users</TabsTrigger>
          <TabsTrigger value="role-to-permission">Assign Permissions to Roles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user-to-role" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Assigned Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <UserRound className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getUserRoles(user.id).map(role => (
                            <div key={role?.id} className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                              <Shield className="w-3 h-3 mr-1" />
                              {role?.name}
                            </div>
                          ))}
                          {getUserRoles(user.id).length === 0 && (
                            <span className="text-muted-foreground text-sm">No roles assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">Assign Roles</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48">
                            {mockRoles.map(role => {
                              const isAssigned = getUserRoles(user.id).some(r => r?.id === role.id);
                              return (
                                <DropdownMenuItem 
                                  key={role.id}
                                  className="flex items-center justify-between cursor-pointer"
                                  onClick={() => toggleRoleForUser(user.id, role.id)}
                                >
                                  <span>{role.name}</span>
                                  {isAssigned ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-2"
                          onClick={() => openUserRoleDrawer(user.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="role-to-permission" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assigned Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getRolePermissions(role.id).length > 0 ? (
                          <span className="text-sm">{getRolePermissions(role.id).length} permissions</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">No permissions assigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openRolePermissionDrawer(role.id)}
                      >
                        Manage Permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Role Assignment Drawer */}
      <Drawer open={isUserDrawerOpen} onOpenChange={setIsUserDrawerOpen}>
        <DrawerContent className="px-4 sm:px-6">
          <DrawerHeader>
            <DrawerTitle>Manage User Roles</DrawerTitle>
            <DrawerDescription>
              {currentUserId && mockUsers.find(u => u.id === currentUserId)?.name}
            </DrawerDescription>
          </DrawerHeader>
          {currentUserId && (
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                Select the roles you want to assign to this user:
              </p>
              <div className="space-y-4">
                {mockRoles.map(role => {
                  const isAssigned = getUserRoles(currentUserId).some(r => r?.id === role.id);
                  return (
                    <div 
                      key={role.id} 
                      className={`flex items-start p-4 border rounded-md ${isAssigned ? 'border-primary' : 'border-border'}`}
                    >
                      <div className="flex items-center h-5 mr-4">
                        <Checkbox 
                          checked={isAssigned}
                          id={`role-${role.id}`}
                          onCheckedChange={() => toggleRoleForUser(currentUserId, role.id)}
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor={`role-${role.id}`}
                          className="block text-sm font-medium cursor-pointer"
                        >
                          {role.name}
                        </label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {role.description}
                        </p>
                        {isAssigned && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Includes permissions:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {getRolePermissions(role.id).map(perm => (
                                <span key={perm?.id} className="inline-flex text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {perm?.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsUserDrawerOpen(false)}>
              Done
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Role Permission Assignment Drawer */}
      <Drawer open={isRoleDrawerOpen} onOpenChange={setIsRoleDrawerOpen}>
        <DrawerContent className="px-4 sm:px-6">
          <DrawerHeader>
            <DrawerTitle>Manage Role Permissions</DrawerTitle>
            <DrawerDescription>
              {currentRoleId && mockRoles.find(r => r.id === currentRoleId)?.name} Role
            </DrawerDescription>
          </DrawerHeader>
          {currentRoleId && (
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select the permissions you want to assign to this role:
              </p>

              {/* Group permissions by category */}
              {Array.from(new Set(mockPermissions.map(p => p.category))).map(category => (
                <div key={category} className="mb-4">
                  <h3 className="text-sm font-medium mb-2">{category}</h3>
                  <div className="space-y-2 ml-2">
                    {mockPermissions
                      .filter(p => p.category === category)
                      .map(permission => {
                        const isAssigned = rolePermissions
                          .find(rp => rp.roleId === currentRoleId)
                          ?.permissionIds.includes(permission.id);
                        
                        return (
                          <div key={permission.id} className="flex items-center">
                            <Checkbox 
                              id={`perm-${permission.id}`}
                              checked={isAssigned}
                              onCheckedChange={() => togglePermissionForRole(currentRoleId, permission.id)}
                              className="mr-2"
                            />
                            <label
                              htmlFor={`perm-${permission.id}`}
                              className="text-sm font-mono cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsRoleDrawerOpen(false)}>
              Done
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
