
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { ModelFallbackCard } from "@/components/ai-configuration/model-management/model-fallback-card";
import { ModelActivationRules } from "@/components/ai-configuration/model-management/model-activation-rules";
import { ModelAnalytics } from "@/components/ai-configuration/model-management/model-analytics";
import { TemplateSelector } from "@/components/ai-configuration/model-management/template-selector";

export function ModelManagementModule() {
  const [models, setModels] = useState<AIModelData[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("configuration");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModelId && models.length) {
      const model = models.find(m => m.id === selectedModelId) || null;
      setSelectedModel(model);
      // You can load template ID here if implementing that feature
      setSelectedTemplateId(null);
    } else {
      setSelectedModel(null);
      setSelectedTemplateId(null);
    }
  }, [selectedModelId, models]);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const loadedModels = await aiModelService.getModels();
      setModels(loadedModels);
      
      // Select the first model by default
      if (loadedModels.length > 0 && !selectedModelId) {
        setSelectedModelId(loadedModels[0].id!);
      }
    } catch (error) {
      console.error("Failed to load AI models:", error);
      toast({
        title: "Error",
        description: "Failed to load AI models. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateModel = (updatedModel: AIModelData) => {
    const updatedModels = models.map(m => 
      m.id === updatedModel.id ? updatedModel : m
    );
    setModels(updatedModels);
    setSelectedModel(updatedModel);
  };

  const handleRuleUpdate = () => {
    // Refresh the model data if needed after rule updates
    if (selectedModelId) {
      loadModelDetails(selectedModelId);
    }
  };

  const loadModelDetails = async (modelId: number) => {
    try {
      const model = await aiModelService.getModel(modelId);
      handleUpdateModel(model);
    } catch (error) {
      console.error("Failed to load model details:", error);
    }
  };

  const handleTemplateSelect = (templateId: string | null) => {
    setSelectedTemplateId(templateId);
    // Here you would also update the model to use this template
    // through an API call to your backend
  };

  const handleCreateTemplate = () => {
    // Navigate to template creation or open modal
    // For now just show a toast since we'd need to implement that UI separately
    toast({
      title: "Create Template",
      description: "Template creation interface would open here."
    });
  };

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-12 gap-6">
        {/* Model Selection */}
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Models</h2>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No AI models configured</p>
              </div>
            ) : (
              <div className="space-y-2">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted ${
                      selectedModelId === model.id ? "border-primary bg-muted" : ""
                    }`}
                    onClick={() => setSelectedModelId(model.id!)}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.provider}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Configuration Tabs */}
        <div className="md:col-span-9">
          {isLoading ? (
            <Card>
              <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" />
              </CardContent>
            </Card>
          ) : !selectedModel ? (
            <Card>
              <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                  <h3 className="font-medium mb-2">Select a model</h3>
                  <p className="text-muted-foreground">Choose an AI model from the list to configure it</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="rules">Activation Rules</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="configuration" className="space-y-6">
                <ModelFallbackCard 
                  selectedModel={selectedModel}
                  onUpdateModel={handleUpdateModel}
                />
                
                <TemplateSelector
                  selectedModelId={selectedModelId}
                  onTemplateSelect={handleTemplateSelect}
                  onCreateTemplate={handleCreateTemplate}
                  selectedTemplateId={selectedTemplateId}
                />
              </TabsContent>
              
              <TabsContent value="rules">
                <ModelActivationRules
                  selectedModel={selectedModel}
                  onRuleUpdate={handleRuleUpdate}
                />
              </TabsContent>
              
              <TabsContent value="analytics">
                <ModelAnalytics selectedModel={selectedModel} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
