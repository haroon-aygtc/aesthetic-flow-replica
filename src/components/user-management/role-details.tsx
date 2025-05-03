
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { roleService } from "@/utils/api";

import { RoleSelector } from "./roles/role-selector";
import { RoleInfoCard } from "./roles/role-info-card";
import { PermissionSummaryCard } from "./roles/permission-summary-card";
import { PermissionListByCategory } from "./roles/permission-list-by-category";

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
            <RoleSelector
              roles={roles}
              selectedRoleId={selectedRoleId}
              onRoleChange={handleRoleChange}
              isLoading={isLoading}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading role details...</span>
              </div>
            ) : selectedRole ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RoleInfoCard role={selectedRole} />
                  <PermissionSummaryCard permissionsByCategory={permissionsByCategory} />
                </div>

                <PermissionListByCategory permissionsByCategory={permissionsByCategory} />
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
