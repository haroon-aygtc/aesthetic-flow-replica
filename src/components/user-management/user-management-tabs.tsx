
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./users-list";
import { RolesList } from "./roles-list";
import { PermissionsList } from "./permissions-list";
import { UserRoleAssignment } from "./user-role-assignment";
import { RolePermissionAssignment } from "./role-permission-assignment";
import { RoleDetails } from "./role-details";

const UserManagementTabs = () => {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid grid-cols-6 mb-8">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="user-roles">User Roles</TabsTrigger>
        <TabsTrigger value="role-permissions">Role Permissions</TabsTrigger>
        <TabsTrigger value="role-details">Role Details</TabsTrigger>
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

      <TabsContent value="role-permissions">
        <RolePermissionAssignment />
      </TabsContent>

      <TabsContent value="role-details">
        <RoleDetails />
      </TabsContent>
    </Tabs>
  );
};

export default UserManagementTabs;
