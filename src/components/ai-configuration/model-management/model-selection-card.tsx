
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData } from "@/utils/ai-model-service";
import { ModelSelectionItem } from "./model-selection-item";
import { Plus, Settings } from "lucide-react";

interface ModelSelectionCardProps {
  models: AIModelData[];
  selectedModelId: number | null;
  onModelSelect: (modelId: string) => void;
  onAddNewModel: () => void;
  onEditModel: (model: AIModelData) => void;
  isLoading: boolean;
}

export function ModelSelectionCard({
  models,
  selectedModelId,
  onModelSelect,
  onAddNewModel,
  onEditModel,
  isLoading
}: ModelSelectionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Model Selection
          </CardTitle>
          <CardDescription>
            Choose which AI model powers your application
          </CardDescription>
        </div>
        <Button onClick={onAddNewModel}>
          <Plus className="mr-2 h-4 w-4" /> Add Model
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : !models || !Array.isArray(models) ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Error loading AI models</p>
            <Button onClick={onAddNewModel}>
              <Plus className="mr-2 h-4 w-4" /> Add New Model
            </Button>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No AI models configured yet</p>
            <Button onClick={onAddNewModel}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Model
            </Button>
          </div>
        ) : (
          <RadioGroup
            value={selectedModelId ? String(selectedModelId) : ""}
            onValueChange={onModelSelect}
            className="grid gap-4 md:grid-cols-2"
          >
            {models.map((model) => (
              <ModelSelectionItem
                key={model.id}
                model={model}
                isSelected={selectedModelId === model.id}
                onEdit={() => onEditModel(model)}
              />
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  );
}
