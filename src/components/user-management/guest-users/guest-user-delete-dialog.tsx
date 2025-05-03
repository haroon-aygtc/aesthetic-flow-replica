
import { Loader2 } from "lucide-react";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GuestUser {
  id: number;
  fullname: string;
  email: string | null;
  phone: string;
  session_id: string;
  widget_id: number;
  widget_name: string;
  created_at: string;
}

interface GuestUserDeleteDialogProps {
  guestUser: GuestUser;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

export function GuestUserDeleteDialog({
  guestUser,
  onDelete,
  onCancel,
  isDeleting
}: GuestUserDeleteDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Guest User</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this guest user? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        <p>You are about to delete: <span className="font-medium">{guestUser.fullname}</span></p>
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
    </DialogContent>
  );
}
