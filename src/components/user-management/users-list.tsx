
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { PlusCircle, Search, UserRound, Edit, Trash2, ShieldCheck } from "lucide-react";

// Mock data for users
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Active", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Active", role: "Editor" },
  { id: 3, name: "Robert Johnson", email: "robert@example.com", status: "Inactive", role: "Viewer" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", status: "Active", role: "Editor" },
  { id: 5, name: "Michael Brown", email: "michael@example.com", status: "Pending", role: "Viewer" },
];

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }).optional(),
  status: z.string(),
  role: z.string().optional(),
});

export function UsersList() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "Active",
    },
  });

  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openAddUserDialog = () => {
    form.reset({
      name: "",
      email: "",
      password: "",
      status: "Active",
    });
    setEditingUser(null);
    setIsAddUserOpen(true);
  };

  const openEditUserDialog = (user: any) => {
    form.reset({
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role,
    });
    setEditingUser(user);
    setIsAddUserOpen(true);
  };

  const onSubmit = (data: z.infer<typeof userFormSchema>) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => user.id === editingUser.id ? { ...user, ...data } : user));
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        ...data,
        role: data.role || "Viewer"
      };
      setUsers([...users, newUser]);
    }
    setIsAddUserOpen(false);
  };

  const deleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8 w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={openAddUserDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <UserRound className="h-4 w-4 text-blue-500" />
                    </div>
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.status === "Active" ? "bg-green-100 text-green-700" :
                      user.status === "Inactive" ? "bg-gray-100 text-gray-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {user.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className={`h-3.5 w-3.5 ${
                        user.role === "Admin" ? "text-purple-500" :
                        user.role === "Editor" ? "text-blue-500" :
                        "text-gray-500"
                      }`} />
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditUserDialog(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editingUser && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === "Active"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "Active" : "Inactive");
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active User</FormLabel>
                      <FormDescription>
                        This user will be able to log in and access the system.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{editingUser ? "Update User" : "Add User"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
