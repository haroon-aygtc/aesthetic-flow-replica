
import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Pencil, Trash, UserPlus } from "lucide-react";
import { userService, roleService } from "@/utils/api";

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

interface Role {
  id: number;
  name: string;
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignRolesDialogOpen, setIsAssignRolesDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (error: any) {
      console.error("Failed to fetch roles:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load roles",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    try {
      await userService.createUser(newUser);
      setIsAddDialogOpen(false);
      setNewUser({ name: "", email: "", password: "", status: "active" });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    const userUpdate = {
      name: editingUser.name,
      email: editingUser.email,
      status: editingUser.status,
    };

    try {
      await userService.updateUser(editingUser.id, userUpdate);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!editingUser) return;

    try {
      await userService.deleteUser(editingUser.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleAssignRoles = async () => {
    if (!editingUser) return;

    try {
      await userService.assignRoles(editingUser.id, selectedRoles);
      setIsAssignRolesDialogOpen(false);
      toast({
        title: "Success",
        description: "Roles assigned successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign roles",
        variant: "destructive",
      });
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prevRoles =>
      prevRoles.includes(roleId)
        ? prevRoles.filter(id => id !== roleId)
        : [...prevRoles, roleId]
    );
  };

  const fetchUserRoles = async (userId: number) => {
    try {
      const response = await userService.getUser(userId);
      const userRoles = response.data.roles || [];
      setSelectedRoles(userRoles.map((role: Role) => role.id));
    } catch (error: any) {
      console.error("Failed to fetch user roles:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load user roles",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Users</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newUser.status}
                  onValueChange={(value) => setNewUser({...newUser, status: value})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{user.created_at ? formatDate(user.created_at) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (open) setEditingUser(user);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          {editingUser && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingUser.name}
                                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editingUser.email}
                                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                  value={editingUser.status}
                                  onValueChange={(value) => setEditingUser({...editingUser, status: value})}
                                >
                                  <SelectTrigger id="edit-status">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditUser}>Update User</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingUser(user);
                          fetchUserRoles(user.id);
                          setIsAssignRolesDialogOpen(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                      </Button>

                      <Dialog open={isDeleteDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open);
                        if (open) setEditingUser(user);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete User</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Are you sure you want to delete user "{editingUser?.name}"?</p>
                            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Assign Roles Dialog */}
      <Dialog open={isAssignRolesDialogOpen} onOpenChange={setIsAssignRolesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Roles to {editingUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {roles.length > 0 ? (
                roles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`role-${role.id}`} className="text-sm font-medium">
                      {role.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No roles available</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignRolesDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignRoles}>Save Assignments</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
