
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "@/components/user-management/users-list";
import { RolesList } from "@/components/user-management/roles-list";
import { PermissionsList } from "@/components/user-management/permissions-list";
import { RolePermissionAssignment } from "@/components/user-management/role-permission-assignment";

export function UserManagementModule() {
  const [activeTab, setActiveTab] = useState("users");
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="assignments">Role-Permission Assignments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <UsersList />
            </TabsContent>
            
            <TabsContent value="roles">
              <RolesList />
            </TabsContent>
            
            <TabsContent value="permissions">
              <PermissionsList />
            </TabsContent>
            
            <TabsContent value="assignments">
              <RolePermissionAssignment />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
