
import { Link, useLocation } from "react-router-dom";
import { Bell, BarChart2, Code, FileText, Layout, MessageSquare, Palette, Search, Settings, User } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1">
        {/* Top navigation */}
        <header className="border-b bg-background sticky top-0 z-30">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-semibold">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="rounded-md border border-input pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
              </Button>
              
              <Button size="icon" variant="ghost">
                <Settings className="h-5 w-5" />
              </Button>
              
              <ThemeToggle />
              
              <Button variant="ghost" className="gap-2">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">Admin User</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Tab navigation */}
        <div className="border-b bg-background">
          <div className="flex overflow-x-auto px-4 md:px-6">
            <div className="py-4 pr-6">
              <Button 
                variant="ghost" 
                className={`gap-2 font-medium ${isActive("/dashboard") && !isActive("/widget") && !isActive("/context") && !isActive("/templates") ? "text-primary" : ""}`}
                asChild
              >
                <Link to="/dashboard">
                  <Layout className="h-4 w-4" />
                  Overview
                </Link>
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button 
                variant="ghost" 
                className={`gap-2 font-medium ${isActive("/widget") ? "text-primary" : ""}`}
                asChild
              >
                <Link to="/dashboard/widget-config">
                  <Palette className="h-4 w-4" />
                  Widget Config
                </Link>
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button 
                variant="ghost" 
                className={`gap-2 font-medium ${isActive("/context") ? "text-primary" : ""}`}
                asChild
              >
                <Link to="/dashboard/context-rules">
                  <FileText className="h-4 w-4" />
                  Context Rules
                </Link>
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button 
                variant="ghost" 
                className={`gap-2 font-medium ${isActive("/templates") ? "text-primary" : ""}`}
                asChild
              >
                <Link to="/dashboard/templates">
                  <FileText className="h-4 w-4" />
                  Templates
                </Link>
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button 
                variant="ghost" 
                className="gap-2 font-medium"
                asChild
              >
                <Link to="/dashboard/embed-code">
                  <Code className="h-4 w-4" />
                  Embed Code
                </Link>
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button 
                variant="ghost" 
                className="gap-2 font-medium"
                asChild
              >
                <Link to="/dashboard/analytics">
                  <BarChart2 className="h-4 w-4" />
                  Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Secondary navigation */}
        <div className="bg-background border-b">
          <div className="flex items-center overflow-x-auto px-4 md:px-6 py-2 gap-4 text-sm">
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <User className="h-4 w-4" />
              Overview
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <Settings className="h-4 w-4" />
              Widget Config
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <FileText className="h-4 w-4" />
              Knowledge Base
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <Code className="h-4 w-4" />
              Embed Code
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <MessageSquare className="h-4 w-4" />
              AI Logs
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <User className="h-4 w-4" />
              Users
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <Settings className="h-4 w-4" />
              AI Configuration
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <main className="px-4 md:px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
