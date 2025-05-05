
import { useState } from "react";
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
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash, Search } from "lucide-react";
import { PermissionForm } from "./permission-form";

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
  created_at: string;
}

interface PermissionsTableProps {
  permissions: Permission[];
  onEdit: (id: number, permissionData: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading: boolean;
}

export function PermissionsTable({ 
  permissions, 
  onEdit, 
  onDelete,
  isLoading 
}: PermissionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter permissions based on search term
  const filteredPermissions = permissions.filter(permission => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditSubmit = async (formData: any) => {
    if (!editingPermission) return;
    
    setIsProcessing(true);
    try {
      await onEdit(editingPermission.id, formData);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update permission:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!editingPermission) return;
    
    setIsProcessing(true);
    try {
      await onDelete(editingPermission.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete permission:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "read":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "write":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">Loading permissions...</TableCell>
            </TableRow>
          ) : filteredPermissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                {searchTerm ? 
                  `No permissions found matching "${searchTerm}"` : 
                  "No permissions available"}
              </TableCell>
            </TableRow>
          ) : (
            filteredPermissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell>{permission.category}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(permission.type)}`}>
                    {permission.type}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs truncate">{permission.description || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingPermission(permission);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingPermission(permission);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Permission Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
          </DialogHeader>
          {editingPermission && (
            <PermissionForm
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              initialData={{
                name: editingPermission.name,
                description: editingPermission.description || "",
                category: editingPermission.category,
                type: editingPermission.type,
              }}
              isNew={false}
              isProcessing={isProcessing}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>
              Are you sure you want to delete the permission "{editingPermission?.name}"?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. It may affect users with roles that have this permission.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isProcessing}>
              {isProcessing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
