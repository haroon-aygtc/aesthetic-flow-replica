
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./users-list";
import { RolesList } from "./roles-list";
import { PermissionsList } from "./permissions-list";
import { UserRoleAssignment } from "./user-role-assignment";

const UserManagementTabs = () => {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
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
      
      <TabsContent value="assignments">
        <UserRoleAssignment />
      </TabsContent>
    </Tabs>
  );
};

export default UserManagementTabs;
