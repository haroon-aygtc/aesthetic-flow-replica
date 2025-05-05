
import { useState } from "react";
import { widgetService } from "@/utils/widgetService";
import { useToast } from "@/hooks/use-toast";

interface WidgetConfig {
  id: string;
  primaryColor: string;
  borderRadius: string;
  position: string;
  initialMessage: string;
}

export function useEmbedCode() {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [embedCodes, setEmbedCodes] = useState<Record<string, string>>({
    standard: '',
    iframe: '',
    webcomponent: ''
  });
  const { toast } = useToast();

  const generateEmbedCode = async (type: string, widgetConfig: WidgetConfig) => {
    // Check if we've already generated this type of embed code
    if (embedCodes[type]) {
      return embedCodes[type];
    }
    
    try {
      setIsLoading(true);
      
      // Call API to generate embed code
      const response = await widgetService.generateEmbedCode(widgetConfig.id, {
        embedType: type as 'standard' | 'iframe' | 'web-component',
        customizations: {
          primaryColor: widgetConfig.primaryColor,
          borderRadius: widgetConfig.borderRadius,
          position: widgetConfig.position,
          initialMessage: widgetConfig.initialMessage
        }
      });
      
      const code = response.data.embed_code;
      
      // Update cached codes
      setEmbedCodes(prev => ({
        ...prev,
        [type]: code
      }));
      
      return code;
    } catch (error) {
      console.error("Error generating embed code:", error);
      toast({
        title: "Error",
        description: "Failed to generate embed code",
        variant: "destructive"
      });
      
      // Fall back to client-side generation if API fails
      return fallbackGenerateEmbedCode(type, widgetConfig);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback embed code generation in case the API call fails
  const fallbackGenerateEmbedCode = (type: string, widgetConfig: WidgetConfig) => {
    if (type === "standard") {
      return `<script src="https://chatsystem.ai/widget/v1/script.js" 
  data-widget-id="${widgetConfig.id}"
  data-primary-color="${widgetConfig.primaryColor}"
  data-border-radius="${widgetConfig.borderRadius}"
  async>
</script>`;
    } else if (type === "iframe") {
      return `<iframe 
  src="https://chatsystem.ai/widget/embed/${widgetConfig.id}" 
  width="100%" 
  height="500px"
  style="border: 1px solid #eee; border-radius: 8px;">
</iframe>`;
    } else {
      return `<chat-widget 
  widget-id="${widgetConfig.id}"
  primary-color="${widgetConfig.primaryColor}">
</chat-widget>

<script src="https://chatsystem.ai/widget/v1/web-component.js" async></script>`;
    }
  };

  const getEmbedDescription = (type: string) => {
    if (type === "standard") {
      return "The standard integration adds a small script to your website that will load the widget when needed. This is the recommended approach for most websites.";
    } else if (type === "iframe") {
      return "Use iFrame integration to embed the widget in a specific location on your page, rather than as a floating chat button.";
    } else {
      return "Use Web Component integration for more control over the widget's position and styling. This approach uses Shadow DOM for style encapsulation.";
    }
  };

  return {
    copied,
    setCopied,
    isLoading,
    generateEmbedCode,
    getEmbedDescription
  };
}
