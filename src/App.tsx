
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WidgetConfig from "./pages/WidgetConfig";
import ContextRules from "./pages/ContextRules";
import Templates from "./pages/Templates";
import UserManagement from "./pages/UserManagement";
import AIConfiguration from "./pages/AIConfiguration";
import EmbedCode from "./pages/EmbedCode";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/widget-config" element={<WidgetConfig />} />
            <Route path="/dashboard/context-rules" element={<ContextRules />} />
            <Route path="/dashboard/templates" element={<Templates />} />
            <Route path="/dashboard/user-management" element={<UserManagement />} />
            <Route path="/dashboard/ai-configuration" element={<AIConfiguration />} />
            <Route path="/dashboard/embed-code" element={<EmbedCode />} />
            <Route path="/dashboard/analytics" element={<NotFound />} /> {/* Placeholder */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
