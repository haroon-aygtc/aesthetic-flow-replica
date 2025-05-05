
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";

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

interface GuestUsersTableProps {
  guestUsers: GuestUser[];
  onViewDetails: (guest: GuestUser) => void;
  onDeleteClick: (guest: GuestUser) => void;
}

export function GuestUsersTable({ 
  guestUsers, 
  onViewDetails, 
  onDeleteClick 
}: GuestUsersTableProps) {
  
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
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
                    onClick={() => onViewDetails(guest)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDeleteClick(guest)}
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
  );
}
