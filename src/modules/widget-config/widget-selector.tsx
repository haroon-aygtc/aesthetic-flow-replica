
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface Widget {
  id: string;
  name: string;
}

interface WidgetSelectorProps {
  widgets: Widget[];
  selectedWidget: string;
  onWidgetChange: (widgetId: string) => void;
  isLoading?: boolean;
}

export function WidgetSelector({ widgets, selectedWidget, onWidgetChange, isLoading = false }: WidgetSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 h-10">
        <Spinner size="sm" />
        <span className="text-sm">Loading widgets...</span>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No widgets found. Please create a new widget to get started.
      </div>
    );
  }

  return (
    <div className="w-[250px]">
      <Select value={selectedWidget} onValueChange={onWidgetChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a widget" />
        </SelectTrigger>
        <SelectContent>
          {widgets.map((widget) => (
            <SelectItem key={widget.id} value={widget.id}>
              {widget.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
