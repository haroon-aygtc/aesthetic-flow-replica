
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Edit, Users, ShieldCheck } from "lucide-react";

interface Role {
  id: number;
  name: string;
  description: string | null;
  users_count: number;
  permissions: any[];
}

interface RoleInfoCardProps {
  role: Role;
}

export function RoleInfoCard({ role }: RoleInfoCardProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{role.name}</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Role</DialogTitle>
              </DialogHeader>
              {/* This would contain the edit form, but we're using the existing edit functionality in roles-list.tsx */}
              <p className="py-4">Use the Roles tab to edit this role's details.</p>
            </DialogContent>
          </Dialog>
        </div>
        {role.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {role.description}
          </p>
        )}
        <div className="flex items-center space-x-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">{role.users_count} users</span>
        </div>
        <div className="flex items-center space-x-1 text-muted-foreground mt-1">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm">
            {role.permissions?.length || 0} permissions
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
