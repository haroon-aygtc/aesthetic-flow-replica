
import { AdminLayout } from "@/components/admin-layout";
import { WidgetConfigModule } from "@/modules/widget-config";

const WidgetConfig = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Widget Configuration</h1>
          <p className="text-muted-foreground">
            Customize the appearance and behavior of your AI chat widget
          </p>
        </div>
        
        <WidgetConfigModule />
      </div>
    </AdminLayout>
  );
};

export default WidgetConfig;
