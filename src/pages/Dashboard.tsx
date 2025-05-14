import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { FileText, Code, Settings } from "lucide-react";

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
    <AdminLayout>
      <div className="flex flex-col">
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
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
