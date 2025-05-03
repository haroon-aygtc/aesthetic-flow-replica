
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { WidgetSettings } from "@/utils/widgetService";

export function useWidgetSettings() {
  const { toast } = useToast();
  const [selectedWidget, setSelectedWidget] = useState("default");
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    primaryColor: "#4f46e5",
    borderRadius: 8,
    position: "bottom-right",
    initialMessage: "Hello! How can I help you today?",
    headerTitle: "AI Assistant"
  });
  
  // This would come from the backend in a real implementation
  const widgets = [
    { id: "default", name: "Default Widget" },
    { id: "support", name: "Support Widget" },
    { id: "sales", name: "Sales Widget" },
  ];

  // Update widget settings when selecting a different widget
  const handleWidgetChange = async (widgetId: string) => {
    setSelectedWidget(widgetId);
    
    try {
      // In a real implementation, this would fetch the widget settings from the API
      // For now, we'll just simulate different settings for different widgets
      if (widgetId === "support") {
        setWidgetSettings({
          primaryColor: "#22c55e",
          borderRadius: 12,
          position: "bottom-right",
          initialMessage: "Hello! How can I assist with your support needs today?",
          headerTitle: "Support Chat"
        });
      } else if (widgetId === "sales") {
        setWidgetSettings({
          primaryColor: "#ef4444",
          borderRadius: 4,
          position: "bottom-left",
          initialMessage: "Hi there! Interested in learning more about our products?",
          headerTitle: "Sales Inquiry"
        });
      } else {
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
    }
  };

  const getWidgetConfig = () => {
    return {
      id: "widget_" + selectedWidget,
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
    setSelectedWidget: handleWidgetChange,
    getWidgetConfig
  };
}
