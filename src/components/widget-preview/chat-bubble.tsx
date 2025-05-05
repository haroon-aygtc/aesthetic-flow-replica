
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChatBubbleProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  iframeLoaded: boolean;
  setIframeLoaded: (loaded: boolean) => void;
  refreshKey: number;
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
  headerTitle: string;
  position: string;
  toggleChat: () => void;
  widgetId: string;
  initialMessage: string;
  inputPlaceholder: string;
  sendButtonText: string;
  secondaryColor: string;
  buttonPosition: React.CSSProperties;
  avatar?: {
    enabled?: boolean;
    imageUrl?: string;
    fallbackInitial?: string;
  };
  createIframeParams: () => string;
}

export function ChatBubble({
  iframeRef,
  iframeLoaded,
  setIframeLoaded,
  refreshKey,
  primaryColor,
  borderRadius,
  fontFamily,
  headerTitle,
  position,
  toggleChat,
  widgetId,
  initialMessage,
  inputPlaceholder,
  sendButtonText,
  secondaryColor,
  buttonPosition,
  avatar,
  createIframeParams,
}: ChatBubbleProps) {
  
  useEffect(() => {
    // Fix: Reset iframe loaded state when refreshKey changes
    setIframeLoaded(false);
  }, [refreshKey, setIframeLoaded]);
  
  return (
    <Card 
      className="h-full w-full overflow-hidden shadow-lg transition-all duration-300 ease-in-out animate-scale-in"
      style={{
        borderRadius: `${borderRadius}px`,
        fontFamily,
        ...buttonPosition
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
        <div className="flex items-center gap-2">
          {avatar?.enabled && (
            <Avatar className="h-8 w-8">
              {avatar.imageUrl ? (
                <AvatarImage src={avatar.imageUrl} alt="Chat bot avatar" />
              ) : (
                <AvatarFallback style={{ backgroundColor: secondaryColor }}>
                  {avatar.fallbackInitial || 'A'}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          <h3 className="font-medium text-[16px]">{headerTitle}</h3>
        </div>
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
        src={createIframeParams()}
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
  );
}
