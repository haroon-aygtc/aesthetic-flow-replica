
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Bell, MessageSquare, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    conversations: { value: 0, target: 1245 },
    activeUsers: { value: 0, target: 378 },
    responseRate: { value: 0, target: 92 },
    responseTime: { value: 0, target: 3.2 }
  });
  
  const systemStatuses = [
    { name: "API Status", status: "Checking..." },
    { name: "Gemini API", status: "Checking..." },
    { name: "Hugging Face API", status: "Checking..." },
    { name: "Database", status: "Checking..." }
  ];
  
  // Simulate loading data
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        conversations: { 
          value: Math.min(prev.conversations.value + 100, prev.conversations.target),
          target: prev.conversations.target 
        },
        activeUsers: { 
          value: Math.min(prev.activeUsers.value + 30, prev.activeUsers.target),
          target: prev.activeUsers.target 
        },
        responseRate: { 
          value: Math.min(prev.responseRate.value + 7, prev.responseRate.target),
          target: prev.responseRate.target 
        },
        responseTime: { 
          value: Math.min(prev.responseTime.value + 0.25, prev.responseTime.target),
          target: prev.responseTime.target 
        }
      }));
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  // Sample data for pie chart
  const data = [
    { name: 'Products', value: 35 },
    { name: 'Services', value: 25 },
    { name: 'Support', value: 20 },
    { name: 'Pricing', value: 15 },
    { name: 'Other', value: 5 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 chat-content">
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
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M2.5 12.5L2.5 2.5L12.5 2.5V7.5V12.5H2.5Z" stroke="currentColor" strokeWidth="1.5"></path>
                </svg>
                Overview
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M7.49996 1.80002C4.35194 1.80002 1.79996 4.352 1.79996 7.50002C1.79996 10.648 4.35194 13.2 7.49996 13.2C10.648 13.2 13.2 10.648 13.2 7.50002C13.2 4.352 10.648 1.80002 7.49996 1.80002ZM0.899963 7.50002C0.899963 3.85494 3.85488 0.900024 7.49996 0.900024C11.145 0.900024 14.1 3.85494 14.1 7.50002C14.1 11.1451 11.145 14.1 7.49996 14.1C3.85488 14.1 0.899963 11.1451 0.899963 7.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  <path d="M7.49996 5.10002C7.77611 5.10002 7.99996 5.32387 7.99996 5.60002V7.50002C7.99996 7.77617 7.77611 8.00002 7.49996 8.00002H5.59996C5.32381 8.00002 5.09996 7.77617 5.09996 7.50002C5.09996 7.22387 5.32381 7.00002 5.59996 7.00002H6.99996V5.60002C6.99996 5.32387 7.22381 5.10002 7.49996 5.10002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Widget Config
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M12.5 2H8V3H12V12H3V8H2V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V2.5C13 2.22386 12.7761 2 12.5 2ZM2.5 2C2.22386 2 2 2.22386 2 2.5V7H3V3H7V2H2.5ZM9 7H12V6H9V7Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  <path d="M7 5.5C7 5.22386 6.77614 5 6.5 5H2.5C2.22386 5 2 5.22386 2 5.5V9.5C2 9.77614 2.22386 10 2.5 10H6.5C6.77614 10 7 9.77614 7 9.5V5.5ZM3 6H6V9H3V6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Context Rules
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M3 2.5C3 2.22386 3.22386 2 3.5 2H11.5C11.7761 2 12 2.22386 12 2.5V13.5C12 13.7761 11.7761 14 11.5 14H3.5C3.22386 14 3 13.7761 3 13.5V2.5ZM4 3V13H11V3H4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  <path d="M5.5 5C5.22386 5 5 5.22386 5 5.5C5 5.77614 5.22386 6 5.5 6H9.5C9.77614 6 10 5.77614 10 5.5C10 5.22386 9.77614 5 9.5 5H5.5ZM5.5 7C5.22386 7 5 7.22386 5 7.5C5 7.77614 5.22386 8 5.5 8H9.5C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7H5.5ZM5.5 9C5.22386 9 5 9.22386 5 9.5C5 9.77614 5.22386 10 5.5 10H9.5C9.77614 10 10 9.77614 10 9.5C10 9.22386 9.77614 9 9.5 9H5.5ZM5.5 11C5.22386 11 5 11.2239 5 11.5C5 11.7761 5.22386 12 5.5 12H9.5C9.77614 12 10 11.7761 10 11.5C10 11.2239 9.77614 11 9.5 11H5.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Templates
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L7.5 7.20711L12.1464 11.8536C12.3417 12.0488 12.6583 12.0488 12.8536 11.8536C13.0488 11.6583 13.0488 11.3417 12.8536 11.1464L7.85355 6.14645C7.65829 5.95118 7.34171 5.95118 7.14645 6.14645L2.14645 11.1464ZM2.14645 3.85355L7.14645 8.85355C7.34171 9.04882 7.65829 9.04882 7.85355 8.85355L12.8536 3.85355C13.0488 3.65829 13.0488 3.34171 12.8536 3.14645C12.6583 2.95118 12.3417 2.95118 12.1464 3.14645L7.5 7.79289L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Analytics
              </Button>
            </div>
          </div>
        </div>
        
        {/* Secondary navigation */}
        <div className="bg-background border-b">
          <div className="flex items-center overflow-x-auto px-4 md:px-6 py-2 gap-4 text-sm">
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.0749 12.975 13.8623 12.975 13.5999C12.975 11.72 12.4779 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
              Overview
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L7.5 7.20711L12.1464 11.8536C12.3417 12.0488 12.6583 12.0488 12.8536 11.8536C13.0488 11.6583 13.0488 11.3417 12.8536 11.1464L7.85355 6.14645C7.65829 5.95118 7.34171 5.95118 7.14645 6.14645L2.14645 11.1464ZM2.14645 3.85355L7.14645 8.85355C7.34171 9.04882 7.65829 9.04882 7.85355 8.85355L12.8536 3.85355C13.0488 3.65829 13.0488 3.34171 12.8536 3.14645C12.6583 2.95118 12.3417 2.95118 12.1464 3.14645L7.5 7.79289L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
              Widget Config
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
              Knowledge Base
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M12.5 2H8V3H12V12H3V8H2V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V2.5C13 2.22386 12.7761 2 12.5 2ZM2.5 2C2.22386 2 2 2.22386 2 2.5V7H3V3H7V2H2.5ZM9 7H12V6H9V7Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                <path d="M7 5.5C7 5.22386 6.77614 5 6.5 5H2.5C2.22386 5 2 5.22386 2 5.5V9.5C2 9.77614 2.22386 10 2.5 10H6.5C6.77614 10 7 9.77614 7 9.5V5.5ZM3 6H6V9H3V6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
              Embed Code
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M7.5 0.875C3.83375 0.875 0.875 3.83375 0.875 7.5C0.875 11.1663 3.83375 14.125 7.5 14.125C11.1663 14.125 14.125 11.1663 14.125 7.5C14.125 3.83375 11.1663 0.875 7.5 0.875ZM7.5 1.825C10.6362 1.825 13.175 4.36383 13.175 7.5C13.175 10.6362 10.6362 13.175 7.5 13.175C4.36383 13.175 1.825 10.6362 1.825 7.5C1.825 4.36383 4.36383 1.825 7.5 1.825ZM7.5 5.2C7.12175 5.2 6.84 5.52 6.84 5.9C6.84 6.28 7.12175 6.6 7.5 6.6C7.87825 6.6 8.16 6.28 8.16 5.9C8.16 5.52 7.87825 5.2 7.5 5.2ZM6.91667 7.3C6.64833 7.3 6.43333 7.51501 6.43333 7.78334C6.43333 8.05168 6.64833 8.26668 6.91667 8.26668H7.08333V9.7H6.91667C6.64833 9.7 6.43333 9.91499 6.43333 10.1833C6.43333 10.4517 6.64833 10.6667 6.91667 10.6667H8.08333C8.35168 10.6667 8.56667 10.4517 8.56667 10.1833C8.56667 9.91499 8.35168 9.7 8.08333 9.7H7.91667V7.78334C7.91667 7.51499 7.70168 7.3 7.43333 7.3H6.91667Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
              AI Logs
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H7.50003C7.22389 8 7.00003 7.77614 7.00003 7.5V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M2 1C1.44772 1 1 1.44772 1 2V13C1 13.5523 1.44772 14 2 14H13C13.5523 14 14 13.5523 14 13V2C14 1.44772 13.5523 1 13 1H2ZM2 2H13V13H2V2ZM4 8C4 7.44772 4.44772 7 5 7H10C10.5523 7 11 7.44772 11 8C11 8.55228 10.5523 9 10 9H5C4.44772 9 4 8.55228 4 8Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
              Users
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 rounded-md">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M7.5 0.877075C3.84267 0.877075 0.877075 3.84267 0.877075 7.5C0.877075 11.1573 3.84267 14.1229 7.5 14.1229C11.1573 14.1229 14.1229 11.1573 14.1229 7.5C14.1229 3.84267 11.1573 0.877075 7.5 0.877075ZM7.5 1.82708C10.6351 1.82708 13.1729 4.36486 13.1729 7.5C13.1729 10.6351 10.6351 13.1729 7.5 13.1729C4.36486 13.1729 1.82708 10.6351 1.82708 7.5C1.82708 4.36486 4.36486 1.82708 7.5 1.82708ZM7.5 2.5C7.22386 2.5 7 2.72386 7 3V4H6C5.72386 4 5.5 4.22386 5.5 4.5C5.5 4.77614 5.72386 5 6 5H7V7H6C5.72386 7 5.5 7.22386 5.5 7.5C5.5 7.77614 5.72386 8 6 8H7V8.5C7 8.77614 7.22386 9 7.5 9C7.77614 9 8 8.77614 8 8.5V8H9C9.27614 8 9.5 7.77614 9.5 7.5C9.5 7.22386 9.27614 7 9 7H8V5H9C9.27614 5 9.5 4.77614 9.5 4.5C9.5 4.22386 9.27614 4 9 4H8V3C8 2.72386 7.77614 2.5 7.5 2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
              AI Configuration
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <main className="px-4 md:px-6 py-8">
          {/* Stats cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversations
                </CardTitle>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground">
                  <path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conversations.value}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground">
                  <path d="M7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645C7.24021 2.05268 7.36739 2 7.5 2C7.63261 2 7.75979 2.05268 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers.value}</div>
                <p className="text-xs text-muted-foreground">
                  +7.4% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Response Rate
                </CardTitle>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground">
                  <path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.responseRate.value}%</div>
                <p className="text-xs text-muted-foreground">
                  +4.3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Response Time
                </CardTitle>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground">
                  <path d="M7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645C7.24021 2.05268 7.36739 2 7.5 2C7.63261 2 7.75979 2.05268 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.responseTime.value.toFixed(1)}s</div>
                <p className="text-xs text-muted-foreground">
                  -0.2s from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick actions and System Status */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Quick Actions */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Common tasks and shortcuts
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Settings className="h-6 w-6" />
                  <span>Configure Widget</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Edit Context Rules</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Code className="h-6 w-6" />
                  <span>Get Embed Code</span>
                </Button>
              </CardContent>
            </Card>
            
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current system health
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemStatuses.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.status}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Chat Distribution Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Topic Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Conversation topics breakdown for the last 30 days
                </p>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-full max-w-md flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
