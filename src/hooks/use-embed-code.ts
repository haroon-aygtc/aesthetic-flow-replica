
import { useState } from "react";

interface WidgetConfig {
  id: string;
  primaryColor: string;
  borderRadius: string;
  position: string;
  initialMessage: string;
}

export function useEmbedCode() {
  const [copied, setCopied] = useState(false);

  const generateEmbedCode = (type: string, widgetConfig: WidgetConfig) => {
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
    generateEmbedCode,
    getEmbedDescription
  };
}
