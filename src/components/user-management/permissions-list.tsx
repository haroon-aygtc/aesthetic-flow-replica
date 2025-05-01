
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash } from "lucide-react";
import { permissionService } from "@/utils/api";

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
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
    category: "",
    type: "read",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const handleAddPermission = async () => {
    try {
      await permissionService.createPermission(newPermission);
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
    }
  };

  const handleEditPermission = async () => {
    if (!editingPermission) return;
    
    const permissionUpdate = {
      name: editingPermission.name,
      description: editingPermission.description,
      category: editingPermission.category,
      type: editingPermission.type,
    };
    
    try {
      await permissionService.updatePermission(editingPermission.id, permissionUpdate);
      setIsEditDialogOpen(false);
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
    }
  };

  const handleDeletePermission = async () => {
    if (!editingPermission) return;
    
    try {
      await permissionService.deletePermission(editingPermission.id);
      setIsDeleteDialogOpen(false);
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
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={newPermission.name} 
                  onChange={(e) => setNewPermission({...newPermission, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newPermission.description || ""} 
                  onChange={(e) => setNewPermission({...newPermission, description: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  value={newPermission.category} 
                  onChange={(e) => setNewPermission({...newPermission, category: e.target.value})} 
                  placeholder="e.g., users, posts, comments"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newPermission.type} 
                  onValueChange={(value) => setNewPermission({...newPermission, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPermission}>Add Permission</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading permissions...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No permissions found
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>{permission.description || "-"}</TableCell>
                  <TableCell>{permission.category}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      permission.type === 'read' 
                        ? 'bg-blue-100 text-blue-800' 
                        : permission.type === 'write' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {permission.type}
                    </span>
                  </TableCell>
                  <TableCell>{permission.created_at ? formatDate(permission.created_at) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={isEditDialogOpen && editingPermission?.id === permission.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (open) setEditingPermission(permission);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingPermission(permission)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Permission</DialogTitle>
                          </DialogHeader>
                          {editingPermission && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input 
                                  id="edit-name" 
                                  value={editingPermission.name} 
                                  onChange={(e) => setEditingPermission({...editingPermission, name: e.target.value})} 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea 
                                  id="edit-description" 
                                  value={editingPermission.description || ""} 
                                  onChange={(e) => setEditingPermission({...editingPermission, description: e.target.value})} 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Input 
                                  id="edit-category" 
                                  value={editingPermission.category} 
                                  onChange={(e) => setEditingPermission({...editingPermission, category: e.target.value})} 
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-type">Type</Label>
                                <Select 
                                  value={editingPermission.type} 
                                  onValueChange={(value) => setEditingPermission({...editingPermission, type: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="write">Write</SelectItem>
                                    <SelectItem value="delete">Delete</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditPermission}>Update Permission</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={isDeleteDialogOpen && editingPermission?.id === permission.id} onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open);
                        if (open) setEditingPermission(permission);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingPermission(permission)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Permission</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Are you sure you want to delete permission "{editingPermission?.name}"?</p>
                            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeletePermission}>Delete</Button>
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
