
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

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
  return (
    <div className="border rounded-md p-4 space-y-2">
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
