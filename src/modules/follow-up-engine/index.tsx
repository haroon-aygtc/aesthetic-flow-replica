
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowUpEngine } from "@/components/ai-configuration/follow-up-engine";

export function FollowUpEngineModule() {
  const [activeTab, setActiveTab] = useState("configuration");
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Follow-Up Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="configuration" className="space-y-4">
              <FollowUpEngine />
            </TabsContent>
            
            <TabsContent value="analytics">
              <FollowUpAnalytics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics component to track follow-up performance
function FollowUpAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Engagement Rate" 
          value="24.8%" 
          change="+5.3%" 
          trend="up" 
        />
        <StatCard 
          title="Click-through Rate" 
          value="12.3%" 
          change="+2.1%" 
          trend="up" 
        />
        <StatCard 
          title="Conversion Rate" 
          value="3.7%" 
          change="-0.5%" 
          trend="down" 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Tell me about your pricing</p>
                <p className="text-sm text-muted-foreground">67% engagement rate</p>
              </div>
              <p className="text-sm font-medium text-green-600">+12.4%</p>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">How does your support work?</p>
                <p className="text-sm text-muted-foreground">52% engagement rate</p>
              </div>
              <p className="text-sm font-medium text-green-600">+8.7%</p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Need help with something else?</p>
                <p className="text-sm text-muted-foreground">43% engagement rate</p>
              </div>
              <p className="text-sm font-medium text-green-600">+5.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

function StatCard({ title, value, change, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{value}</p>
            <span className={`text-xs font-medium flex items-center ${
              trend === "up" ? "text-green-600" : 
              trend === "down" ? "text-red-600" : 
              "text-gray-500"
            }`}>
              {trend === "up" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              ) : trend === "down" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v3.586l4.293-4.293a1 1 0 011.414 0L16 11.586V7.001a1 1 0 112 0V12a1 1 0 01-1 1h-5z" clipRule="evenodd" />
                </svg>
              ) : null}
              {change}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
