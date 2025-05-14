
import { AdminLayout } from "@/components/layouts/admin-layout";
import { UserManagementModule } from "@/modules/user-management";

const UserManagement = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>

        <UserManagementModule />
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
