
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";

interface GuestUser {
  id: number;
  fullname: string;
  email: string | null;
  phone: string;
  session_id: string;
  widget_id: number;
  widget_name: string;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface GuestUserDetailsDialogProps {
  guestUser: GuestUser;
  chatHistory: ChatMessage[];
  isLoadingChat: boolean;
}

export function GuestUserDetailsDialog({ 
  guestUser, 
  chatHistory, 
  isLoadingChat 
}: GuestUserDetailsDialogProps) {
  
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Guest User Details</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Name:</div>
          <div>{guestUser.fullname}</div>
          
          <div className="font-medium">Email:</div>
          <div>{guestUser.email || "—"}</div>
          
          <div className="font-medium">Phone:</div>
          <div>{guestUser.phone}</div>
          
          <div className="font-medium">Session ID:</div>
          <div className="truncate text-xs">{guestUser.session_id}</div>
          
          <div className="font-medium">Widget:</div>
          <div>{guestUser.widget_name}</div>
          
          <div className="font-medium">Created:</div>
          <div>{formatDateTime(guestUser.created_at)}</div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Chat History</h4>
          
          {isLoadingChat ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : chatHistory.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
              {chatHistory.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-md text-sm ${
                    message.role === 'user' 
                      ? 'bg-muted ml-8' 
                      : 'bg-primary/10 mr-8'
                  }`}
                >
                  <div className="font-medium text-xs mb-1 flex justify-between">
                    <span>{message.role === 'user' ? 'Guest' : 'AI Assistant'}</span>
                    <span className="text-muted-foreground">{formatDateTime(message.created_at)}</span>
                  </div>
                  {message.content}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No chat history found
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}
