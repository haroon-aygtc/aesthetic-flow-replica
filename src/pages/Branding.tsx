import AdminLayout from "@/components/layouts/admin-layout";
import { BrandingEngineModule } from "@/modules/branding-engine";

const Branding = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Branding Engine</h1>
          <p className="text-muted-foreground">
            Configure your AI assistant's personality and branding
          </p>
        </div>

        <BrandingEngineModule />
      </div>
    </AdminLayout>
  );
};

export default Branding;
