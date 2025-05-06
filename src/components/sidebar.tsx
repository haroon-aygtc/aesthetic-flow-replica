
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart2,
  Code,
  FileText,
  Home,
  Palette,
  Settings,
  Users,
  Terminal,
  Database,
  MessageSquare,
  Award,
  Rocket,
  User,
  Shield,
  LogOut,
  MessageCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar as SidebarComponent,
  SidebarHeader,
  SidebarContent,
  SidebarFooter
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/utils/api-service";

export function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call the real logout API endpoint
      await authService.logout();

      // Clear the token from localStorage
      localStorage.removeItem("token");

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);

      // Even if the API call fails, we should still clear the token and redirect
      localStorage.removeItem("token");

      toast({
        title: "Logged out",
        description: "You have been logged out of your account",
      });

      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarComponent>
      <SidebarHeader className="border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg">AI Chat System</span>
        </div>

        <div className="px-4 pb-2">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`
              }>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </NavLink>
            </li>

            {/* Widget Management */}
            <li className="mt-6">
              <div className="text-sm font-medium text-muted-foreground px-2 mb-2">Widget Management</div>
              <ul className="space-y-1">
                <li>
                  <NavLink to="/dashboard/widget-config" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Palette className="mr-2 h-4 w-4" />
                    Widget Configuration
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/embed-code" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Code className="mr-2 h-4 w-4" />
                    Embed Code
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* AI Configuration */}
            <li className="mt-6">
              <div className="text-sm font-medium text-muted-foreground px-2 mb-2">AI Configuration</div>
              <ul className="space-y-1">
                <li>
                  <NavLink to="/dashboard/ai-configuration" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Settings className="mr-2 h-4 w-4" />
                    AI Configuration
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/model-management" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Settings className="mr-2 h-4 w-4" />
                    AI Model Management
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/knowledge-base" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Database className="mr-2 h-4 w-4" />
                    Knowledge Base
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/templates" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <FileText className="mr-2 h-4 w-4" />
                    Prompt Templates
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/response-formatter" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Response Formatter
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/branding" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Award className="mr-2 h-4 w-4" />
                    Branding
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/follow-up" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Rocket className="mr-2 h-4 w-4" />
                    Follow-Up Engine
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/context-rules" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Context Rules
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/direct-chat" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Direct Chat Testing
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Admin */}
            <li className="mt-6">
              <div className="text-sm font-medium text-muted-foreground px-2 mb-2">Administration</div>
              <ul className="space-y-1">
                <li>
                  <NavLink to="/dashboard/user-management" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Users className="mr-2 h-4 w-4" />
                    User Management
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/api-tester" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Terminal className="mr-2 h-4 w-4" />
                    API Tester
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/analytics" className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Analytics
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-4 text-center text-muted-foreground border-t">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} AI Chat System. All rights reserved.
        </p>
      </SidebarFooter>
    </SidebarComponent>
  );
}
