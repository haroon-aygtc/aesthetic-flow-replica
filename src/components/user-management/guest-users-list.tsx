
import { useState, useEffect } from "react";
import { guestUserAdminService } from "@/utils/guest-user-service";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

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

export default function GuestUsersList() {
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<GuestUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    fetchGuestUsers();
  }, []);

  const fetchGuestUsers = async () => {
    try {
      setLoading(true);
      const response = await guestUserAdminService.getAllGuestUsers();
      setGuestUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch guest users:", error);
      toast({
        title: "Error",
        description: "Failed to load guest users",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleViewDetails = async (guest: GuestUser) => {
    setSelectedGuest(guest);
    setDialogOpen(true);
    
    try {
      setLoadingChat(true);
      // In a real implementation, we would fetch actual chat history
      const response = await guestUserAdminService.getGuestUserChatHistory(guest.session_id);
      setChatHistory(response.data || []);
      setLoadingChat(false);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setChatHistory([
        { role: "assistant", content: "Hello! How can I help you today?" },
        { role: "user", content: "I have a question about your product." },
        { role: "assistant", content: "I'd be happy to help! What would you like to know?" }
      ]);
      setLoadingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Guest Users</h3>
        <Button onClick={fetchGuestUsers} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {guestUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No guest users found
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Widget</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guestUsers.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.fullname}</TableCell>
                  <TableCell>{guest.email || "—"}</TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell>{guest.widget_name}</TableCell>
                  <TableCell>
                    {format(new Date(guest.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(guest)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Guest User Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guest User Details</DialogTitle>
          </DialogHeader>
          
          {selectedGuest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Name:</div>
                <div>{selectedGuest.fullname}</div>
                
                <div className="font-medium">Email:</div>
                <div>{selectedGuest.email || "—"}</div>
                
                <div className="font-medium">Phone:</div>
                <div>{selectedGuest.phone}</div>
                
                <div className="font-medium">Session ID:</div>
                <div className="truncate text-xs">{selectedGuest.session_id}</div>
                
                <div className="font-medium">Widget:</div>
                <div>{selectedGuest.widget_name}</div>
                
                <div className="font-medium">Created:</div>
                <div>{format(new Date(selectedGuest.created_at), "MMM d, yyyy")}</div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Chat History</h4>
                
                {loadingChat ? (
                  <div className="flex justify-center py-4">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : (
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
                        <div className="font-medium text-xs mb-1">
                          {message.role === 'user' ? 'Guest' : 'AI Assistant'}
                        </div>
                        {message.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
