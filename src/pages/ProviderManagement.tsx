import AdminLayout from "@/components/layouts/admin-layout";
import { Route, Routes } from "react-router-dom";
import { ProviderListPage } from "@/pages/ai-provider/ProviderListPage";
import { ProviderEditPage } from "@/pages/ai-provider/ProviderEditPage";

const ProviderManagement = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<ProviderListPage />} />
        <Route path="edit/:providerId" element={<ProviderEditPage />} />
        <Route path="new" element={<ProviderEditPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default ProviderManagement; 