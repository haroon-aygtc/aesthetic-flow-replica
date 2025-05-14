import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Settings,
  MessageSquare,
  Code,
  BarChart3,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  LogOut,
  Key,
  Globe,
  Cpu,
  Database,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  disabled?: boolean;
  submenu?: {
    id: string;
    label: string;
    path: string;
    disabled?: boolean;
  }[];
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

const Sidebar = ({
  collapsed = false,
  onToggleCollapse = () => { },
  userName = "Admin User",
  userEmail = "admin@example.com",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { toast } = useToast();

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      id: "tutorials",
      label: "Tutorials",
      icon: <FileText size={20} />,
      path: "/tutorial",
      disabled: true,
      submenu: [
        {
          id: "intro",
          label: "Introduction",
          path: "/tutorial",
          disabled: true,
        },
        {
          id: "setup",
          label: "Setup Guide",
          path: "/tutorial/setup",
          disabled: true,
        },
      ],
    },
    {
      id: "widget",
      label: "Widget Config",
      icon: <Settings size={20} />,
      path: "/dashboard/widget-config",
    },
    {
      id: "contextRules",
      label: "Context Rules",
      icon: <MessageSquare size={20} />,
      path: "/dashboard/context-rules",
      submenu: [
        {
          id: "create",
          label: "Create Rule",
          path: "/dashboard/context-rules/create",
          disabled: true,
        },
        {
          id: "manage",
          label: "Manage Rules",
          path: "/dashboard/context-rules/manage",
          disabled: true,
        },
      ],
    },

    {
      id: "scraping",
      label: "Web Scraping",
      icon: <Globe size={20} />,
      path: "/dashboard/scraping",
      disabled: true,
    },
    {
      id: "embedCode",
      label: "Embed Code",
      icon: <Code size={20} />,
      path: "/dashboard/embed-code",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/dashboard/analytics",
    },
    {
      id: "apiKeys",
      label: "API Keys",
      icon: <Key size={20} />,
      path: "/dashboard/api-keys",
      disabled: true,
    },
    {
      id: "aiconfig",
      label: "AI Configuration",
      icon: <Cpu size={20} />,
      path: "/dashboard/ai-configuration",
      submenu: [
        {
          id: "promptTemplates",
          label: "Prompt Templates",
          path: "/ai-configuration/prompt-templates",
        },
        {
          id: "createTemplate",
          label: "Create Template",
          path: "/ai-configuration/prompt-templates/create",
        },
        {
          id: "knowledgeBase",
          label: "Knowledge Base",
          path: "/dashboard/knowledge-base",
        },
        {
          id: "models",
          label: "AI Models",
          path: "/dashboard/ai-models",
        },
      ],
    },
    {
      id: "aiModels",
      label: "AI Models",
      icon: <Cpu size={20} />,
      path: "/dashboard/ai-models",
    },
    {
      id: "knowledge",
      label: "Knowledge Base",
      icon: <Database size={20} />,
      path: "/dashboard/knowledge-base",
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users size={20} />,
      path: "/dashboard/user-management",
    },
  ];

  // Determine active item based on current path
  const getActiveItemFromPath = (path: string) => {
    // Remove trailing slash if present
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

    // Check direct matches first
    for (const item of menuItems) {
      if (item.path === normalizedPath) {
        return item.id;
      }

      // Check submenu items
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (subItem.path === normalizedPath) {
            return `${item.id}-${subItem.id}`;
          }
        }
      }
    }

    // Check if path is a subfolder of any menu items
    for (const item of menuItems) {
      if (normalizedPath.startsWith(item.path + '/')) {
        return item.id;
      }

      // Check submenu items
      if (item.submenu) {
        for (const subItem of item.submenu) {
          if (normalizedPath.startsWith(subItem.path + '/')) {
            return `${item.id}-${subItem.id}`;
          }
        }
      }
    }

    return "dashboard"; // Default to dashboard if no match
  };

  const [activeItem, setActiveItem] = useState(
    getActiveItemFromPath(location.pathname),
  );
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    aiconfig: true,
    contextRules: true,
  });

  // Update active item when location changes
  useEffect(() => {
    const newActiveItem = getActiveItemFromPath(location.pathname);

    // Only update state if the active item has changed
    if (newActiveItem !== activeItem) {
      setActiveItem(newActiveItem);

      // Expand parent menu if a submenu item is active
      if (newActiveItem.includes("-")) {
        const parentId = newActiveItem.split("-")[0];
        setExpandedMenus((prev) => ({
          ...prev,
          [parentId]: true,
        }));
      }
    }
  }, [location.pathname, activeItem]);

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const handleNavigation = (path: string, disabled?: boolean) => {
    if (disabled) {
      toast({
        title: "Feature Unavailable",
        description: "This feature is not available yet.",
        variant: "default",
      });
      return;
    }
    navigate(path);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-slate-900 text-white transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <MessageSquare className="text-blue-400" size={24} />
            <span className="font-bold text-lg">ChatAdmin</span>
          </div>
        )}
        {collapsed && (
          <MessageSquare className="text-blue-400 mx-auto" size={24} />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "text-slate-400 hover:text-white hover:bg-slate-800",
            collapsed && "mx-auto",
          )}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        </Button>
      </div>

      {/* User profile */}
      <div
        className={cn(
          "flex items-center p-4 border-b border-slate-700",
          collapsed ? "flex-col" : "gap-3",
        )}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-blue-600">
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.submenu ? (
                <div>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800",
                      (activeItem === item.id || activeItem.startsWith(item.id + "-")) && "bg-slate-800 text-white",
                      collapsed && "justify-center px-2",
                      item.disabled && "opacity-60",
                    )}
                    onClick={() => {
                      if (item.disabled) {
                        toast({
                          title: "Feature Unavailable",
                          description: "This feature is not available yet.",
                          variant: "default",
                        });
                        return;
                      }
                      if (!collapsed) {
                        toggleMenu(item.id);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                  >
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center">
                            {item.icon}
                            {!collapsed && (
                              <>
                                <span className="ml-3 flex-1 text-left">
                                  {item.label}
                                </span>
                                {expandedMenus[item.id] ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronRight size={16} />
                                )}
                              </>
                            )}
                          </span>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </Button>

                  {!collapsed && expandedMenus[item.id] && (
                    <ul className="mt-1 pl-10 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={`${item.id}-${subItem.id}`}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-sm py-2 text-slate-300 hover:text-white hover:bg-slate-800",
                              activeItem === `${item.id}-${subItem.id}` &&
                              "bg-slate-800 text-white",
                              subItem.disabled && "opacity-60",
                            )}
                            onClick={() => {
                              if (subItem.disabled) {
                                toast({
                                  title: "Feature Unavailable",
                                  description: "This feature is not available yet.",
                                  variant: "default",
                                });
                                return;
                              }
                              setActiveItem(`${item.id}-${subItem.id}`);
                              navigate(subItem.path);
                            }}
                          >
                            {subItem.label}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800",
                    activeItem === item.id && "bg-slate-800 text-white",
                    collapsed && "justify-center px-2",
                    item.disabled && "opacity-60",
                  )}
                  onClick={() => handleNavigation(item.path, item.disabled)}
                >
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center">
                          {item.icon}
                          {!collapsed && (
                            <span className="ml-3">{item.label}</span>
                          )}
                        </span>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800",
            collapsed && "justify-center px-2",
          )}
          onClick={handleLogout}
        >
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center">
                  <LogOut size={20} />
                  {!collapsed && <span className="ml-3">Logout</span>}
                </span>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">Logout</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
