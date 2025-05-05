
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/utils/api-service";
import { roleService, type Role } from "@/utils/roleService";
import { UserRoleAssignmentForm } from "./user-role-assignment-form";

interface User {
  id: number;
  name: string;
  email: string;
  roles?: { id: number; name: string }[];
}

export function UserRoleAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Handle form submission success
  const handleAssignmentSuccess = async () => {
    // Refresh the users data to get updated roles
    try {
      const usersResponse = await userService.getAllUsers();
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Failed to refresh users:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Roles to Users</CardTitle>
        <CardDescription>
          Select a user and assign them appropriate roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserRoleAssignmentForm
          users={users}
          roles={roles}
          isLoading={isLoading}
          onSuccess={handleAssignmentSuccess}
        />
      </CardContent>
    </Card>
  );
}
