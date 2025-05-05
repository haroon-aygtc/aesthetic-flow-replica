
import { useRef } from "react";
import { useWidgetPreview } from "./use-widget-preview";
import { DevicePreviewControls } from "./device-preview-controls";
import { ChatBubble } from "./chat-bubble";
import { ChatButton } from "./chat-button";
import { ExitFullscreenButton } from "./exit-fullscreen-button";
import { WidgetSettings } from "@/utils/widgetService";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ChatWidgetPreviewProps {
  settings?: WidgetSettings;
  widgetId?: string;
}

export function ChatWidgetPreview({ settings = {}, widgetId = "preview_widget" }: ChatWidgetPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const {
    isOpen,
    iframeLoaded,
    setIframeLoaded,
    refreshKey,
    isFullScreen,
    devicePreview,
    setDevicePreview,
    primaryColor,
    secondaryColor,
    fontFamily,
    borderRadius,
    chatIconSize,
    headerTitle,
    initialMessage,
    inputPlaceholder,
    sendButtonText,
    buttonPosition,
    position,
    avatar,
    deviceSizes,
    toggleChat,
    toggleFullScreen,
    createIframeParams,
  } = useWidgetPreview(settings, widgetId);

  // Create a simplified version of the widget for preview
  return (
    <div className={`relative bg-transparent transition-all duration-300 ease-in-out ${isFullScreen ? 'fixed inset-0 z-50 bg-background/80 p-8' : 'h-[500px] w-full max-w-[360px]'}`}>
      {/* Device preview controls */}
      <DevicePreviewControls 
        devicePreview={devicePreview}
        setDevicePreview={setDevicePreview}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
      />

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
          <ChatBubble 
            iframeRef={iframeRef}
            iframeLoaded={iframeLoaded}
            setIframeLoaded={setIframeLoaded}
            refreshKey={refreshKey}
            primaryColor={primaryColor}
            borderRadius={borderRadius}
            fontFamily={fontFamily}
            headerTitle={headerTitle}
            position={position}
            toggleChat={toggleChat}
            widgetId={widgetId}
            initialMessage={initialMessage}
            inputPlaceholder={inputPlaceholder}
            sendButtonText={sendButtonText}
            secondaryColor={secondaryColor}
            buttonPosition={buttonPosition}
            avatar={avatar}
            createIframeParams={createIframeParams}
          />
        ) : (
          <ChatButton 
            toggleChat={toggleChat}
            primaryColor={primaryColor}
            chatIconSize={chatIconSize}
            buttonPosition={buttonPosition}
          />
        )}

        {/* Exit fullscreen button when in fullscreen mode */}
        <ExitFullscreenButton 
          toggleFullScreen={toggleFullScreen} 
          isVisible={isFullScreen} 
        />
      </div>
    </div>
  );
}
