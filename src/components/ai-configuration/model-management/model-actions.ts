import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for AI model management actions
 * Provides functions for model selection, configuration, and testing
 */
export const useModelActions = () => {
  const { toast } = useToast();

  /**
   * Handle model selection and update UI state
   */
  const handleModelSelect = (
    modelId: string,
    models: AIModelData[] | null | undefined,
    setSelectedModelId: (id: number) => void,
    setSelectedModel: (model: AIModelData | null) => void,
    setTemperature: (temp: number[]) => void,
    setMaxTokens: (tokens: number[]) => void,
    setApiKey: (key: string) => void,
    setIsAPIKeyValid: (valid: boolean | null) => void
  ) => {
    const id = Number(modelId);
    setSelectedModelId(id);

    // Check if models is an array before using find
    if (!models || !Array.isArray(models)) {
      console.error("Models is not an array:", models);
      toast({
        title: "Error",
        description: "Cannot select model: Invalid models data",
        variant: "destructive"
      });
      return;
    }

    const model = models.find(m => m.id === id);
    if (model) {
      setSelectedModel(model);

      // Update UI state based on model settings
      if (model.settings) {
        // Set temperature with fallback to default
        setTemperature([model.settings.temperature ?? 0.7]);

        // Set max tokens with fallback to default
        setMaxTokens([model.settings.max_tokens ?? 2048]);
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

  /**
   * Handle API key save
   * Updates the API key for the selected model
   */
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

  /**
   * Handle configuration save
   * Updates the model settings (temperature, max tokens)
   */
  const handleSaveConfiguration = async (
    selectedModel: AIModelData | null,
    selectedModelId: number | null,
    temperature: number[],
    maxTokens: number[],
    setModels: (models: AIModelData[]) => void,
    models: AIModelData[] | null | undefined,
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

      // Update local state if models is an array
      if (models && Array.isArray(models)) {
        const updatedModels = models.map(model =>
          model.id === selectedModelId
            ? { ...model, settings }
            : model
        );
        setModels(updatedModels);
      } else {
        // Refresh models from API if local state is invalid
        const refreshedModels = await aiModelService.getModels();
        if (refreshedModels && Array.isArray(refreshedModels)) {
          setModels(refreshedModels);
        }
      }
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

  /**
   * Handle connection test
   * Tests the connection to the AI provider using the model's API key
   */
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

  /**
   * Handle template selection
   * Associates a prompt template with the selected model
   */
  const handleTemplateSelect = async (
    selectedModelId: number | null,
    templateId: string | null,
    setModels: (models: AIModelData[]) => void,
    models: AIModelData[]
  ) => {
    if (!selectedModelId) {
      toast({
        title: "Error",
        description: "Please select a model first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call API to associate template with model
      await aiModelService.assignTemplate(selectedModelId, templateId);

      // Update local state
      const updatedModels = models.map(model => {
        if (model.id === selectedModelId) {
          return {
            ...model,
            settings: {
              ...model.settings,
              template_id: templateId
            }
          };
        }
        return model;
      });

      setModels(updatedModels);

      toast({
        title: templateId ? "Template Associated" : "Template Removed",
        description: templateId
          ? "The prompt template has been associated with this model."
          : "The prompt template has been removed from this model."
      });
    } catch (error: any) {
      toast({
        title: "Template Association Failed",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  /**
   * Handle creating a new template
   * Navigates to the templates page
   */
  const handleCreateTemplate = () => {
    // Navigate to templates page
    window.location.href = "/dashboard/templates";
  };

  /**
   * Handle model dialog form submission
   * Creates a new model or updates an existing one
   */
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

  /**
   * Handle opening the test chat dialog
   * Validates that a model is selected before opening
   */
  const handleOpenTestChat = (
    selectedModel: AIModelData | null,
    selectedModelId: number | null,
    setIsTestChatOpen: (open: boolean) => void
  ) => {
    if (!selectedModel || !selectedModelId) {
      toast({
        title: "Error",
        description: "Please select a model first",
        variant: "destructive"
      });
      return;
    }

    setIsTestChatOpen(true);
  };

  return {
    handleModelSelect,
    handleAPIKeySave,
    handleSaveConfiguration,
    handleTestConnection,
    handleModelDialogSubmit,
    handleTemplateSelect,
    handleCreateTemplate,
    handleOpenTestChat
  };
};
