
import { Routes, Route, Navigate } from 'react-router-dom';
import ModelManagement from './pages/ModelManagement';
import Branding from './pages/Branding';
import FollowUp from './pages/FollowUp';
import ResponseFormatter from './pages/ResponseFormatter';
import ApiTester from './pages/ApiTester';
import KnowledgeBase from './pages/KnowledgeBase';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard/ai-configuration" element={<ModelManagement />} />
      <Route path="/dashboard/branding" element={<Branding />} />
      <Route path="/dashboard/follow-up" element={<FollowUp />} />
      <Route path="/dashboard/response-formatter" element={<ResponseFormatter />} />
      <Route path="/dashboard/api-tester" element={<ApiTester />} />
      <Route path="/dashboard/knowledge-base" element={<KnowledgeBase />} />
      <Route path="*" element={<Navigate to="/dashboard/ai-configuration" replace />} />
    </Routes>
  );
}
