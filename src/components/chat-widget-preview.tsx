
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { WidgetSettings } from "@/utils/widgetService";

interface ChatWidgetPreviewProps {
  settings?: WidgetSettings;
  widgetId?: string;
}

export function ChatWidgetPreview({ settings = {}, widgetId = "preview_widget" }: ChatWidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate styles from settings
  const primaryColor = settings?.primaryColor || "#4f46e5";
  const secondaryColor = settings?.secondaryColor || "#4f46e5";
  const fontFamily = settings?.fontFamily || "Inter";
  const borderRadius = settings?.borderRadius || 8;
  const chatIconSize = settings?.chatIconSize || 40;
  const position = settings?.position || "bottom-right";
  const headerTitle = settings?.headerTitle || "AI Assistant";
  const initialMessage = settings?.initialMessage || "Hello! How can I help you today?";
  const inputPlaceholder = settings?.inputPlaceholder || "Type your message...";
  const sendButtonText = settings?.sendButtonText || "Send";

  // Update or create iframe when settings change
  useEffect(() => {
    if (isOpen && iframeRef.current) {
      // If iframe is already open, update its attributes
      const iframe = iframeRef.current;
      
      // Reset the iframe by removing and re-adding it
      if (iframe.parentNode) {
        const parent = iframe.parentNode;
        const newIframe = document.createElement('iframe');
        newIframe.style.width = '100%';
        newIframe.style.height = '100%';
        newIframe.style.border = 'none';
        newIframe.style.borderRadius = `${borderRadius}px`;
        
        // Set source with parameters
        const params = new URLSearchParams({
          widget_id: widgetId,
          primary_color: primaryColor,
          header_title: headerTitle,
          initial_message: initialMessage,
          input_placeholder: inputPlaceholder,
          send_button_text: sendButtonText
        });
        
        newIframe.src = `/widget/v1/iframe.html?${params}`;
        newIframe.onload = () => setIframeLoaded(true);
        
        parent.replaceChild(newIframe, iframe);
        iframeRef.current = newIframe;
      }
    }
  }, [
    isOpen, 
    widgetId, 
    primaryColor, 
    borderRadius, 
    headerTitle, 
    initialMessage, 
    inputPlaceholder, 
    sendButtonText
  ]);

  // Position styles
  const positionStyles = {
    "bottom-right": { bottom: "20px", right: "20px" },
    "bottom-left": { bottom: "20px", left: "20px" },
    "top-right": { top: "20px", right: "20px" },
    "top-left": { top: "20px", left: "20px" },
  };

  const buttonPosition = positionStyles[position as keyof typeof positionStyles];

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Create a simplified version of the widget for preview
  return (
    <div className="h-[500px] w-full max-w-[360px] relative bg-transparent" ref={containerRef}>
      {isOpen ? (
        <Card 
          className="absolute w-full h-full overflow-hidden shadow-lg"
          style={{
            borderRadius: `${borderRadius}px`,
            fontFamily,
            ...buttonPosition
          }}
        >
          <iframe 
            ref={iframeRef}
            src={`/widget/v1/iframe.html?widget_id=${widgetId}&primary_color=${encodeURIComponent(primaryColor)}&header_title=${encodeURIComponent(headerTitle)}&initial_message=${encodeURIComponent(initialMessage)}&input_placeholder=${encodeURIComponent(inputPlaceholder)}&send_button_text=${encodeURIComponent(sendButtonText)}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: `${borderRadius}px`
            }}
            onLoad={() => setIframeLoaded(true)}
          />
          
          {/* Show loading indicator while iframe loads */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </Card>
      ) : (
        <button
          onClick={toggleChat}
          className="absolute shadow-lg flex items-center justify-center rounded-full text-white transition-all hover:scale-105"
          style={{
            backgroundColor: primaryColor,
            width: `${chatIconSize}px`,
            height: `${chatIconSize}px`,
            ...buttonPosition
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
