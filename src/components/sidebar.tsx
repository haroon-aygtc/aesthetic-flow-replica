import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-background border-r fixed left-0 top-0 z-30 transition-transform duration-300 ease-in-out"
      style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
      <div className="h-full flex flex-col overflow-y-auto">
        
        {/* Header Section */}
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg">AI Chat System</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* User Info Section */}
        <div className="px-4 py-2 border-b">
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
          <Button variant="outline" size="xs" className="mt-2 w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <NavLink to="/dashboard" className={({isActive}) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`
              }>
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
                    Widget Configuration
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/embed-code" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
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
                    AI Configuration
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/templates" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
                    Response Templates
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/context-rules" className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`
                  }>
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
                    User Management
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        
        {/* Footer Section */}
        <div className="p-4 text-center text-muted-foreground border-t">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} AI Chat System. All rights reserved.
          </p>
        </div>
      </div>
    </aside>
  );
}
