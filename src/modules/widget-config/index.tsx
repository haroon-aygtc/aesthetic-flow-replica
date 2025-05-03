
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatWidgetPreview } from "@/components/widget-preview/chat-widget-preview";
import { useWidgetSettings } from "@/hooks/use-widget-settings";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function WidgetConfigModule() {
  const [activeTab, setActiveTab] = useState("appearance");
  const { widgetSettings } = useWidgetSettings();
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Module in development</AlertTitle>
          <AlertDescription>
            The Widget Configuration module is currently under development. Please check back later.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Widget Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appearance" className="space-y-4">
                <p className="text-muted-foreground">
                  Customize colors, fonts, sizes, and overall visual appearance of your chat widget.
                </p>
              </TabsContent>
              
              <TabsContent value="behavior">
                <p className="text-muted-foreground">
                  Configure widget behavior, animations, and interaction patterns.
                </p>
              </TabsContent>
              
              <TabsContent value="content">
                <p className="text-muted-foreground">
                  Set default messages, button text, and other content elements.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center items-center">
        <ChatWidgetPreview settings={widgetSettings} />
      </div>
    </div>
  );
}
