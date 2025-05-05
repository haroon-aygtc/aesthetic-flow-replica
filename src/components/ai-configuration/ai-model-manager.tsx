
import { useAIModelManagement } from "@/hooks/use-ai-model-management";
import { useModelActions } from "./model-management/model-actions";
import { AIModelData } from "@/utils/ai-model-service";
import { AIModelDialog } from "./model-management/ai-model-dialog";
import { ModelSelectionCard } from "./model-management/model-selection-card";
import { ApiKeyCard } from "./model-management/api-key-card";
import { ConfigParametersCard } from "./model-management/config-parameters-card";
import { ModelFallbackCard } from "./model-management/model-fallback-card";
import { ModelAnalyticsCard } from "./model-management/model-analytics-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, History, BarChart } from "lucide-react";

export function AIModelManager() {
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
    editingModel,
    setEditingModel,
    fetchModels
  } = useAIModelManagement();

  const {
    handleModelSelect,
    handleAPIKeySave,
    handleSaveConfiguration,
    handleTestConnection,
    handleModelDialogSubmit
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

  // Handle connection test
  const onTestConnection = async () => {
    await handleTestConnection(
      selectedModel,
      selectedModelId,
      setIsTesting
    );
  };

  // Handle adding new model
  const onAddNewModel = () => {
    setEditingModel(null);
    setIsDialogOpen(true);
  };

  // Handle editing model
  const onEditModel = (model: AIModelData) => {
    setEditingModel(model);
    setIsDialogOpen(true);
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

  return (
    <div className="space-y-6">
      {/* Model Selection Card */}
      <ModelSelectionCard
        models={models}
        selectedModelId={selectedModelId}
        onModelSelect={onModelSelect}
        onAddNewModel={onAddNewModel}
        onEditModel={onEditModel}
        isLoading={isLoading}
      />

      {/* Only show configuration cards if a model is selected */}
      {selectedModel && (
        <Tabs defaultValue="basic" className="w-full">
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
                selectedModel={selectedModel}
                temperature={temperature}
                maxTokens={maxTokens}
                isSaving={isSaving}
                onTemperatureChange={setTemperature}
                onMaxTokensChange={setMaxTokens}
                onSaveConfiguration={onSaveConfiguration}
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
        </Tabs>
      )}

      {/* Model Dialog */}
      <AIModelDialog
        model={editingModel || undefined}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onModelDialogSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}
