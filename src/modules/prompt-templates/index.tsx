
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PromptTemplatesModule() {
  const [activeTab, setActiveTab] = useState("templates");
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Module in development</AlertTitle>
        <AlertDescription>
          The Prompt Templates module is currently under development. Please check back later.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Prompt Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4">
              <p className="text-muted-foreground">
                Create and manage prompt templates for consistent AI responses.
              </p>
            </TabsContent>
            
            <TabsContent value="variables">
              <p className="text-muted-foreground">
                Define variables that can be used in your prompt templates.
              </p>
            </TabsContent>
            
            <TabsContent value="testing">
              <p className="text-muted-foreground">
                Test your prompt templates with different variables and inputs.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
