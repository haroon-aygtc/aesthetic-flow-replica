
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import Templates from "./pages/Templates";
import ModelManagement from "./pages/ModelManagement";
import AIConfiguration from "./pages/AIConfiguration";
import { PromptTemplatesModule } from "./modules/prompt-templates";
import ContextRules from "./pages/ContextRules";
import UserManagement from "./pages/UserManagement";
import ApiTester from "./pages/ApiTester";
import WidgetConfig from "./pages/WidgetConfig";
import EmbedCode from "./pages/EmbedCode";
import KnowledgeBase from "./pages/KnowledgeBase";
import ResponseFormatter from "./pages/ResponseFormatter";
import Branding from "./pages/Branding";
import FollowUp from "./pages/FollowUp";
import Analytics from "./pages/Analytics";
import DirectChat from "./pages/DirectChat";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./components/protected-route";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected dashboard routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/dashboard/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/dashboard/prompts" element={<ProtectedRoute><PromptTemplatesModule /></ProtectedRoute>} />
              <Route path="/dashboard/model-management" element={<ProtectedRoute><ModelManagement /></ProtectedRoute>} />
              <Route path="/dashboard/ai-configuration" element={<ProtectedRoute><AIConfiguration /></ProtectedRoute>} />
              <Route path="/dashboard/context-rules" element={<ProtectedRoute><ContextRules /></ProtectedRoute>} />
              <Route path="/dashboard/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/dashboard/api-tester" element={<ProtectedRoute><ApiTester /></ProtectedRoute>} />
              <Route path="/dashboard/widget-config" element={<ProtectedRoute><WidgetConfig /></ProtectedRoute>} />
              <Route path="/dashboard/embed-code" element={<ProtectedRoute><EmbedCode /></ProtectedRoute>} />
              <Route path="/dashboard/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
              <Route path="/dashboard/response-formatter" element={<ProtectedRoute><ResponseFormatter /></ProtectedRoute>} />
              <Route path="/dashboard/branding" element={<ProtectedRoute><Branding /></ProtectedRoute>} />
              <Route path="/dashboard/follow-up" element={<ProtectedRoute><FollowUp /></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/dashboard/direct-chat" element={<ProtectedRoute><DirectChat /></ProtectedRoute>} />

              {/* Fallback route */}
              <Route path="*" element={<Index />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
