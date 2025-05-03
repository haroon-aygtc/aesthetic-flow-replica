
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./users-list";
import { RolesList } from "./roles-list";
import GuestUsersList from "./guest-users-list";
import { UserRoleAssignment } from "./user-role-assignment";
import { RolePermissionAssignment } from "./role-permission-assignment";
import { PermissionsList } from "./permissions-list";

export default function UserManagementTabs() {
  const [activeTab, setActiveTab] = useState("users");
  const [isMobile, setIsMobile] = useState(false);
  
  // Check viewport size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className={`w-full mb-8 ${isMobile ? 'flex flex-wrap gap-2' : 'grid grid-cols-5'}`}>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="user-roles">User Roles</TabsTrigger>
        <TabsTrigger value="guests">Guest Users</TabsTrigger>
      </TabsList>
      
      <TabsContent value="users">
        <UsersList />
      </TabsContent>
      
      <TabsContent value="roles">
        <RolesList />
      </TabsContent>
      
      <TabsContent value="permissions">
        <PermissionsList />
      </TabsContent>
      
      <TabsContent value="user-roles">
        <UserRoleAssignment />
      </TabsContent>
      
      <TabsContent value="guests">
        <GuestUsersList />
      </TabsContent>
    </Tabs>
  );
}
