
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { AIModelDialog } from "./model-management/ai-model-dialog";
import { ModelSelectionCard } from "./model-management/model-selection-card";
import { ApiKeyCard } from "./model-management/api-key-card";
import { ConfigParametersCard } from "./model-management/config-parameters-card";

export function AIModelManager() {
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

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
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
  const handleAPIKeySave = async () => {
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
  const handleSaveConfiguration = async () => {
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
  const handleTestConnection = async () => {
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

  // Handle adding new model
  const handleAddNewModel = () => {
    setEditingModel(null);
    setIsDialogOpen(true);
  };

  // Handle editing model
  const handleEditModel = (model: AIModelData) => {
    setEditingModel(model);
    setIsDialogOpen(true);
  };

  // Handle model dialog submit
  const handleModelDialogSubmit = async (formData: AIModelData) => {
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

  return (
    <div className="space-y-6">
      {/* Model Selection Card */}
      <ModelSelectionCard 
        models={models}
        selectedModelId={selectedModelId}
        onModelSelect={handleModelSelect}
        onAddNewModel={handleAddNewModel}
        onEditModel={handleEditModel}
        isLoading={isLoading}
      />
      
      {/* Only show configuration cards if a model is selected */}
      {selectedModel && (
        <div className="grid gap-6 md:grid-cols-2">
          <ApiKeyCard 
            selectedModel={selectedModel}
            apiKey={apiKey}
            isAPIKeyValid={isAPIKeyValid}
            isSaving={isSaving}
            isTesting={isTesting}
            onApiKeyChange={setApiKey}
            onApiKeySave={handleAPIKeySave}
            onTestConnection={handleTestConnection}
          />

          <ConfigParametersCard 
            selectedModel={selectedModel}
            temperature={temperature}
            maxTokens={maxTokens}
            isSaving={isSaving}
            onTemperatureChange={setTemperature}
            onMaxTokensChange={setMaxTokens}
            onSaveConfiguration={handleSaveConfiguration}
          />
        </div>
      )}
      
      {/* Model Dialog */}
      <AIModelDialog
        model={editingModel || undefined}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleModelDialogSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}
