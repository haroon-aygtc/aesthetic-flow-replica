
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { useToast } from "@/hooks/use-toast";

export const useModelActions = () => {
  const { toast } = useToast();

  // Handle model selection
  const handleModelSelect = (
    modelId: string,
    models: AIModelData[],
    setSelectedModelId: (id: number) => void,
    setSelectedModel: (model: AIModelData | null) => void,
    setTemperature: (temp: number[]) => void,
    setMaxTokens: (tokens: number[]) => void,
    setApiKey: (key: string) => void,
    setIsAPIKeyValid: (valid: boolean | null) => void
  ) => {
    const id = Number(modelId);
    setSelectedModelId(id);
    
    const model = models.find(m => m.id === id);
    if (model) {
      setSelectedModel(model);
      
      // Update UI state based on model settings
      if (model.settings) {
        if (model.settings.temperature !== undefined) {
          setTemperature([model.settings.temperature]);
        } else {
          setTemperature([0.7]); // Default value
        }
        
        if (model.settings.max_tokens !== undefined) {
          setMaxTokens([model.settings.max_tokens]);
        } else {
          setMaxTokens([2048]); // Default value
        }
      }
      
      // Update API key field
      if (model.api_key) {
        setApiKey("••••••••••••••••");
        setIsAPIKeyValid(true);
      } else {
        setApiKey("");
        setIsAPIKeyValid(null);
      }
    }
  };

  // Handle API key save
  const handleAPIKeySave = async (
    selectedModel: AIModelData | null,
    selectedModelId: number | null,
    apiKey: string,
    setIsAPIKeyValid: (valid: boolean | null) => void,
    setIsSaving: (saving: boolean) => void
  ) => {
    if (!selectedModel || !selectedModelId) {
      toast({
        title: "Error",
        description: "Please select a model first",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await aiModelService.updateModel(selectedModelId, { api_key: apiKey });
      setIsAPIKeyValid(true);
      toast({
        title: "API Key Updated",
        description: "Your API key has been saved successfully."
      });
    } catch (error: any) {
      setIsAPIKeyValid(false);
      toast({
        title: "Failed to Update API Key",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle configuration save
  const handleSaveConfiguration = async (
    selectedModel: AIModelData | null,
    selectedModelId: number | null,
    temperature: number[],
    maxTokens: number[],
    setModels: (models: AIModelData[]) => void,
    models: AIModelData[],
    setIsSaving: (saving: boolean) => void
  ) => {
    if (!selectedModel || !selectedModelId) {
      toast({
        title: "Error",
        description: "Please select a model first",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const settings = {
        ...selectedModel.settings,
        temperature: temperature[0],
        max_tokens: maxTokens[0]
      };
      
      await aiModelService.updateModel(selectedModelId, { settings });
      toast({
        title: "Configuration Saved",
        description: "Model settings have been updated successfully."
      });
      
      // Update local state
      const updatedModels = models.map(model => 
        model.id === selectedModelId 
          ? { ...model, settings } 
          : model
      );
      setModels(updatedModels);
    } catch (error: any) {
      toast({
        title: "Failed to Save Configuration",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle connection test
  const handleTestConnection = async (
    selectedModel: AIModelData | null,
    selectedModelId: number | null,
    setIsTesting: (testing: boolean) => void
  ) => {
    if (!selectedModel || !selectedModelId) {
      toast({
        title: "Error",
        description: "Please select a model first",
        variant: "destructive"
      });
      return;
    }
    
    setIsTesting(true);
    try {
      const result = await aiModelService.testConnection(selectedModelId);
      if (result.success) {
        toast({
          title: "Connection Test Successful",
          description: result.message || "The connection to the AI provider was successful."
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: result.message || "Failed to connect to the AI provider.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Test Failed",
        description: error.response?.data?.message || "An error occurred while testing the connection",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Handle dialog operations
  const handleModelDialogSubmit = async (
    formData: AIModelData,
    editingModel: AIModelData | null,
    fetchModels: () => Promise<void>,
    setIsDialogOpen: (open: boolean) => void,
    setIsSaving: (saving: boolean) => void
  ) => {
    setIsSaving(true);
    try {
      if (editingModel) {
        // Update existing model
        await aiModelService.updateModel(editingModel.id!, formData);
        toast({
          title: "Model Updated",
          description: "The AI model was updated successfully."
        });
      } else {
        // Create new model
        await aiModelService.createModel(formData);
        toast({
          title: "Model Created",
          description: "New AI model was created successfully."
        });
      }
      
      // Refresh models and close dialog
      await fetchModels();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleModelSelect,
    handleAPIKeySave,
    handleSaveConfiguration,
    handleTestConnection,
    handleModelDialogSubmit
  };
};
