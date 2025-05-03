
import { useAIModelManagement } from "@/hooks/use-ai-model-management";
import { useModelActions } from "./model-management/model-actions";
import { AIModelData } from "@/utils/ai-model-service";
import { AIModelDialog } from "./model-management/ai-model-dialog";
import { ModelSelectionCard } from "./model-management/model-selection-card";
import { ApiKeyCard } from "./model-management/api-key-card";
import { ConfigParametersCard } from "./model-management/config-parameters-card";

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
