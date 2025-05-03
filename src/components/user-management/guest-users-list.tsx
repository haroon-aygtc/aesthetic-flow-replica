
import { useState, useEffect } from "react";
import { guestUserAdminService } from "@/utils/guest-user-service";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function GuestUsersList() {
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<GuestUser | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGuestUsers();
  }, []);

  const fetchGuestUsers = async () => {
    try {
      setLoading(true);
      const response = await guestUserAdminService.getAllGuestUsers();
      setGuestUsers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch guest users:", error);
      toast({
        title: "Error",
        description: "Failed to load guest users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (guest: GuestUser) => {
    setSelectedGuest(guest);
    setDetailsDialogOpen(true);
    
    try {
      setLoadingChat(true);
      const response = await guestUserAdminService.getGuestUserChatHistory(guest.session_id);
      setChatHistory(response.data || []);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
      setChatHistory([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleDeleteClick = (guest: GuestUser) => {
    setSelectedGuest(guest);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGuest) return;
    
    try {
      setDeletingUser(true);
      await guestUserAdminService.deleteGuestUser(selectedGuest.id);
      toast({
        title: "Success",
        description: "Guest user deleted successfully",
      });
      setDeleteDialogOpen(false);
      fetchGuestUsers(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete guest user:", error);
      toast({
        title: "Error",
        description: "Failed to delete guest user",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Guest Users</CardTitle>
        <Button onClick={fetchGuestUsers} variant="outline" size="sm">
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
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
                      {formatDateTime(guest.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(guest)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(guest)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Guest User Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
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
                  <div>{formatDateTime(selectedGuest.created_at)}</div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Chat History</h4>
                  
                  {loadingChat ? (
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
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Guest User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this guest user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedGuest && (
              <div className="py-4">
                <p>You are about to delete: <span className="font-medium">{selectedGuest.fullname}</span></p>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deletingUser}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deletingUser}>
                {deletingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
