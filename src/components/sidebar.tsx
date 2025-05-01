
import { Link, useLocation } from "react-router-dom";
import { BarChart2, ChevronRight, Code, FileText, Layout, LogOut, MessageSquare, Settings, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed?: boolean;
};

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  hasChildItems?: boolean;
  collapsed?: boolean;
};

const SidebarItem = ({ icon: Icon, label, href, active, hasChildItems, collapsed }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {!collapsed && <span>{label}</span>}
      {hasChildItems && !collapsed && <ChevronRight className="ml-auto h-4 w-4" />}
    </Link>
  );
};

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();
  
  const userInfo = {
    name: "Admin User",
    email: "admin@example.com",
  };

  return (
    <div className={cn("chat-sidebar min-w-[16rem] w-64 bg-slate-800 text-white border-r border-gray-700", collapsed && "w-16")}>
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-white" />
          {!collapsed && <span className="font-semibold text-xl">ChatAdmin</span>}
        </Link>
      </div>
      
      <div className="flex flex-col gap-2 p-4">
        {!collapsed && (
          <div className="mb-4 flex items-center gap-3 rounded-md p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{userInfo.name}</p>
              <p className="text-xs text-gray-400">{userInfo.email}</p>
            </div>
          </div>
        )}

        <nav className="space-y-1">
          <SidebarItem 
            icon={Layout} 
            label="Dashboard" 
            href="/dashboard" 
            active={location.pathname === "/dashboard"} 
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={Settings} 
            label="Widget Config" 
            href="/dashboard/widget-config" 
            active={location.pathname.includes("/widget-config")} 
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Context Rules" 
            href="/dashboard/context-rules" 
            active={location.pathname.includes("/context-rules")} 
            hasChildItems={true} 
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={FileText} 
            label="Templates" 
            href="/dashboard/templates" 
            active={location.pathname.includes("/templates")} 
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={Code} 
            label="Embed Code" 
            href="/dashboard/embed-code" 
            active={location.pathname.includes("/embed-code")} 
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={BarChart2} 
            label="Analytics" 
            href="/dashboard/analytics" 
            active={location.pathname.includes("/analytics")} 
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={Users} 
            label="User Management" 
            href="/dashboard/user-management" 
            active={location.pathname.includes("/user-management")} 
            collapsed={collapsed}
          />
        </nav>
      </div>

      <div className="mt-auto p-4">
        <Link
          to="/logout"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
}
