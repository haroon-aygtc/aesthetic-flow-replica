
import { useState, useEffect } from "react";
import { guestUserAdminService } from "@/utils/guest-user-service";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { GuestUsersTable } from "./guest-users/guest-users-table";
import { GuestUserDetailsDialog } from "./guest-users/guest-user-details-dialog";
import { GuestUserDeleteDialog } from "./guest-users/guest-user-delete-dialog";

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
          <GuestUsersTable 
            guestUsers={guestUsers} 
            onViewDetails={handleViewDetails}
            onDeleteClick={handleDeleteClick}
          />
        )}

        {/* Guest User Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          {selectedGuest && (
            <GuestUserDetailsDialog
              guestUser={selectedGuest}
              chatHistory={chatHistory}
              isLoadingChat={loadingChat}
            />
          )}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          {selectedGuest && (
            <GuestUserDeleteDialog
              guestUser={selectedGuest}
              onDelete={handleDeleteConfirm}
              onCancel={() => setDeleteDialogOpen(false)}
              isDeleting={deletingUser}
            />
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
}
