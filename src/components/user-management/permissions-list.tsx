
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { permissionService } from "@/utils/api";
import { PermissionForm } from "./permissions/permission-form";
import { PermissionsTable } from "./permissions/permissions-table";

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
  created_at: string;
}

export function PermissionsList() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
    category: "",
    type: "read",
  });
  const { toast } = useToast();

  // Fetch permissions on component mount
  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPermission = async (formData: any) => {
    setIsProcessing(true);
    try {
      await permissionService.createPermission(formData);
      setIsAddDialogOpen(false);
      setNewPermission({ name: "", description: "", category: "", type: "read" });
      toast({
        title: "Success",
        description: "Permission created successfully",
      });
      fetchPermissions(); // Refresh the permissions list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create permission",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Modified to return void instead of boolean
  const handleEditPermission = async (id: number, permissionUpdate: any): Promise<void> => {
    try {
      await permissionService.updatePermission(id, permissionUpdate);
      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
      fetchPermissions(); // Refresh the permissions list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update permission",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Modified to return void instead of boolean
  const handleDeletePermission = async (id: number): Promise<void> => {
    try {
      await permissionService.deletePermission(id);
      toast({
        title: "Success",
        description: "Permission deleted successfully",
      });
      fetchPermissions(); // Refresh the permissions list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete permission",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Permissions</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Permission</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Permission</DialogTitle>
            </DialogHeader>
            <PermissionForm
              onSubmit={handleAddPermission}
              onCancel={() => setIsAddDialogOpen(false)}
              isNew={true}
              isProcessing={isProcessing}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading permissions...</div>
      ) : (
        <PermissionsTable 
          permissions={permissions} 
          onEdit={handleEditPermission}
          onDelete={handleDeletePermission}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
