
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatWidgetPreview } from "@/components/widget-preview/chat-widget-preview";
import { useWidgetSettings } from "@/hooks/use-widget-settings";
import { AppearanceTab } from "./appearance-tab";
import { BehaviorTab } from "./behavior-tab";
import { ContentTab } from "./content-tab";
import { WidgetSelector } from "./widget-selector";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateWidgetDialog } from "./create-widget-dialog";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

export function WidgetConfigModule() {
  const [activeTab, setActiveTab] = useState("appearance");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { 
    widgets, 
    selectedWidget, 
    widgetSettings, 
    isLoading, 
    setSelectedWidget, 
    updateWidgetSettings,
    refreshWidgets 
  } = useWidgetSettings();
  const { toast } = useToast();
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleSettingsChange = (newSettings: any) => {
    if (!selectedWidget) return;
    
    updateWidgetSettings(newSettings)
      .then(() => {
        toast({
          title: "Settings updated",
          description: "Widget configuration has been saved successfully."
        });
      })
      .catch(() => {
        toast({
          title: "Failed to update settings",
          description: "There was an error saving your widget configuration.",
          variant: "destructive"
        });
      });
  };

  const handleCreateWidget = () => {
    setIsCreateDialogOpen(true);
  };

  const handleWidgetCreated = () => {
    refreshWidgets();
    setIsCreateDialogOpen(false);
  };
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <WidgetSelector 
              widgets={widgets} 
              selectedWidget={selectedWidget} 
              onWidgetChange={setSelectedWidget} 
              isLoading={isLoading}
            />
          </div>
          
          <Button onClick={handleCreateWidget} size="sm" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>New Widget</span>
          </Button>
        </div>
        
        <Card>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
                <TabsTrigger value="behavior" className="flex-1">Behavior</TabsTrigger>
                <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appearance">
                <AppearanceTab 
                  settings={widgetSettings} 
                  onChange={handleSettingsChange}
                />
              </TabsContent>
              
              <TabsContent value="behavior">
                <BehaviorTab 
                  settings={widgetSettings} 
                  onChange={handleSettingsChange}
                />
              </TabsContent>
              
              <TabsContent value="content">
                <ContentTab 
                  settings={widgetSettings} 
                  onChange={handleSettingsChange}
                />
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </div>
      
      <div className="flex justify-center items-center">
        <ChatWidgetPreview settings={widgetSettings} />
      </div>
      
      <CreateWidgetDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onWidgetCreated={handleWidgetCreated}
      />
    </div>
  );
}
