
import { useState, useEffect } from "react";
import { WidgetSettings } from "@/utils/widgetService";

export function useWidgetPreview(settings: WidgetSettings = {}, widgetId: string = "preview_widget") {
  const [isOpen, setIsOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");

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

  // Avatar settings
  const avatar = settings?.avatar || {
    enabled: false,
    imageUrl: "",
    fallbackInitial: "A"
  };

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
    sendButtonText,
    // Use individual avatar properties instead of the entire object
    avatar?.enabled,
    avatar?.imageUrl,
    avatar?.fallbackInitial
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

  // Create iframe parameters
  const createIframeParams = () => {
    if (!isOpen) return "";

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
      preview_mode: "true", // Flag to indicate this is a preview
      avatar_enabled: String(!!avatar?.enabled),
      avatar_image_url: avatar?.imageUrl || "",
      avatar_fallback: avatar?.fallbackInitial || "A"
    });

    return `/widget/v1/iframe.html?${params}&_=${refreshKey}`;
  };

  return {
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
    position,
    headerTitle,
    initialMessage,
    inputPlaceholder,
    sendButtonText,
    buttonPosition,
    avatar,
    deviceSizes,
    toggleChat,
    toggleFullScreen,
    createIframeParams,
  };
}
