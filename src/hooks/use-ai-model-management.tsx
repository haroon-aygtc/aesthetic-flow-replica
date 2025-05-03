
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";

export function useAIModelManagement() {
  const { toast } = useToast();
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number[]>([0.7]);
  const [maxTokens, setMaxTokens] = useState<number[]>([2048]);
  const [apiKey, setApiKey] = useState<string>("");
  const [isAPIKeyValid, setIsAPIKeyValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [models, setModels] = useState<AIModelData[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModelData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingModel, setEditingModel] = useState<AIModelData | null>(null);

  // Fetch models on mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Fetch models from API
  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const data = await aiModelService.getAllModels();
      setModels(data);
      
      // Select default model if available
      const defaultModel = data.find(model => model.is_default);
      if (defaultModel) {
        setSelectedModelId(defaultModel.id!);
        setSelectedModel(defaultModel);
        
        // Set UI state based on model settings
        if (defaultModel.settings) {
          if (defaultModel.settings.temperature !== undefined) {
            setTemperature([defaultModel.settings.temperature]);
          }
          if (defaultModel.settings.max_tokens !== undefined) {
            setMaxTokens([defaultModel.settings.max_tokens]);
          }
        }
        
        // Set API key if available
        if (defaultModel.api_key) {
          setApiKey("••••••••••••••••");
          setIsAPIKeyValid(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch AI models",
        variant: "destructive"
      });
      console.error("Failed to fetch AI models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedModelId,
    setSelectedModelId,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    apiKey,
    setApiKey,
    isAPIKeyValid,
    setIsAPIKeyValid,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isTesting,
    setIsTesting,
    models,
    setModels,
    selectedModel,
    setSelectedModel,
    isDialogOpen,
    setIsDialogOpen,
    editingModel,
    setEditingModel,
    fetchModels
  };
}
