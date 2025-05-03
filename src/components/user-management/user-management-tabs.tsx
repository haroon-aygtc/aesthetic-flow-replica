
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./users-list";
import { RolesList } from "./roles-list";
import GuestUsersList from "./guest-users-list";

export default function UserManagementTabs() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="guests">Guest Users</TabsTrigger>
      </TabsList>
      
      <TabsContent value="users">
        <UsersList />
      </TabsContent>
      
      <TabsContent value="roles">
        <RolesList />
      </TabsContent>
      
      <TabsContent value="guests">
        <GuestUsersList />
      </TabsContent>
    </Tabs>
  );
}
