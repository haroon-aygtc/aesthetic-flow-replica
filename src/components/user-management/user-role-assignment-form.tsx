
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { RoleCheckboxList } from "./user-role-checkbox-list";
import { userService } from "@/utils/api";

interface User {
  id: number;
  name: string;
  email: string;
  roles?: { id: number; name: string }[];
}

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface UserRoleAssignmentFormProps {
  users: User[];
  roles: Role[];
  isLoading: boolean;
  onSuccess: () => void;
}

export function UserRoleAssignmentForm({ 
  users, 
  roles, 
  isLoading, 
  onSuccess 
}: UserRoleAssignmentFormProps) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // When user selection changes, update selected roles
  useEffect(() => {
    if (selectedUser) {
      const user = users.find(u => u.id === selectedUser);
      if (user && user.roles) {
        setSelectedRoles(user.roles.map(role => role.id));
      } else {
        setSelectedRoles([]);
      }
    } else {
      setSelectedRoles([]);
    }
  }, [selectedUser, users]);

  const handleUserChange = (userId: string) => {
    setSelectedUser(parseInt(userId, 10));
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await userService.assignRoles(selectedUser, selectedRoles);
      toast({
        title: "Success",
        description: "Roles assigned successfully",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign roles",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="user-select" className="text-sm font-medium">Select User</label>
        <Select 
          value={selectedUser?.toString() || ""} 
          onValueChange={handleUserChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedUser && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Available Roles</h3>
            <RoleCheckboxList
              roles={roles}
              selectedRoles={selectedRoles}
              onRoleToggle={handleRoleToggle}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Role Assignments"}
          </Button>
        </>
      )}
    </div>
  );
}
