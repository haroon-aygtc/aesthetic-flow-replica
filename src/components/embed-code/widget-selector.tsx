
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Widget {
  id: string;
  name: string;
}

interface WidgetSelectorProps {
  widgets: Widget[];
  selectedWidget: string;
  onWidgetChange: (widgetId: string) => void;
}

export function WidgetSelector({ widgets, selectedWidget, onWidgetChange }: WidgetSelectorProps) {
  return (
    <div className="grid gap-2">
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
