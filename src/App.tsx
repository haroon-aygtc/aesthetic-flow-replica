
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Templates from "./pages/Templates";
import ModelManagement from "./pages/ModelManagement";
import { PromptTemplatesModule } from "./modules/prompt-templates";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard/templates" element={<Templates />} />
          <Route path="/dashboard/prompts" element={<PromptTemplatesModule />} />
          <Route path="/dashboard/model-management" element={<ModelManagement />} />
          <Route path="*" element={<Templates />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
