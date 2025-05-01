
import { useState, useEffect } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash } from "lucide-react";
import { roleService } from "@/utils/api";

interface Role {
  id: number;
  name: string;
  description: string | null;
  users_count?: number;
  created_at: string;
}

export function RolesList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await roleService.getAllRoles();
      setRoles(response.data);
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

  const handleAddRole = async () => {
    try {
      await roleService.createRole(newRole);
      setIsAddDialogOpen(false);
      setNewRole({ name: "", description: "" });
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      fetchRoles(); // Refresh the roles list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create role",
        variant: "destructive",
      });
    }
  };

  const handleEditRole = async () => {
    if (!editingRole) return;
    
    const roleUpdate = {
      name: editingRole.name,
      description: editingRole.description,
    };
    
    try {
      await roleService.updateRole(editingRole.id, roleUpdate);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      fetchRoles(); // Refresh the roles list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async () => {
    if (!editingRole) return;
    
    try {
      await roleService.deleteRole(editingRole.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      fetchRoles(); // Refresh the roles list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Roles</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Role</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={newRole.name} 
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newRole.description || ""} 
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddRole}>Add Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading roles...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || "-"}</TableCell>
                  <TableCell>{role.users_count || 0}</TableCell>
                  <TableCell>{role.created_at ? formatDate(role.created_at) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={isEditDialogOpen && editingRole?.id === role.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (open) setEditingRole(role);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingRole(role)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Role</DialogTitle>
                          </DialogHeader>
                          {editingRole && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input 
                                  id="edit-name" 
                                  value={editingRole.name} 
                                  onChange={(e) => setEditingRole({...editingRole, name: e.target.value})} 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea 
                                  id="edit-description" 
                                  value={editingRole.description || ""} 
                                  onChange={(e) => setEditingRole({...editingRole, description: e.target.value})} 
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditRole}>Update Role</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={isDeleteDialogOpen && editingRole?.id === role.id} onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open);
                        if (open) setEditingRole(role);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingRole(role)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Role</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Are you sure you want to delete role "{editingRole?.name}"?</p>
                            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteRole}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
