
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { WidgetSettings, widgetService } from "@/utils/widgetService";

export function useWidgetSettings() {
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<{ id: string; name: string }[]>([]);
  const [selectedWidget, setSelectedWidget] = useState("");
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    primaryColor: "#4f46e5",
    borderRadius: 8,
    position: "bottom-right",
    initialMessage: "Hello! How can I help you today?",
    headerTitle: "AI Assistant"
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch widgets on mount
  useEffect(() => {
    fetchWidgets();
  }, []);
  
  // Fetch widgets from API
  const fetchWidgets = async () => {
    setIsLoading(true);
    try {
      const response = await widgetService.getAllWidgets();
      const widgetData = response.data.map((widget: any) => ({
        id: widget.widget_id || widget.id.toString(),
        name: widget.name
      }));
      
      setWidgets(widgetData);
      
      // Select first widget if available
      if (widgetData.length > 0 && !selectedWidget) {
        handleWidgetChange(widgetData[0].id);
      }
    } catch (error) {
      console.error("Error fetching widgets:", error);
      toast({
        title: "Error",
        description: "Failed to load widgets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update widget settings when selecting a different widget
  const handleWidgetChange = async (widgetId: string) => {
    setSelectedWidget(widgetId);
    setIsLoading(true);
    
    try {
      const response = await widgetService.getWidgetByPublicId(widgetId);
      const data = response.data;
      
      if (data && data.settings) {
        setWidgetSettings(data.settings);
      } else {
        // Fall back to default settings if none available
        setWidgetSettings({
          primaryColor: "#4f46e5",
          borderRadius: 8,
          position: "bottom-right",
          initialMessage: "Hello! How can I help you today?",
          headerTitle: "AI Assistant"
        });
      }
    } catch (error) {
      console.error("Error fetching widget settings:", error);
      toast({
        title: "Error",
        description: "Failed to load widget settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWidgetConfig = () => {
    return {
      id: selectedWidget,
      primaryColor: widgetSettings.primaryColor || "#4f46e5",
      borderRadius: widgetSettings.borderRadius?.toString() || "8",
      position: widgetSettings.position || "bottom-right",
      initialMessage: widgetSettings.initialMessage || "Hello! How can I help you today?"
    };
  };
  
  return {
    widgets,
    selectedWidget,
    widgetSettings,
    isLoading,
    setSelectedWidget: handleWidgetChange,
    getWidgetConfig,
    refreshWidgets: fetchWidgets
  };
}
