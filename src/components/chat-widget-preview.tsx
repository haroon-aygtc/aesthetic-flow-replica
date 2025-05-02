
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { WidgetSettings } from "@/utils/widgetService";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Fullscreen, Smartphone, Tablet, Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatWidgetPreviewProps {
  settings?: WidgetSettings;
  widgetId?: string;
}

export function ChatWidgetPreview({ settings = {}, widgetId = "preview_widget" }: ChatWidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force reload
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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

  // Update preview when settings change
  useEffect(() => {
    // Force refresh of the preview when important settings change
    setRefreshKey(prev => prev + 1);
  }, [
    primaryColor,
    secondaryColor,
    borderRadius,
    chatIconSize,
    position,
    headerTitle,
    initialMessage,
    inputPlaceholder,
    sendButtonText
  ]);

  // Update or create iframe when settings change
  useEffect(() => {
    if (isOpen && iframeRef.current) {
      setIframeLoaded(false);
      
      // Create params for iframe
      const params = new URLSearchParams({
        widget_id: widgetId,
        primary_color: encodeURIComponent(primaryColor),
        secondary_color: encodeURIComponent(secondaryColor),
        border_radius: String(borderRadius),
        font_family: encodeURIComponent(fontFamily),
        header_title: encodeURIComponent(headerTitle),
        initial_message: encodeURIComponent(initialMessage),
        input_placeholder: encodeURIComponent(inputPlaceholder),
        send_button_text: encodeURIComponent(sendButtonText),
        preview_mode: "true" // Flag to indicate this is a preview
      });
      
      // Update iframe source with new parameters
      iframeRef.current.src = `/widget/v1/iframe.html?${params}&_=${refreshKey}`;
    }
  }, [
    isOpen,
    refreshKey,
    widgetId, 
    primaryColor,
    secondaryColor,
    borderRadius,
    fontFamily,
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
    // Reset iframe loaded state when toggling
    if (!isOpen) {
      setIframeLoaded(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Device preview width settings
  const deviceSizes = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px"
  };

  // Create a simplified version of the widget for preview
  return (
    <div className={`relative bg-transparent transition-all duration-300 ease-in-out ${isFullScreen ? 'fixed inset-0 z-50 bg-background/80 p-8' : 'h-[500px] w-full max-w-[360px]'}`}>
      {/* Device preview controls */}
      <div className={`mb-4 flex justify-center gap-2 ${isFullScreen ? '' : 'absolute -top-14 right-0'}`}>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setDevicePreview("mobile")}
          className={`transition-all duration-200 ${devicePreview === "mobile" ? "bg-primary text-primary-foreground" : ""}`}
        >
          <Smartphone className="h-4 w-4" />
          <span className="sr-only">Mobile view</span>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setDevicePreview("tablet")}
          className={`transition-all duration-200 ${devicePreview === "tablet" ? "bg-primary text-primary-foreground" : ""}`}
        >
          <Tablet className="h-4 w-4" />
          <span className="sr-only">Tablet view</span>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setDevicePreview("desktop")}
          className={`transition-all duration-200 ${devicePreview === "desktop" ? "bg-primary text-primary-foreground" : ""}`}
        >
          <Monitor className="h-4 w-4" />
          <span className="sr-only">Desktop view</span>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleFullScreen}
          className="ml-2 transition-all duration-200"
        >
          <Fullscreen className="h-4 w-4" />
          <span className="sr-only">Full screen</span>
        </Button>
      </div>

      <div 
        ref={containerRef}
        className={`
          mx-auto transition-all duration-300 ease-in-out
          ${isFullScreen ? 'h-full max-h-[800px]' : 'h-full'}
        `}
        style={{
          width: devicePreview === "desktop" ? (isFullScreen ? "100%" : deviceSizes.desktop) : deviceSizes[devicePreview],
          maxWidth: isFullScreen ? "1200px" : "360px",
        }}
      >
        {isOpen ? (
          <Card 
            className="h-full w-full overflow-hidden shadow-lg transition-all duration-300 ease-in-out animate-scale-in"
            style={{
              borderRadius: `${borderRadius}px`,
              fontFamily,
              ...(isFullScreen ? {} : buttonPosition)
            }}
          >
            <div className="w-full h-[60px] flex items-center justify-between px-4"
              style={{
                backgroundColor: primaryColor,
                color: "#fff",
                borderTopLeftRadius: `${borderRadius}px`,
                borderTopRightRadius: `${borderRadius}px`
              }}
            >
              <h3 className="font-medium text-[16px]">{headerTitle}</h3>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                onClick={toggleChat}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <iframe 
              key={`iframe-${refreshKey}`}
              ref={iframeRef}
              className="w-full h-[calc(100%-60px)]"
              style={{
                border: 'none',
                backgroundColor: '#f9fafb'
              }}
              onLoad={() => setIframeLoaded(true)}
            />
            
            {/* Show loading indicator while iframe loads */}
            {!iframeLoaded && (
              <div className="absolute inset-0 top-[60px] flex items-center justify-center bg-background/80">
                <Spinner className="h-8 w-8 text-primary" />
              </div>
            )}
          </Card>
        ) : (
          <button
            onClick={toggleChat}
            className="absolute shadow-lg flex items-center justify-center rounded-full text-white transition-all duration-300 ease-in-out hover:scale-105 animate-fade-in"
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

        {/* Exit fullscreen button when in fullscreen mode */}
        {isFullScreen && (
          <Button 
            variant="outline" 
            className="absolute top-4 right-4 transition-all duration-200"
            onClick={toggleFullScreen}
          >
            Exit Fullscreen
          </Button>
        )}
      </div>
    </div>
  );
}
