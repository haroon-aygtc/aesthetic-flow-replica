import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Function to select or deselect all permissions
  const handleSelectAllPermissions = (select: boolean) => {
    const allPermissionIds = permissions.map(permission => permission.id);
    
    if (select) {
      // Select all permissions that aren't already selected
      const permissionsToAdd = allPermissionIds.filter(
        id => !selectedPermissionIds.includes(id)
      );
      
      permissionsToAdd.forEach(id => {
        onPermissionToggle(id, true);
      });
    } else {
      // Deselect all currently selected permissions
      selectedPermissionIds.forEach(id => {
        onPermissionToggle(id, false);
      });
    }
  };

  // Function to select or deselect all permissions in a category
  const handleSelectCategoryPermissions = (category: string, select: boolean) => {
    const categoryPermissionIds = permissionsByCategory[category].map(permission => permission.id);
    
    categoryPermissionIds.forEach(id => {
      const isCurrentlySelected = selectedPermissionIds.includes(id);
      if (select !== isCurrentlySelected) {
        onPermissionToggle(id, select);
      }
    });
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (category: string) => {
    const categoryPermissionIds = permissionsByCategory[category].map(permission => permission.id);
    return categoryPermissionIds.every(id => selectedPermissionIds.includes(id));
  };

  // Check if any permissions in a category are selected
  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermissionIds = permissionsByCategory[category].map(permission => permission.id);
    return categoryPermissionIds.some(id => selectedPermissionIds.includes(id)) 
      && !isCategoryFullySelected(category);
  };

  // Check if all permissions are selected
  const areAllPermissionsSelected = permissions.length > 0 && 
    permissions.every(permission => selectedPermissionIds.includes(permission.id));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Input 
          placeholder="Search permissions..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="ml-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAllPermissions(!areAllPermissionsSelected)}
            className="whitespace-nowrap"
          >
            {areAllPermissionsSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
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

            const isFullySelected = isCategoryFullySelected(category);
            const isPartiallySelected = isCategoryPartiallySelected(category);

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                    {category}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={isFullySelected}
                      data-state={isPartiallySelected ? "indeterminate" : isFullySelected ? "checked" : "unchecked"}
                      onCheckedChange={(checked) => {
                        handleSelectCategoryPermissions(category, checked === true);
                      }}
                    />
                    <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                      {isFullySelected ? "Deselect All" : "Select All"}
                    </label>
                  </div>
                </div>
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
