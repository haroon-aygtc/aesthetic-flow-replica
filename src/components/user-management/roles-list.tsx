
import { useState } from "react";
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Search, Edit, Trash2, ShieldCheck, Users } from "lucide-react";

// Mock data for roles
const mockRoles = [
  { id: 1, name: "Admin", description: "Full access to all features", userCount: 2 },
  { id: 2, name: "Editor", description: "Can edit content but not system settings", userCount: 5 },
  { id: 3, name: "Viewer", description: "Read-only access to content", userCount: 12 },
  { id: 4, name: "Guest", description: "Limited access to public content", userCount: 30 },
];

const roleFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
});

export function RolesList() {
  const [roles, setRoles] = useState(mockRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  
  const form = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const filteredRoles = roles.filter(role => {
    return role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const openAddRoleDialog = () => {
    form.reset({
      name: "",
      description: "",
    });
    setEditingRole(null);
    setIsAddRoleOpen(true);
  };

  const openEditRoleDialog = (role: any) => {
    form.reset({
      name: role.name,
      description: role.description,
    });
    setEditingRole(role);
    setIsAddRoleOpen(true);
  };

  const onSubmit = (data: z.infer<typeof roleFormSchema>) => {
    if (editingRole) {
      // Update existing role
      setRoles(roles.map(role => role.id === editingRole.id ? { ...role, ...data } : role));
    } else {
      // Add new role
      const newRole = {
        id: roles.length + 1,
        ...data,
        userCount: 0
      };
      setRoles([...roles, newRole]);
    }
    setIsAddRoleOpen(false);
  };

  const deleteRole = (roleId: number) => {
    setRoles(roles.filter(role => role.id !== roleId));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            className="pl-8 w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={openAddRoleDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Users</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-purple-500" />
                    </div>
                    {role.name}
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {role.userCount}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditRoleDialog(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteRole(role.id)}
                      disabled={role.userCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter role description" 
                        className="resize-none h-20" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{editingRole ? "Update Role" : "Add Role"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
