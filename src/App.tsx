import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import { ThemeProvider } from "@/components/ui/theme-provider";
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
import { AIModelsModule } from "./modules/ai-models";
import EmbedCode from "./pages/EmbedCode";
import KnowledgeBase from "./pages/KnowledgeBase";
import ResponseFormatter from "./pages/ResponseFormatter";
import Branding from "./pages/Branding";
import FollowUp from "./pages/FollowUp";
import Analytics from "./pages/Analytics";
import DirectChat from "./pages/DirectChat";
import ProviderManagement from "./pages/ProviderManagement";
import Index from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./components/protected-route";
import Dashboard from "./pages/Dashboard";
import { TemplateList } from "./components/ai-configuration/prompt-templates/template-list";
import { TemplateForm } from "./components/ai-configuration/prompt-templates/template-form";

function App() {
  // Extract Tempo routes to be used inside BrowserRouter
  const TempoRoutes = () =>
    import.meta.env.VITE_TEMPO ? useRoutes(routes) : null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <BrowserRouter>
            {/* Tempo routes */}
            <TempoRoutes />
            <Routes>
              {/* Add this before any catchall route */}
              {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected dashboard routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/templates"
                element={
                  <ProtectedRoute>
                    <Templates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/prompts/*"
                element={
                  <ProtectedRoute>
                    <PromptTemplatesModule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/model-management/*"
                element={
                  <ProtectedRoute>
                    <ModelManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/provider-management/*"
                element={
                  <ProtectedRoute>
                    <ProviderManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/ai-configuration"
                element={
                  <ProtectedRoute>
                    <AIConfiguration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/context-rules"
                element={
                  <ProtectedRoute>
                    <ContextRules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/user-management"
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/api-tester"
                element={
                  <ProtectedRoute>
                    <ApiTester />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/widget-config"
                element={
                  <ProtectedRoute>
                    <WidgetConfig />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/embed-code"
                element={
                  <ProtectedRoute>
                    <EmbedCode />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/knowledge-base"
                element={
                  <ProtectedRoute>
                    <KnowledgeBase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/response-formatter"
                element={
                  <ProtectedRoute>
                    <ResponseFormatter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/branding"
                element={
                  <ProtectedRoute>
                    <Branding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/follow-up"
                element={
                  <ProtectedRoute>
                    <FollowUp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/direct-chat"
                element={
                  <ProtectedRoute>
                    <DirectChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/ai-models/*"
                element={
                  <ProtectedRoute>
                    <AIModelsModule />
                  </ProtectedRoute>
                }
              />

              {/* Prompt Template Management Routes */}
              <Route
                path="/ai-configuration/prompt-templates"
                element={
                  <ProtectedRoute>
                    <TemplateList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-configuration/prompt-templates/create"
                element={
                  <ProtectedRoute>
                    <TemplateForm
                      initialTemplate={{
                        name: "",
                        description: "",
                        content: "",
                        variables: [],
                        metadata: {
                          tags: [],
                          aiModel: [],
                          activationRules: [],
                          creator: "current-user",
                          lastModified: new Date(),
                          version: 1,
                        },
                      }}
                      isEditing={false}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-configuration/prompt-templates/edit/:id"
                element={
                  <ProtectedRoute>
                    <TemplateForm isEditing={true} />
                  </ProtectedRoute>
                }
              />

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
