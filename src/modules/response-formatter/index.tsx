
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ResponseFormatterModule() {
  const [activeTab, setActiveTab] = useState("formats");
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Module in development</AlertTitle>
        <AlertDescription>
          The Response Formatter module is currently under development. Please check back later.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Response Formatter</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="formats">Formats</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formats" className="space-y-4">
              <p className="text-muted-foreground">
                Configure how AI responses are formatted for different use cases.
              </p>
            </TabsContent>
            
            <TabsContent value="rules">
              <p className="text-muted-foreground">
                Define rules for applying specific formats based on content types.
              </p>
            </TabsContent>
            
            <TabsContent value="preview">
              <p className="text-muted-foreground">
                Preview how AI responses will be formatted with your current settings.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
