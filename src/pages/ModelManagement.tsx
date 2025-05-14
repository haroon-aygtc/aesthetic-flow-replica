import { AdminLayout } from "@/components/layouts/admin-layout";
import { AIModelsModule } from "@/modules/ai-models";
import { Route, Routes } from "react-router-dom";
import { ModelEditPage } from "@/pages/ModelEditPage";

const ModelManagement = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col">
            <AIModelsModule />
          </div>
        } />
        <Route path="edit/:modelId" element={<ModelEditPage />} />
        <Route path="new" element={<ModelEditPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default ModelManagement;
