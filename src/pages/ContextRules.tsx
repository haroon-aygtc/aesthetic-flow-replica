import AdminLayout from "@/components/layouts/admin-layout";
import { ContextRulesModule } from "@/modules/context-rules";

const ContextRules = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Context Rules</h1>
          <p className="text-muted-foreground">
            Configure context-based activation rules for AI models
          </p>
        </div>

        <ContextRulesModule />
      </div>
    </AdminLayout>
  );
};

export default ContextRules;
