import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Settings, 
  Database, 
  FileText, 
  MessageSquare, 
  Award, 
  Rocket, 
  Server,
  Users,
  Code,
  Palette
} from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar/sidebar";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <Sidebar>
      <div className="p-4">
        <div className="text-sm font-medium mb-4">Main Navigation</div>
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </NavLink>
          </li>
        </ul>
        
        {/* Widget Management */}
        <div className="text-sm font-medium text-muted-foreground mt-6 mb-2">Widget Management</div>
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/dashboard/widget-config" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <Palette className="mr-2 h-4 w-4" />
              Widget Configuration
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/embed-code" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <Code className="mr-2 h-4 w-4" />
              Embed Code
            </NavLink>
          </li>
        </ul>
        
        {/* AI Configuration */}
        <div className="text-sm font-medium text-muted-foreground mt-6 mb-2">AI Configuration</div>
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/dashboard/ai-configuration" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <Settings className="mr-2 h-4 w-4" />
              AI Configuration
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/model-management" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <Settings className="mr-2 h-4 w-4" />
              AI Model Management
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/provider-management" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <Server className="mr-2 h-4 w-4" />
              Provider Management
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/knowledge-base" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <Database className="mr-2 h-4 w-4" />
              Knowledge Base
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/templates" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <FileText className="mr-2 h-4 w-4" />
              Prompt Templates
            </NavLink>
          </li>
        </ul>
        
        {/* Administration */}
        <div className="text-sm font-medium text-muted-foreground mt-6 mb-2">Administration</div>
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/dashboard/user-management" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
              }
              onClick={() => onNavigate?.()}
            >
              <Users className="mr-2 h-4 w-4" />
              User Management
            </NavLink>
          </li>
        </ul>
      </div>
    </Sidebar>
  );
} 