
import { useState } from "react";
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Search, Edit, Trash2, Key, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mock data for permissions
const mockPermissions = [
  { id: 1, name: "view:users", description: "Can view user list", category: "Users", type: "read" },
  { id: 2, name: "create:users", description: "Can create new users", category: "Users", type: "write" },
  { id: 3, name: "edit:users", description: "Can edit user details", category: "Users", type: "write" },
  { id: 4, name: "delete:users", description: "Can delete users", category: "Users", type: "delete" },
  { id: 5, name: "view:content", description: "Can view content", category: "Content", type: "read" },
  { id: 6, name: "edit:content", description: "Can edit content", category: "Content", type: "write" },
  { id: 7, name: "view:settings", description: "Can view system settings", category: "Settings", type: "read" },
  { id: 8, name: "edit:settings", description: "Can modify system settings", category: "Settings", type: "write" },
];

const permissionFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  type: z.enum(["read", "write", "delete"]),
});

export function PermissionsList() {
  const [permissions, setPermissions] = useState(mockPermissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPermissionOpen, setIsAddPermissionOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Users": true,
    "Content": true,
    "Settings": true
  });
  
  const form = useForm<z.infer<typeof permissionFormSchema>>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      type: "read",
    },
  });

  const filteredPermissions = permissions.filter(permission => {
    return permission.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (permission.description && permission.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
           permission.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group permissions by category
  const permissionsByCategory = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof mockPermissions>);

  const openAddPermissionDialog = () => {
    form.reset({
      name: "",
      description: "",
      category: "",
      type: "read",
    });
    setEditingPermission(null);
    setIsAddPermissionOpen(true);
  };

  const openEditPermissionDialog = (permission: any) => {
    form.reset({
      name: permission.name,
      description: permission.description,
      category: permission.category,
      type: permission.type,
    });
    setEditingPermission(permission);
    setIsAddPermissionOpen(true);
  };

  const onSubmit = (data: z.infer<typeof permissionFormSchema>) => {
    if (editingPermission) {
      // Update existing permission
      setPermissions(permissions.map(permission => 
        permission.id === editingPermission.id ? { ...permission, ...data } : permission
      ));
    } else {
      // Add new permission
      const newPermission = {
        id: permissions.length + 1,
        ...data,
      };
      setPermissions([...permissions, newPermission]);
    }
    setIsAddPermissionOpen(false);
  };

  const deletePermission = (permissionId: number) => {
    setPermissions(permissions.filter(permission => permission.id !== permissionId));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            className="pl-8 w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={openAddPermissionDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </div>

      {Object.keys(permissionsByCategory).length === 0 ? (
        <div className="rounded-md border py-8 text-center text-muted-foreground">
          No permissions found
        </div>
      ) : (
        Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
          <Collapsible 
            key={category}
            open={expandedCategories[category]} 
            onOpenChange={() => toggleCategory(category)}
            className="rounded-md border mb-4"
          >
            <CollapsibleTrigger className="flex justify-between items-center w-full px-4 py-3 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{category}</span>
                <Badge variant="outline" className="ml-2">{categoryPermissions.length}</Badge>
              </div>
              <div>
                {expandedCategories[category] ? "▼" : "►"}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="flex items-center gap-2 font-mono text-sm">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                            <Key className="h-4 w-4 text-amber-500" />
                          </div>
                          {permission.name}
                        </TableCell>
                        <TableCell>{permission.description}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={permission.type === "read" ? "secondary" : 
                                   permission.type === "write" ? "default" : 
                                   "destructive"}
                            className="capitalize"
                          >
                            {permission.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditPermissionDialog(permission)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deletePermission(permission.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))
      )}

      <Dialog open={isAddPermissionOpen} onOpenChange={setIsAddPermissionOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? "Edit Permission" : "Add New Permission"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="action:resource (e.g. view:users)" {...field} />
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
                        placeholder="Describe what this permission allows" 
                        className="resize-none h-20" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Group this permission under a category" 
                        {...field} 
                        list="categories"
                      />
                    </FormControl>
                    <datalist id="categories">
                      {Array.from(new Set(permissions.map(p => p.category))).map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Permission Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="read" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Read (view only access)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="write" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Write (create and update)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="delete" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Delete (permanently remove)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {editingPermission ? "Update Permission" : "Add Permission"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
