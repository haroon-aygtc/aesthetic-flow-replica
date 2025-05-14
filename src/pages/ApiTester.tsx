
import { AdminLayout } from "@/components/layouts/admin-layout";
import { ApiTesterModule } from "@/modules/api-tester";

const ApiTester = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">API Tester</h1>
          <p className="text-muted-foreground">
            Test API endpoints and model responses
          </p>
        </div>

        <ApiTesterModule />
      </div>
    </AdminLayout>
  );
};

export default ApiTester;
