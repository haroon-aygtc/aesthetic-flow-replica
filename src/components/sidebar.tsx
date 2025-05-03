
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  BarChart2, 
  Code, 
  FileText, 
  Home, 
  Layout, 
  MessageSquare, 
  Palette, 
  Settings, 
  User, 
  Users,
  Terminal
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Sidebar as SidebarComponent, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter
} from "@/components/ui/sidebar";

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <NavLink to="/dashboard" className={({isActive}) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
                  <NavLink to="/dashboard/widget-config" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Palette className="mr-2 h-4 w-4" />
                    Widget Configuration
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/embed-code" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
                  <NavLink to="/dashboard/ai-configuration" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Settings className="mr-2 h-4 w-4" />
                    AI Configuration
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/templates" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <FileText className="mr-2 h-4 w-4" />
                    Response Templates
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/context-rules" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Context Rules
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Admin */}
            <li className="mt-6">
              <div className="text-sm font-medium text-muted-foreground px-2 mb-2">Administration</div>
              <ul className="space-y-1">
                <li>
                  <NavLink to="/dashboard/user-management" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Users className="mr-2 h-4 w-4" />
                    User Management
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/api-tester" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    <Terminal className="mr-2 h-4 w-4" />
                    API Tester
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
