
import { Button } from "@/components/ui/button";

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
}

interface PermissionListByCategoryProps {
  permissionsByCategory: Record<string, Permission[]>;
}

export function PermissionListByCategory({ permissionsByCategory }: PermissionListByCategoryProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Assigned Permissions</h3>
      
      {Object.entries(permissionsByCategory).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, permissions]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="bg-muted/50 p-2 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{permission.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        permission.type === 'read' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                          : permission.type === 'write' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {permission.type}
                      </span>
                    </div>
                    {permission.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {permission.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-muted/50 rounded-md">
          <p className="text-muted-foreground">No permissions assigned to this role</p>
          <Button className="mt-4" variant="outline" asChild>
            <a href="#role-permissions">Assign Permissions</a>
          </Button>
        </div>
      )}
    </div>
  );
}
