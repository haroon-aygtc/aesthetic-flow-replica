
import { Link, useLocation } from "react-router-dom";
import {
  BarChart2,
  Code,
  FileText,
  Layout,
  MessageSquare,
  Settings,
  Users,
  Bell,
  Database,
  Star
} from "lucide-react";

import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const userInfo = {
    name: "Admin User",
    email: "admin@example.com",
  };

  return (
    <UISidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-16 items-center px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-white" />
            <span className="font-semibold text-xl">ChatAdmin</span>
          </Link>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* User Info */}
        <div className="mb-4 flex items-center gap-3 rounded-md p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{userInfo.name}</p>
            <p className="text-xs text-sidebar-foreground/70">{userInfo.email}</p>
          </div>
        </div>

        <SidebarSeparator />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/dashboard") && !isActive("/widget") && !isActive("/context") && !isActive("/templates") && !isActive("/ai-configuration")}
              tooltip="Dashboard"
            >
              <Link to="/dashboard">
                <Layout className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/widget")}
              tooltip="Widget Config"
            >
              <Link to="/dashboard/widget-config">
                <Settings className="h-4 w-4" />
                <span>Widget Config</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/context")}
              tooltip="Context Rules"
            >
              <Link to="/dashboard/context-rules">
                <FileText className="h-4 w-4" />
                <span>Context Rules</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/templates")}
              tooltip="Templates"
            >
              <Link to="/dashboard/templates">
                <FileText className="h-4 w-4" />
                <span>Templates</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/embed-code")}
              tooltip="Embed Code"
            >
              <Link to="/dashboard/embed-code">
                <Code className="h-4 w-4" />
                <span>Embed Code</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/analytics")}
              tooltip="Analytics"
            >
              <Link to="/dashboard/analytics">
                <BarChart2 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/user-management")}
              tooltip="User Management"
            >
              <Link to="/dashboard/user-management">
                <Users className="h-4 w-4" />
                <span>User Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/ai-configuration")}
              tooltip="AI Configuration"
            >
              <Link to="/dashboard/ai-configuration">
                <Star className="h-4 w-4" />
                <span>AI Configuration</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <LogoutButton
          showText={true}
          className="w-full justify-start"
        />
      </SidebarFooter>
    </UISidebar>
  );
}
