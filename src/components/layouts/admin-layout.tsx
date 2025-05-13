import React from "react";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Search, Bell, Settings, User, Menu } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Extract the current section from the URL
  const currentSection = location.pathname.split('/')[1] || 'dashboard';
  const pageTitle = getPageTitle(location.pathname);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-colors">
        {/* Top Navigation Bar */}
        <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4 sm:px-6">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px]">
                <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center">
              <h1 className="text-xl font-semibold hidden sm:inline-block mr-4">
                AI Chat System
              </h1>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-[200px]"
                />
              </div>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
              
              <ThemeToggle />
              
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2 border-l pl-4 ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Super Admin</p>
                  <p className="text-xs text-muted-foreground">admin@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex flex-1">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 border-r shrink-0">
            <AdminSidebar />
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-auto">
            {/* Page Header */}
            {pageTitle && (
              <div className="flex items-center justify-between border-b px-6 py-4 bg-card/50">
                <h2 className="text-xl font-semibold">{pageTitle}</h2>
              </div>
            )}
            
            {/* Content Area */}
            <div className={cn(
              "pb-10",
              !pageTitle && "pt-6"
            )}>
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

// Helper function to extract page title from URL
function getPageTitle(path: string): string {
  // Remove leading and trailing slashes, then split by slash
  const parts = path.replace(/^\/|\/$/g, '').split('/');
  
  // Ignore the first part (likely 'admin' or similar)
  if (parts.length > 1) {
    // Format the second part (the section)
    const section = parts[1];
    
    // Convert kebab case to title case
    return section
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return 'Dashboard';
} 