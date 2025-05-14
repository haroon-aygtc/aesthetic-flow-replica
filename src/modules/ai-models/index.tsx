
import { AIModelManagerContainer } from "./components/ai-model-manager-container";
import AdminLayout from "@/components/layouts/admin-layout";

export function AIModelsModule() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AIModelManagerContainer />
      </div>
    </AdminLayout>
  );
}

export default AIModelsModule;
