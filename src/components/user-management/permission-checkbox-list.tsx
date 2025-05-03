
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [searchTerm, setSearchTerm] = useState("");

  // Group permissions by category
  const permissionsByCategory = permissions.reduce<Record<string, Permission[]>>(
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

  // Filter permissions based on search term
  const filteredCategories = Object.keys(permissionsByCategory).filter((category) => {
    if (!searchTerm) return true;
    
    // Check if category matches search
    if (category.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    
    // Check if any permission in category matches search
    return permissionsByCategory[category].some((permission) => 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "read":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "write":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Input 
          placeholder="Search permissions..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="max-h-[400px] overflow-y-auto pr-1 space-y-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const categoryPermissions = permissionsByCategory[category].filter((permission) => {
              if (!searchTerm) return true;
              return (
                permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
              );
            });

            if (categoryPermissions.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2 rounded-md border p-2">
                      <input
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={(e) => onPermissionToggle(permission.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <label htmlFor={`permission-${permission.id}`} className="text-sm font-medium cursor-pointer flex items-center justify-between">
                          <span>{permission.name}</span>
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", getBadgeColor(permission.type))}>
                            {permission.type}
                          </span>
                        </label>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{permission.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No permissions found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
