import { Button } from "@/components/ui/button";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AIModelData } from "@/utils/ai-model-service";
import { Link } from "react-router-dom";

interface ModelSelectionItemProps {
  model: AIModelData;
  isSelected: boolean;
  onEdit: () => void;
  useFullPageEditor?: boolean;
}

export function ModelSelectionItem({ 
  model, 
  isSelected, 
  onEdit,
  useFullPageEditor = false
}: ModelSelectionItemProps) {
  // Only render edit button for models with valid IDs (not the "None" option)
  const shouldRenderEditButton = isSelected && model.id !== null;
  
  // Render the appropriate edit button based on the useFullPageEditor flag
  const renderEditButton = () => {
    if (!shouldRenderEditButton) return null;
    
    if (useFullPageEditor) {
      return (
        <Button
          size="sm"
          variant="outline"
          asChild
          className="absolute top-2 right-2 z-10"
        >
          <Link 
            to={`/dashboard/model-management/edit/${model.id}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Edit
          </Link>
        </Button>
      );
    } else {
      return (
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
      );
    }
  };

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
        <div className="flex flex-col gap-1 mt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Model: {model.settings?.model_name || "Default"}</span>
            <span>Temp: {model.settings?.temperature || "0.7"}</span>
          </div>
          <div className="flex justify-between">
            <span>Max Tokens: {model.settings?.max_tokens || "Default"}</span>
            {model.is_default && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
            )}
          </div>
          {!model.active && (
            <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full self-start mt-1">Inactive</span>
          )}
        </div>
        {renderEditButton()}
      </Label>
    </div>
  );
}
