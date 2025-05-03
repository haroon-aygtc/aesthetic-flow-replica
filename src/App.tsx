
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Templates from "./pages/Templates";
import ModelManagement from "./pages/ModelManagement";
import AIConfiguration from "./pages/AIConfiguration";
import { PromptTemplatesModule } from "./modules/prompt-templates";
import ContextRules from "./pages/ContextRules";
import UserManagement from "./pages/UserManagement";
import ApiTester from "./pages/ApiTester";
import WidgetConfig from "./pages/WidgetConfig";
import EmbedCode from "./pages/EmbedCode";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Templates />} />
          <Route path="/dashboard/templates" element={<Templates />} />
          <Route path="/dashboard/prompts" element={<PromptTemplatesModule />} />
          <Route path="/dashboard/model-management" element={<ModelManagement />} />
          <Route path="/dashboard/ai-configuration" element={<AIConfiguration />} />
          <Route path="/dashboard/context-rules" element={<ContextRules />} />
          <Route path="/dashboard/user-management" element={<UserManagement />} />
          <Route path="/dashboard/api-tester" element={<ApiTester />} />
          <Route path="/dashboard/widget-config" element={<WidgetConfig />} />
          <Route path="/dashboard/embed-code" element={<EmbedCode />} />
          <Route path="*" element={<Templates />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
