
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIModelData } from "@/utils/ai-model-service";
import { Edit, Trash } from "lucide-react";

interface ModelSelectionPanelProps {
  models: AIModelData[];
  selectedModelId: number | null;
  onModelSelect: (modelId: number) => void;
  onEdit?: (model: AIModelData) => void;
  onDelete?: (model: AIModelData) => void;
}

export function ModelSelectionPanel({ 
  models, 
  selectedModelId, 
  onModelSelect,
  onEdit,
  onDelete
}: ModelSelectionPanelProps) {
  if (models.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No AI models configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {models.map((model) => (
        <div
          key={model.id}
          className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted ${
            selectedModelId === model.id ? "border-primary bg-accent" : ""
          }`}
          onClick={() => onModelSelect(model.id!)}
        >
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium truncate">{model.name}</div>
            <div className="flex gap-1 items-center">
              {model.is_default && (
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Default
                </Badge>
              )}
              {model.active === false && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mb-2 flex justify-between">
            <span>{model.provider}</span>
            {model.settings?.model_name && (
              <span className="opacity-70">{model.settings.model_name}</span>
            )}
          </div>
          
          {selectedModelId === model.id && onDelete && (
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
              {onEdit && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(model);
                  }}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(model);
                }}
              >
                <Trash className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
