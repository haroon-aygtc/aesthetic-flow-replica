
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { PermissionCheckboxList } from "./permission-checkbox-list";
import { roleService, permissionService } from "@/utils/api";

interface Role {
  id: number;
  name: string;
  description: string | null;
}

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
}

export function RolePermissionAssignment() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  // Fetch all permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await permissionService.getAllPermissions();
        setPermissions(response.data);
      } catch (error: any) {
        console.error("Failed to fetch permissions:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load permissions",
          variant: "destructive",
        });
      }
    };

    fetchPermissions();
  }, [toast]);

  // Fetch role's current permissions when a role is selected
  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!selectedRoleId) return;
      
      setIsLoading(true);
      try {
        const response = await roleService.getRole(selectedRoleId);
        const rolePermissions = response.data.permissions || [];
        setSelectedPermissionIds(rolePermissions.map((p: Permission) => p.id));
      } catch (error: any) {
        console.error("Failed to fetch role permissions:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load role permissions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRolePermissions();
  }, [selectedRoleId, toast]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(Number(roleId));
  };

  const handlePermissionToggle = (permissionId: number, isChecked: boolean) => {
    setSelectedPermissionIds(prev => 
      isChecked 
        ? [...prev, permissionId] 
        : prev.filter(id => id !== permissionId)
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    
    setIsSaving(true);
    try {
      await roleService.assignPermissions(selectedRoleId, selectedPermissionIds);
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error: any) {
      console.error("Failed to assign permissions:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update permissions",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Permissions to Roles</CardTitle>
          <CardDescription>
            Manage which permissions are assigned to each role
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
              {selectedRoleId && roles.find(r => r.id === selectedRoleId)?.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {roles.find(r => r.id === selectedRoleId)?.description}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading permissions...</span>
              </div>
            ) : selectedRoleId ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Permissions</h3>
                    <div className="text-sm text-muted-foreground">
                      {selectedPermissionIds.length} of {permissions.length} selected
                    </div>
                  </div>
                  <PermissionCheckboxList
                    permissions={permissions}
                    selectedPermissionIds={selectedPermissionIds}
                    onPermissionToggle={handlePermissionToggle}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSavePermissions} 
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Permissions
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a role to manage permissions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
