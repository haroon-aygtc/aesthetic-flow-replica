
import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import UserManagementTabs from "@/components/user-management/user-management-tabs";
import { Card } from "@/components/ui/card";

export default function UserManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and permissions in your application.
          </p>
        </div>
        
        <Card className="p-6">
          <UserManagementTabs />
        </Card>
      </div>
    </AdminLayout>
  );
}
