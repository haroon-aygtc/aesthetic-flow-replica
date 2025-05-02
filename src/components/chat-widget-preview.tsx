
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { WidgetSettings } from "@/utils/widgetService";

interface ChatWidgetPreviewProps {
  settings?: WidgetSettings;
}

export function ChatWidgetPreview({ settings = {} }: ChatWidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: settings?.initialMessage || "Hello! How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Update initial message when settings change
    if (settings?.initialMessage) {
      setMessages([
        { role: "assistant", content: settings.initialMessage }
      ]);
    }
  }, [settings?.initialMessage]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [
      ...messages,
      { role: "user", content: inputValue }
    ];
    
    setMessages(newMessages);
    setInputValue("");

    // Simulate assistant response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "This is a preview of how your widget will appear. The actual responses will be provided by your selected AI model." }
      ]);
    }, 1000);
  };

  // Calculate styles from settings
  const primaryColor = settings?.primaryColor || "#4f46e5";
  const secondaryColor = settings?.secondaryColor || "#4f46e5";
  const fontFamily = settings?.fontFamily || "Inter";
  const borderRadius = settings?.borderRadius || 8;
  const chatIconSize = settings?.chatIconSize || 40;
  const position = settings?.position || "bottom-right";
  const headerTitle = settings?.headerTitle || "AI Assistant";
  const inputPlaceholder = settings?.inputPlaceholder || "Type your message...";
  const sendButtonText = settings?.sendButtonText || "Send";

  // Position styles
  const positionStyles = {
    "bottom-right": { bottom: "20px", right: "20px" },
    "bottom-left": { bottom: "20px", left: "20px" },
    "top-right": { top: "20px", right: "20px" },
    "top-left": { top: "20px", left: "20px" },
  };

  const buttonPosition = positionStyles[position as keyof typeof positionStyles];

  return (
    <div className="h-[500px] w-full max-w-[360px] relative bg-transparent">
      {isOpen ? (
        <Card 
          className="absolute w-full h-full overflow-hidden flex flex-col transition-all shadow-lg"
          style={{
            borderRadius: `${borderRadius}px`,
            fontFamily,
            ...buttonPosition
          }}
        >
          {/* Header */}
          <div 
            className="text-white flex items-center justify-between p-4"
            style={{ backgroundColor: primaryColor }}
          >
            <h3 className="font-medium">{headerTitle}</h3>
            <button 
              onClick={toggleChat}
              className="text-white hover:bg-white/20 rounded-full p-1 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* Chat area */}
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`mb-4 max-w-[80%] ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    msg.role === "user" 
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-br-none" 
                      : "bg-primary/10 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  }`}
                  style={{ 
                    backgroundColor: msg.role === "user" ? "#e2e8f0" : `${primaryColor}20`
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input area */}
          <form onSubmit={handleSendMessage} className="border-t p-3 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <input
                type="text"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-1 dark:bg-gray-700 dark:border-gray-600"
                style={{ borderColor: `${primaryColor}40` }}
              />
              <button
                type="submit"
                className="px-4 py-2 text-white rounded-r-lg transition"
                style={{ backgroundColor: primaryColor }}
              >
                {sendButtonText}
              </button>
            </div>
          </form>
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
