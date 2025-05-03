
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
}

interface PermissionSummaryCardProps {
  permissionsByCategory: Record<string, Permission[]>;
}

export function PermissionSummaryCard({ permissionsByCategory }: PermissionSummaryCardProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <h3 className="font-medium mb-2">Permission Summary</h3>
        <div className="space-y-2">
          {Object.entries(permissionsByCategory).map(([category, _]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-sm">{category}</span>
              <Badge variant="outline">
                {permissionsByCategory[category].length} permissions
              </Badge>
            </div>
          ))}
          {Object.keys(permissionsByCategory).length === 0 && (
            <p className="text-sm text-muted-foreground">No permissions assigned</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
