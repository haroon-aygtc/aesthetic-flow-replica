
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";

export function ChatWidgetPreview() {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg max-w-md w-full bg-white dark:bg-gray-800">
      <div className="bg-primary p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-white h-5 w-5" />
          <span className="text-white font-medium">AI Assistant</span>
        </div>
      </div>
      <div className="p-4 h-64 overflow-y-auto flex flex-col gap-3 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-start gap-2">
          <div className="bg-primary rounded-full p-1 mt-1">
            <MessageSquare className="text-white h-3 w-3" />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg max-w-[80%]">
            <p className="text-sm">Hello there! How may I help you today?</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <div className="bg-blue-50 dark:bg-gray-700 p-2 rounded-lg max-w-[80%]">
            <p className="text-sm">I have a question about your services.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="bg-primary rounded-full p-1 mt-1">
            <MessageSquare className="text-white h-3 w-3" />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg max-w-[80%]">
            <p className="text-sm">I'd be happy to help you with any questions about our services. What would you like to know?</p>
          </div>
        </div>
      </div>
      <div className="p-3 border-t flex items-center gap-2">
        <input 
          type="text" 
          placeholder="Type your message..." 
          className="chat-input"
        />
        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
