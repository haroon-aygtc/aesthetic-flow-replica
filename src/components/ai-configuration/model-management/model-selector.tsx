import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { aiModelService } from "@/utils/ai-model-service";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModelInfo {
  name: string;
  display_name: string;
  description?: string;
  input_token_limit?: number;
  output_token_limit?: number;
  supported_features?: {
    streaming?: boolean;
    vision?: boolean;
  };
}

interface ModelSelectorProps {
  selectedModel: any;
  onModelSelect: (modelName: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelSelect, disabled = false }: ModelSelectorProps) {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedModel?.id) {
      loadAvailableModels(selectedModel.id);
    }
  }, [selectedModel?.id]);

  const loadAvailableModels = async (modelId: number) => {
    setIsLoading(true);
    try {
      const response = await aiModelService.getAvailableModels(modelId);
      if (response.success && response.data) {
        setAvailableModels(response.data);
      } else {
        setAvailableModels([]);
      }
    } catch (error) {
      console.error("Failed to load available models:", error);
      toast({
        title: "Error",
        description: "Failed to load available models. Please try again.",
        variant: "destructive"
      });
      setAvailableModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscoverModels = async () => {
    if (!selectedModel?.id) return;

    setIsDiscovering(true);
    try {
      const response = await aiModelService.discoverModels(selectedModel.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Models discovered successfully."
        });
        // Reload available models
        await loadAvailableModels(selectedModel.id);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to discover models.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to discover models:", error);
      toast({
        title: "Error",
        description: "Failed to discover models. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleModelChange = (modelName: string) => {
    onModelSelect(modelName);
  };

  const currentModelName = selectedModel?.settings?.model_name || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Model Name:</label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDiscoverModels}
          disabled={isDiscovering || disabled || !selectedModel?.id}
        >
          {isDiscovering ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Discover Models
        </Button>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}

        <Select
          value={currentModelName}
          onValueChange={handleModelChange}
          disabled={isLoading || availableModels.length === 0 || disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                {model.display_name || model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableModels.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          No models available. Try discovering models first.
        </p>
      )}

      {currentModelName && availableModels.length > 0 && (
        <div className="text-sm space-y-1">
          <div className="text-muted-foreground">
            {availableModels.find(m => m.name === currentModelName)?.description || ""}
          </div>

          {/* Show model capabilities if available */}
          {(() => {
            const selectedModelInfo = availableModels.find(m => m.name === currentModelName);
            if (selectedModelInfo) {
              return (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedModelInfo.supported_features?.streaming && (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                      Streaming
                    </span>
                  )}
                  {selectedModelInfo.supported_features?.vision && (
                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs">
                      Vision
                    </span>
                  )}
                  {selectedModelInfo.input_token_limit && (
                    <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                      Context: {selectedModelInfo.input_token_limit.toLocaleString()} tokens
                    </span>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
