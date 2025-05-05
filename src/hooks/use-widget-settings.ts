
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { WidgetSettings, Widget, widgetService } from "@/utils/widgetService";

// Define a more complete type for our internal widget representation
interface WidgetListItem {
  id: string;
  name: string;
  numericId?: number; // Add the numericId property that was missing
}

export function useWidgetSettings() {
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<WidgetListItem[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string>("");
  const [selectedWidgetId, setSelectedWidgetId] = useState<number | null>(null);
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
        name: widget.name,
        numericId: widget.id // Store the numeric ID for API calls
      }));
      
      setWidgets(widgetData);
      
      // Select first widget if available
      if (widgetData.length > 0 && !selectedWidget) {
        handleWidgetChange(widgetData[0].id);
      } else if (widgetData.length === 0) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching widgets:", error);
      toast({
        title: "Error",
        description: "Failed to load widgets",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Update widget settings when selecting a different widget
  const handleWidgetChange = async (widgetId: string) => {
    setSelectedWidget(widgetId);
    setIsLoading(true);
    
    try {
      // Find the numeric ID for this widget
      const widget = widgets.find(w => w.id === widgetId);
      const numericId = widget?.numericId;
      setSelectedWidgetId(numericId || null);
      
      // For local development without backend, can use mock response:
      let response;
      try {
        if (numericId) {
          response = await widgetService.getWidget(numericId);
        } else {
          response = await widgetService.getWidgetByPublicId(widgetId);
        }
      } catch (error) {
        // Fallback mock response if API fails
        console.warn("Using fallback mock data for widget:", error);
        response = {
          data: {
            widget_id: widgetId,
            settings: {
              primaryColor: "#4f46e5",
              borderRadius: 8,
              position: "bottom-right",
              initialMessage: "Hello! How can I help you today?",
              headerTitle: "AI Assistant"
            }
          }
        };
      }
      
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

  // Update widget settings in the API
  const updateWidgetSettings = async (newSettings: Partial<WidgetSettings>) => {
    if (!selectedWidgetId) {
      console.error("No widget selected");
      return Promise.reject(new Error("No widget selected"));
    }
    
    try {
      // Merge new settings with existing settings
      const updatedSettings = { ...widgetSettings, ...newSettings };
      setWidgetSettings(updatedSettings);
      
      // Update API
      await widgetService.updateWidget(selectedWidgetId, {
        settings: updatedSettings
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating widget settings:", error);
      return Promise.reject(error);
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
    updateWidgetSettings,
    getWidgetConfig,
    refreshWidgets: fetchWidgets
  };
}
