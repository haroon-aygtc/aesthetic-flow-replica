
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
  DialogTrigger
} from "@/components/ui/dialog";
import { Pencil, Trash } from "lucide-react";
import { PermissionForm } from "./permission-form";
import { PermissionDeleteDialog } from "./permission-delete-dialog";
import { PermissionTypeBadge } from "./permission-type-badge";

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
  onEdit: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading: boolean;
}

export function PermissionsTable({ permissions, onEdit, onDelete, isLoading }: PermissionsTableProps) {
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingPermission) return;
    
    setIsProcessing(true);
    try {
      await onEdit(editingPermission.id, data);
      setIsEditDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!editingPermission) return;
    
    setIsProcessing(true);
    try {
      await onDelete(editingPermission.id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {permissions.length === 0 ? (
        <div className="text-center py-4">
          No permissions found
        </div>
      ) : (
        <div className="border rounded-md">
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
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>{permission.description || "-"}</TableCell>
                  <TableCell>{permission.category}</TableCell>
                  <TableCell>
                    <PermissionTypeBadge type={permission.type} />
                  </TableCell>
                  <TableCell>{permission.created_at ? formatDate(permission.created_at) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog 
                        open={isEditDialogOpen && editingPermission?.id === permission.id} 
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingPermission(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingPermission(permission)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <h2 className="text-lg font-semibold">Edit Permission</h2>
                          </DialogHeader>
                          {editingPermission && (
                            <PermissionForm 
                              permission={editingPermission}
                              onSubmit={handleEditSubmit}
                              onCancel={() => setIsEditDialogOpen(false)}
                              isProcessing={isProcessing}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog 
                        open={isDeleteDialogOpen && editingPermission?.id === permission.id} 
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setEditingPermission(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingPermission(permission)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {editingPermission && (
                            <PermissionDeleteDialog
                              permissionName={editingPermission.name}
                              onDelete={handleDeleteConfirm}
                              onCancel={() => setIsDeleteDialogOpen(false)}
                              isDeleting={isProcessing}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
