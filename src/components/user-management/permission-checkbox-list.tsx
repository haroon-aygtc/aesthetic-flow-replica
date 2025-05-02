
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
}

interface PermissionCheckboxListProps {
  permissions: Permission[];
  selectedPermissionIds: number[];
  onPermissionToggle: (permissionId: number, isChecked: boolean) => void;
}

export function PermissionCheckboxList({
  permissions,
  selectedPermissionIds,
  onPermissionToggle,
}: PermissionCheckboxListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  
  // Group permissions by category
  useEffect(() => {
    const filteredPermissions = permissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (permission.description &&
          permission.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        permission.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const grouped = filteredPermissions.reduce<Record<string, Permission[]>>(
      (acc, permission) => {
        const category = permission.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
      },
      {}
    );
    
    setGroupedPermissions(grouped);
  }, [permissions, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search permissions..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">{category}</h3>
            <div className="space-y-2">
              {categoryPermissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissionIds.includes(permission.id)}
                    onCheckedChange={(checked) => {
                      onPermissionToggle(permission.id, checked === true);
                    }}
                  />
                  <div>
                    <Label htmlFor={`permission-${permission.id}`} className="font-medium">
                      {permission.name}
                    </Label>
                    {permission.description && (
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ml-auto ${
                    permission.type === 'read' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                      : permission.type === 'write' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {permission.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(groupedPermissions).length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No permissions found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
