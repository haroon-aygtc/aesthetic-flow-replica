
import { useState, useEffect } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { userService, roleService } from "@/utils/api";

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

export function UserRoleAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch users and roles on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        userService.getAllUsers(),
        roleService.getAllRoles()
      ]);
      setUsers(usersResponse.data);
      setRoles(rolesResponse.data);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // Refresh the users data to get updated roles
      const usersResponse = await userService.getAllUsers();
      setUsers(usersResponse.data);
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
    <Card>
      <CardHeader>
        <CardTitle>Assign Roles to Users</CardTitle>
        <CardDescription>
          Select a user and assign them appropriate roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="user-select" className="text-sm font-medium">Select User</label>
            <Select 
              value={selectedUser?.toString() || ""} 
              onValueChange={handleUserChange}
            >
              <SelectTrigger id="user-select" className="w-full">
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
                <div className="border rounded-md p-4 space-y-2">
                  {roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No roles available</p>
                  ) : (
                    roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                        />
                        <label 
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {role.name}
                          {role.description && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              - {role.description}
                            </span>
                          )}
                        </label>
                      </div>
                    ))
                  )}
                </div>
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
      </CardContent>
    </Card>
  );
}
