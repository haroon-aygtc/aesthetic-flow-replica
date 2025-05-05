
import { Button } from "@/components/ui/button";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AIModelData } from "@/utils/ai-model-service";

interface ModelSelectionItemProps {
  model: AIModelData;
  isSelected: boolean;
  onEdit: () => void;
}

export function ModelSelectionItem({ model, isSelected, onEdit }: ModelSelectionItemProps) {
  return (
    <div className="relative">
      <RadioGroupItem
        value={String(model.id)}
        id={`model-${model.id}`}
        className="peer sr-only"
      />
      <Label
        htmlFor={`model-${model.id}`}
        className="flex flex-col h-full p-4 border rounded-md cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{model.name}</span>
          <span className="text-xs bg-secondary px-2 py-1 rounded-full">{model.provider}</span>
        </div>
        <p className="text-sm text-muted-foreground">{model.description}</p>
        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
          <span>Max Tokens: {model.settings?.max_tokens || "Default"}</span>
          {model.is_default && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
          )}
        </div>
        {isSelected && (
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
        )}
      </Label>
    </div>
  );
}
