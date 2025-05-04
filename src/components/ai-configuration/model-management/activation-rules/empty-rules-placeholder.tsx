
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";

interface EmptyRulesPlaceholderProps {
  onCreateRule: () => void;
}

export function EmptyRulesPlaceholder({ onCreateRule }: EmptyRulesPlaceholderProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>No activation rules configured</p>
      <Button variant="outline" className="mt-4" onClick={onCreateRule}>
        <Plus className="h-4 w-4 mr-2" /> Create First Rule
      </Button>
    </div>
  );
}
