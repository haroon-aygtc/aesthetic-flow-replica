import { useAIModelManagement } from "@/hooks/use-ai-model-management";
import { useModelActions } from "./model-management/model-actions";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { AIModelDialog } from "./model-management/ai-model-dialog";
import { ModelSelectionCard } from "./model-management/model-selection-card";
import { ApiKeyCard } from "./model-management/api-key-card";
import { ConfigParametersCard } from "./model-management/config-parameters-card";
import { ModelFallbackCard } from "./model-management/model-fallback-card";
import { ModelAnalyticsCard } from "./model-management/model-analytics-card";
import { ModelTestChatDialog } from "./model-management/model-test-chat-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Settings, History, BarChart } from "lucide-react";

interface AIModelManagerProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AIModelManager({ initialTab = "basic", onTabChange }: AIModelManagerProps = {}) {
  const { toast } = useToast();
  const {
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
    isTestChatOpen,
    setIsTestChatOpen,
    editingModel,
    setEditingModel,
    fetchModels
  } = useAIModelManagement();

  const {
    handleModelSelect,
    handleAPIKeySave,
    handleSaveConfiguration,
    handleTestConnection,
    handleModelDialogSubmit,
    handleOpenTestChat
  } = useModelActions();

  // Handle model selection
  const onModelSelect = (modelId: string) => {
    handleModelSelect(
      modelId,
      models,
      setSelectedModelId,
      setSelectedModel,
      setTemperature,
      setMaxTokens,
      setApiKey,
      setIsAPIKeyValid
    );
  };

  // Handle API key save
  const onApiKeySave = async () => {
    await handleAPIKeySave(
      selectedModel,
      selectedModelId,
      apiKey,
      setIsAPIKeyValid,
      setIsSaving
    );
  };

  // Handle configuration save
  const onSaveConfiguration = async () => {
    await handleSaveConfiguration(
      selectedModel,
      selectedModelId,
      temperature,
      maxTokens,
      setModels,
      models,
      setIsSaving
    );
  };

  // Handle model name change
  const onModelNameChange = (modelName: string) => {
    if (!selectedModel) return;

    // Update the model settings with the new model name
    const updatedSettings = {
      ...selectedModel.settings,
      model_name: modelName
    };

    // Update the selected model
    const updatedModel = {
      ...selectedModel,
      settings: updatedSettings
    };

    setSelectedModel(updatedModel);
  };

  // Handle connection test
  const onTestConnection = async () => {
    try {
      await handleTestConnection(
        selectedModel,
        selectedModelId,
        setIsTesting
      );

      // Return the expected format for ApiKeyCard
      return {
        data: {
          message: "Connection successful"
        }
      };
    } catch (error: any) {
      // Re-throw the error so ApiKeyCard can handle it
      throw error;
    }
  };

  // Handle opening test chat dialog
  const onOpenTestChat = () => {
    handleOpenTestChat(
      selectedModel,
      selectedModelId,
      setIsTestChatOpen
    );
  };

  // Handle adding new model - with support for both dialog and full-page approaches
  const onAddNewModel = () => {
    // The dialog approach is only used as a fallback if useFullPageEditor is false
    // The Button in ModelSelectionCard will use Link directly to the new page if useFullPageEditor is true
    setEditingModel(null);
    setIsDialogOpen(true);
  };

  // Handle editing model - with support for both dialog and full-page approaches
  const onEditModel = (model: AIModelData) => {
    // The dialog approach is only used as a fallback if useFullPageEditor is false
    // The Button in ModelSelectionCard will use Link directly to the edit page if useFullPageEditor is true
    setEditingModel(model);
    setIsDialogOpen(true);
  };

