
import { AdminLayout } from "@/components/admin-layout";
import { ModelManagementModule } from "@/modules/model-management";

const ModelManagement = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Model Management</h1>
          <p className="text-muted-foreground">
            Configure AI models, activation rules, fallback settings, and analyze performance
          </p>
        </div>
        
        <ModelManagementModule />
      </div>
    </AdminLayout>
  );
};

export default ModelManagement;
