
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ContextRulesModule() {
  const [activeTab, setActiveTab] = useState("rules");
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Module in development</AlertTitle>
        <AlertDescription>
          The Context Rules module is currently under development. Please check back later.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Context Rules Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rules" className="space-y-4">
              <p className="text-muted-foreground">
                This module will allow you to create context-based rules for determining which AI models to use based on input context.
              </p>
              <Button>Add Rule</Button>
            </TabsContent>
            
            <TabsContent value="conditions">
              <p className="text-muted-foreground">
                Define conditions that will trigger specific AI models based on user input and context.
              </p>
            </TabsContent>
            
            <TabsContent value="testing">
              <p className="text-muted-foreground">
                Test your context rules with sample inputs to ensure they work as expected.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
