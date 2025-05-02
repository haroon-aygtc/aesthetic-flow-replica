
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

export const ChatWidgetPreview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! How can I assist you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages([...messages, { role: "user", content: inputValue }]);
    
    // Clear input
    setInputValue("");
    
    // Simulate assistant response after a short delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { 
          role: "system", 
          content: "Thank you for your message. This is a demo of our AI chat widget."
        }
      ]);
    }, 1000);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="border rounded-lg shadow-lg bg-white dark:bg-gray-800 overflow-hidden h-[520px] relative">
        {/* Chat header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
            <span className="font-medium text-primary-foreground">AI Assistant</span>
          </div>
          <button className="text-primary-foreground opacity-80 hover:opacity-100">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        {/* Chat messages */}
        <div className="p-4 h-[400px] overflow-y-auto flex flex-col gap-3">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        
        {/* Chat input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button 
              onClick={handleSendMessage}
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat button (this would normally be fixed to bottom-right) */}
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={toggleChat}
          className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

