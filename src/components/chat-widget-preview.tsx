
// This file re-exports the refactored component to maintain backwards compatibility
import { ChatWidgetPreview as OriginalChatWidgetPreview } from './widget-preview/chat-widget-preview';
import { WidgetSettings } from "@/utils/widgetService";

// Create a wrapper component with the same props structure
interface ChatWidgetPreviewProps {
  settings?: WidgetSettings;
  widgetId?: string;
}

export function ChatWidgetPreview({ settings = {}, widgetId = "preview_widget" }: ChatWidgetPreviewProps) {
  return <OriginalChatWidgetPreview settings={settings} widgetId={widgetId} />;
}

