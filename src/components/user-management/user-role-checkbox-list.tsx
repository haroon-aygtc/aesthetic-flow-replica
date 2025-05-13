import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface RoleCheckboxListProps {
  roles: Role[];
  selectedRoles: number[];
  onRoleToggle: (roleId: number) => void;
}

export function RoleCheckboxList({
  roles,
  selectedRoles,
  onRoleToggle
}: RoleCheckboxListProps) {
  // Check if all roles are selected
  const areAllRolesSelected = roles.length > 0 && roles.every(role => selectedRoles.includes(role.id));
  
  // Function to select or deselect all roles
  const handleSelectAllRoles = () => {
    const shouldSelect = !areAllRolesSelected;
    
    roles.forEach(role => {
      const isCurrentlySelected = selectedRoles.includes(role.id);
      if (shouldSelect !== isCurrentlySelected) {
        onRoleToggle(role.id);
      }
    });
  };
  
  return (
    <div className="border rounded-md p-4 space-y-4">
      {roles.length > 0 && (
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAllRoles}
            className="text-xs"
          >
            {areAllRolesSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
      )}
      
      {roles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No roles available</p>
      ) : (
        roles.map((role) => (
          <div key={role.id} className="flex items-center space-x-2">
            <Checkbox
              id={`role-${role.id}`}
              checked={selectedRoles.includes(role.id)}
              onCheckedChange={() => onRoleToggle(role.id)}
            />
            <label
              htmlFor={`role-${role.id}`}
              className="text-sm font-medium cursor-pointer"
            >
              {role.name}
              {role.description && (
                <span className="ml-2 text-xs text-muted-foreground">
                  - {role.description}
                </span>
              )}
            </label>
          </div>
        ))
      )}
    </div>
  );
}
