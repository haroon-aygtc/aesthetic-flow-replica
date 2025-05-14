import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData } from "@/utils/ai-model-service";
import { ModelSelectionItem } from "./model-selection-item";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface ModelSelectionCardProps {
  models: AIModelData[];
  selectedModelId: number | null;
  onModelSelect: (modelId: string) => void;
  onAddNewModel?: () => void;
  onEditModel?: (model: AIModelData) => void;
  onDeleteModel?: (id: number) => void;
  onToggleActive?: (id: number, active: boolean) => void;
  onSetDefault?: (id: number) => void;
  isLoading: boolean;
  useFullPageEditor?: boolean;
}

export function ModelSelectionCard({
  models,
  selectedModelId,
  onModelSelect,
  onAddNewModel,
  onEditModel,
  onDeleteModel,
  onToggleActive,
  onSetDefault,
  isLoading,
  useFullPageEditor = true
}: ModelSelectionCardProps) {
  // No longer needed as we use the renderAddButton function
  // const handleAddNew = () => {
  //   if (useFullPageEditor) {
  //     return;
  //   } else if (onAddNewModel) {
  //     onAddNewModel();
  //   }
  // };

  const handleEdit = (model: AIModelData) => {
    if (!useFullPageEditor && onEditModel) {
      onEditModel(model);
    }
  };

  const renderAddButton = () => {
    if (useFullPageEditor) {
      return (
        <Button asChild>
          <Link to="/dashboard/model-management/new">
            <Plus className="mr-2 h-4 w-4" /> Add Model
          </Link>
        </Button>
      );
    } else {
      return (
        <Button onClick={onAddNewModel}>
          <Plus className="mr-2 h-4 w-4" /> Add Model
        </Button>
      );
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            AI Models
          </CardTitle>
          <CardDescription>
            Choose which AI model powers your application
          </CardDescription>
        </div>
        {renderAddButton()}
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : !models || !Array.isArray(models) ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Error loading AI models</p>
            {useFullPageEditor ? (
              <Button asChild>
                <Link to="/dashboard/model-management/new">
                  <Plus className="mr-2 h-4 w-4" /> Add New Model
                </Link>
              </Button>
            ) : (
              <Button onClick={onAddNewModel}>
                <Plus className="mr-2 h-4 w-4" /> Add New Model
              </Button>
            )}
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No AI models configured yet</p>
            {useFullPageEditor ? (
              <Button asChild>
                <Link to="/dashboard/model-management/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Model
                </Link>
              </Button>
            ) : (
              <Button onClick={onAddNewModel}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Model
              </Button>
            )}
          </div>
        ) : (
          <RadioGroup
            value={selectedModelId ? String(selectedModelId) : "none"}
            onValueChange={onModelSelect}
            className="grid gap-6 md:grid-cols-2"
          >
            <ModelSelectionItem
              key="none"
              model={{ id: null, name: "None", provider: "None", description: "No AI model will be used" }}
              isSelected={selectedModelId === null}
              useFullPageEditor={useFullPageEditor}
              onEdit={() => {}}
            />
            {models.map((model) => (
              <ModelSelectionItem
                key={model.id}
                model={model}
                isSelected={selectedModelId === model.id}
                useFullPageEditor={useFullPageEditor}
                onEdit={() => handleEdit(model)}
                onDelete={onDeleteModel}
                onToggleActive={onToggleActive}
                onSetDefault={onSetDefault}
              />
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  );
}
