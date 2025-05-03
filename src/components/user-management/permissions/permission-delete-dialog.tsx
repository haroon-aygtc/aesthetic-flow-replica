
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PermissionDeleteDialogProps {
  permissionName: string;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

export function PermissionDeleteDialog({
  permissionName,
  onDelete,
  onCancel,
  isDeleting,
}: PermissionDeleteDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete Permission</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>Are you sure you want to delete permission "{permissionName}"?</p>
        <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Delete
        </Button>
      </DialogFooter>
    </>
  );
}
