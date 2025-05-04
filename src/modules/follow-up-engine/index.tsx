
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FollowUpEngineModule() {
  const [activeTab, setActiveTab] = useState("triggers");
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Module in development</AlertTitle>
        <AlertDescription>
          The Follow-Up Engine module is currently under development. Please check back later.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Follow-Up Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            </TabsList>
            
            <TabsContent value="triggers" className="space-y-4">
              <p className="text-muted-foreground">
                Configure events and conditions that trigger follow-up messages.
              </p>
            </TabsContent>
            
            <TabsContent value="messages">
              <p className="text-muted-foreground">
                Create templates for follow-up messages based on different scenarios.
              </p>
            </TabsContent>
            
            <TabsContent value="scheduling">
              <p className="text-muted-foreground">
                Set timing and frequency rules for follow-up messages.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
