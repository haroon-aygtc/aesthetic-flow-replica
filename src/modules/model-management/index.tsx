
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { ModelFallbackCard } from "@/components/ai-configuration/model-management/model-fallback-card";
import { ModelActivationRules } from "@/components/ai-configuration/model-management/activation-rules/model-activation-rules";
import { ModelAnalytics } from "@/components/ai-configuration/model-management/model-analytics";
import { TemplateSelector } from "@/components/ai-configuration/model-management/template-selector";
import { AIModelManager } from "@/components/ai-configuration/ai-model-manager";
import { ModelSelectionPanel } from "./components/model-selection-panel";
import { ModelConfigurationPanel } from "./components/model-configuration-panel";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings, Book, BarChart3 } from "lucide-react";

export function ModelManagementModule() {
  const [models, setModels] = useState<AIModelData[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("configuration");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModelId && models.length) {
      const model = models.find(m => m.id === selectedModelId) || null;
      setSelectedModel(model);
    } else {
      setSelectedModel(null);
    }
  }, [selectedModelId, models]);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const loadedModels = await aiModelService.getModels();
      setModels(loadedModels);
      
      // Select the first model by default or the default model if available
      if (loadedModels.length > 0 && !selectedModelId) {
        const defaultModel = loadedModels.find(m => m.is_default);
        setSelectedModelId(defaultModel?.id || loadedModels[0].id!);
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

  const handleCreateModel = async (modelData: AIModelData) => {
    try {
      setIsLoading(true);
      const newModel = await aiModelService.createModel(modelData);
      setModels([...models, newModel]);
      setSelectedModelId(newModel.id!);
      toast({
        title: "Success",
        description: `Model "${newModel.name}" has been created.`
      });
    } catch (error) {
      console.error("Failed to create model:", error);
      toast({
        title: "Error",
        description: "Failed to create the model. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRuleUpdate = () => {
    // Refresh the model data after rule updates
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

  // If using the simplified view
  if (!showAdvancedOptions) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Model Management</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedOptions(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Advanced Mode
          </Button>
        </div>
        <AIModelManager />
      </div>
    );
  }

  // Advanced mode with more options
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Model Management</h2>
        <Button 
          variant="outline" 
          onClick={() => setShowAdvancedOptions(false)}
        >
          Simple Mode
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Model Selection */}
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">AI Models</h2>
              <Button size="sm" onClick={() => {
                // Open create model dialog logic
              }}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
            
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <ModelSelectionPanel 
                models={models} 
                selectedModelId={selectedModelId} 
                onModelSelect={setSelectedModelId} 
              />
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
                <TabsTrigger value="configuration" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="rules" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Activation Rules
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="configuration" className="space-y-6">
                <ModelConfigurationPanel
                  selectedModel={selectedModel}
                  onUpdateModel={handleUpdateModel}
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