  // Handle deleting a model
  const onDeleteModel = async (id: number) => {
    try {
      setIsSaving(true);
      await aiModelService.deleteModel(id);

      // Update the models list
      setModels(models.filter(model => model.id !== id));

      // If the deleted model was selected, reset selection
      if (selectedModelId === id) {
        setSelectedModelId(null);
        setSelectedModel(null);
      }

      toast({
        title: "Model Deleted",
        description: "The AI model was deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete model",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggling model activation
  const onToggleActive = async (id: number, active: boolean) => {
    try {
      setIsSaving(true);
      const updatedModel = await aiModelService.toggleModelActivation(id, active);

      // Update the models list
      setModels(models.map(model =>
        model.id === id ? { ...model, active: updatedModel.active } : model
      ));

      // If this is the selected model, update it
      if (selectedModelId === id) {
        setSelectedModel(updatedModel);
      }

      toast({
        title: active ? "Model Activated" : "Model Deactivated",
        description: `The model has been ${active ? 'activated' : 'deactivated'} successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update model status",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle model dialog submit
  const onModelDialogSubmit = async (formData: AIModelData) => {
    await handleModelDialogSubmit(
      formData,
      editingModel,
      fetchModels,
      setIsDialogOpen,
      setIsSaving
    );
  };

  // Handle model update
  const onUpdateModel = (updatedModel: AIModelData) => {
    setSelectedModel(updatedModel);
    // Also update in the models array if it exists and is an array
    if (models && Array.isArray(models)) {
      setModels(models.map(model =>
        model.id === updatedModel.id ? updatedModel : model
      ));
    }
  };

  // Handle setting a model as default
  const onSetDefault = async (id: number) => {
    try {
      setIsSaving(true);
      await aiModelService.setDefaultModel(id);

      // Update the models list to reflect the change
      setModels(models.map(model => ({
        ...model,
        is_default: model.id === id
      })));

      toast({
        title: "Default Model Updated",
        description: "The default AI model has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set default model",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Selection Card */}
      <div>
        <ModelSelectionCard
          models={models}
          selectedModelId={selectedModelId}
          onModelSelect={onModelSelect}
          onAddNewModel={onAddNewModel}
          onEditModel={onEditModel}
          onDeleteModel={onDeleteModel}
          onToggleActive={onToggleActive}
          onSetDefault={onSetDefault}
          isLoading={isLoading}
          useFullPageEditor={true}
        />
      </div>

      {/* Only show configuration cards if a model is selected */}
      {selectedModel && (
        <Tabs
          defaultValue="basic"
          value={initialTab}
          onValueChange={(value) => {
            // Refresh data when tab changes
            if (value === "analytics" && selectedModelId) {
              // You could add analytics refresh logic here if needed
            }
            onTabChange?.(value);
          }}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Basic Settings
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Advanced Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="grid gap-6 md:grid-cols-2">
              <ApiKeyCard
                selectedModel={selectedModel}
                apiKey={apiKey}
                isAPIKeyValid={isAPIKeyValid}
                isSaving={isSaving}
                isTesting={isTesting}
                onApiKeyChange={setApiKey}
                onApiKeySave={onApiKeySave}
                onTestConnection={onTestConnection}
              />

              <ConfigParametersCard
                temperature={temperature}
                maxTokens={maxTokens}
                isSaving={isSaving}
                selectedModel={selectedModel}
                onTemperatureChange={setTemperature}
                onMaxTokensChange={setMaxTokens}
                onSaveConfiguration={onSaveConfiguration}
                onModelNameChange={onModelNameChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid gap-6 md:grid-cols-2">
              <ModelFallbackCard
                selectedModel={selectedModel}
                onUpdateModel={onUpdateModel}
                isLoading={isLoading}
              />

              {/* Additional advanced settings could go here */}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <ModelAnalyticsCard selectedModel={selectedModel} />
          </TabsContent>

          <TabsContent value="test">
            <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-lg">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Test Model Chat</h3>
                <p className="text-muted-foreground">
                  Test how your AI model responds to different prompts and messages.
                </p>
              </div>
              <Button
                size="lg"
                onClick={onOpenTestChat}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Start Test Chat
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Model Dialog - Kept for fallback when useFullPageEditor is false */}
      <AIModelDialog
        model={editingModel || undefined}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onModelDialogSubmit}
        isLoading={isSaving}
      />

      {/* Test Chat Dialog */}
      <ModelTestChatDialog
        model={selectedModel}
        open={isTestChatOpen}
        onOpenChange={setIsTestChatOpen}
      />
    </div>
  );
}
