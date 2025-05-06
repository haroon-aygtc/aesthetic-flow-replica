
import { useState, useEffect, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { ModelFallbackCard } from "@/components/ai-configuration/model-management/model-fallback-card";
import { ModelActivationRules } from "@/components/ai-configuration/model-management/activation-rules/model-activation-rules";
import { ModelAnalytics } from "@/components/ai-configuration/model-management/model-analytics";
import { ModelTestingInterface } from "@/components/ai-configuration/model-management/model-testing-interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function ModelManagementModule() {
  const [models, setModels] = useState<AIModelData[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
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
                    className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted ${selectedModelId === model.id ? "border-primary bg-muted" : ""
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
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="fallback">Fallback Settings</TabsTrigger>
                <TabsTrigger value="rules">Activation Rules</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Model Settings</CardTitle>
                    <CardDescription>
                      Configure the basic settings for this AI model
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="api-key">API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="api-key"
                            type="password"
                            value={selectedModel?.api_key ? "••••••••••••••••" : ""}
                            placeholder="Enter API key"
                            onChange={(e) => {
                              if (selectedModel) {
                                const updatedModel = {
                                  ...selectedModel,
                                  api_key: e.target.value
                                };
                                handleUpdateModel(updatedModel);
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (selectedModel?.id) {
                                aiModelService.testConnection(selectedModel.id)
                                  .then(result => {
                                    toast({
                                      title: result.success ? "Connection Successful" : "Connection Failed",
                                      description: result.message,
                                      variant: result.success ? "default" : "destructive"
                                    });
                                  })
                                  .catch(error => {
                                    toast({
                                      title: "Connection Failed",
                                      description: error.message,
                                      variant: "destructive"
                                    });
                                  });
                              }
                            }}
                          >
                            Test Connection
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="model-name">Model Name</Label>
                        <Input
                          id="model-name"
                          value={selectedModel?.settings?.model_name || ""}
                          placeholder="e.g., gpt-4, gemini-pro"
                          onChange={(e) => {
                            if (selectedModel) {
                              const updatedModel = {
                                ...selectedModel,
                                settings: {
                                  ...selectedModel.settings,
                                  model_name: e.target.value
                                }
                              };
                              handleUpdateModel(updatedModel);
                            }
                          }}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is-default"
                          checked={selectedModel?.is_default || false}
                          onCheckedChange={(checked) => {
                            if (selectedModel) {
                              const updatedModel = {
                                ...selectedModel,
                                is_default: !!checked
                              };
                              handleUpdateModel(updatedModel);
                            }
                          }}
                        />
                        <Label htmlFor="is-default">Set as default model</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is-active"
                          checked={selectedModel?.active !== false}
                          onCheckedChange={(checked) => {
                            if (selectedModel) {
                              const updatedModel = {
                                ...selectedModel,
                                active: !!checked
                              };
                              handleUpdateModel(updatedModel);
                            }
                          }}
                        />
                        <Label htmlFor="is-active">Active</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fallback" className="space-y-6">
                <ModelFallbackCard
                  selectedModel={selectedModel!}
                  onUpdateModel={handleUpdateModel}
                />
              </TabsContent>

              <TabsContent value="rules">
                <ModelActivationRules
                  selectedModel={selectedModel!}
                  onRuleUpdate={handleRuleUpdate}
                />
              </TabsContent>

              <TabsContent value="testing">
                <ModelTestingInterface selectedModel={selectedModel!} />
              </TabsContent>

              <TabsContent value="analytics">
                <ModelAnalytics selectedModel={selectedModel!} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
