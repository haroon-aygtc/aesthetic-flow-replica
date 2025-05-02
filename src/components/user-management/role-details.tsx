import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, ShieldCheck, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { roleService } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Role {
  id: number;
  name: string;
  description: string | null;
  users_count: number;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
}

export function RoleDetails() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, Permission[]>>({});
  const { toast } = useToast();

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const response = await roleService.getAllRoles();
        setRoles(response.data);
        if (response.data.length > 0) {
          setSelectedRoleId(response.data[0].id);
        }
      } catch (error: any) {
        console.error("Failed to fetch roles:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load roles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [toast]);

  // Fetch role details when a role is selected
  useEffect(() => {
    const fetchRoleDetails = async () => {
      if (!selectedRoleId) return;
      
      setIsLoading(true);
      try {
        const response = await roleService.getRole(selectedRoleId);
        setSelectedRole(response.data);
        
        // Group permissions by category
        const grouped = response.data.permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
          const category = permission.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(permission);
          return acc;
        }, {});
        
        setPermissionsByCategory(grouped);
      } catch (error: any) {
        console.error("Failed to fetch role details:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load role details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleDetails();
  }, [selectedRoleId, toast]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(Number(roleId));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            View detailed information about roles and their assigned permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="role-select" className="text-sm font-medium">
                Select Role
              </label>
              <Select 
                value={selectedRoleId?.toString() || ""} 
                onValueChange={handleRoleChange}
                disabled={isLoading || roles.length === 0}
              >
                <SelectTrigger id="role-select" className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading role details...</span>
              </div>
            ) : selectedRole ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">{selectedRole.name}</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Role</DialogTitle>
                            </DialogHeader>
                            {/* This would contain the edit form, but we're using the existing edit functionality in roles-list.tsx */}
                            <p className="py-4">Use the Roles tab to edit this role's details.</p>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {selectedRole.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedRole.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{selectedRole.users_count} users</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-sm">
                          {selectedRole.permissions?.length || 0} permissions
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Permission Summary</h3>
                      <div className="space-y-2">
                        {Object.entries(permissionsByCategory).map(([category, _]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-sm">{category}</span>
                            <Badge variant="outline">
                              {permissionsByCategory[category].length} permissions
                            </Badge>
                          </div>
                        ))}
                        {Object.keys(permissionsByCategory).length === 0 && (
                          <p className="text-sm text-muted-foreground">No permissions assigned</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Assigned Permissions</h3>
                  
                  {Object.entries(permissionsByCategory).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="bg-muted/50 p-2 rounded-md">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{permission.name}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    permission.type === 'read' 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                      : permission.type === 'write' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {permission.type}
                                  </span>
                                </div>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/50 rounded-md">
                      <p className="text-muted-foreground">No permissions assigned to this role</p>
                      <Button className="mt-4" variant="outline" asChild>
                        <a href="#role-permissions">Assign Permissions</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a role to view details
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
