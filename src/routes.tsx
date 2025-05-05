
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin-layout';
import { ModelManagement } from '@/modules/model-management/index';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout><ModelManagement /></AdminLayout>} />
      <Route path="/model-management" element={<AdminLayout><ModelManagement /></AdminLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
