
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./users-list";
import { RolesList } from "./roles-list";
import GuestUsersList from "./guest-users-list";
import { UserRoleAssignment } from "./user-role-assignment";
import { RolePermissionAssignment } from "./role-permission-assignment";
import { PermissionsList } from "./permissions-list";

export default function UserManagementTabs() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5 mb-8">
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
