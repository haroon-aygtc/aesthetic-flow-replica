
import { AdminLayout } from "@/components/admin-layout";
import { AIConfigurationModule } from "@/modules/ai-configuration";

const AIConfiguration = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Configure which AI models are used for different modules in your application
          </p>
        </div>

        <AIConfigurationModule />
      </div>
    </AdminLayout>
  );
};

export default AIConfiguration;
