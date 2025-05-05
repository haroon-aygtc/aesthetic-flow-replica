
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleId: number | null;
  onRoleChange: (roleId: string) => void;
  isLoading: boolean;
}

export function RoleSelector({ roles, selectedRoleId, onRoleChange, isLoading }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="role-select" className="text-sm font-medium">
        Select Role
      </label>
      <Select
        value={selectedRoleId?.toString() || ""}
        onValueChange={onRoleChange}
        disabled={isLoading || roles.length === 0}
      >
        <SelectTrigger id="role-select" className="w-full sm:w-[300px]">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
