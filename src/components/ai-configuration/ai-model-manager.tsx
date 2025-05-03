
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { AIModelDialog } from "./model-management/ai-model-dialog";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";

import { Settings, Key, AlertCircle, Info, Plus, RefreshCw } from "lucide-react";

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Model Selection
            </CardTitle>
            <CardDescription>
              Choose which AI model powers your application
            </CardDescription>
          </div>
          <Button onClick={handleAddNewModel}>
            <Plus className="mr-2 h-4 w-4" /> Add Model
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No AI models configured yet</p>
              <Button onClick={handleAddNewModel}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Model
              </Button>
            </div>
          ) : (
            <RadioGroup 
              value={selectedModelId ? String(selectedModelId) : ""}
              onValueChange={handleModelSelect}
              className="grid gap-4 md:grid-cols-2"
            >
              {models.map((model) => (
                <div key={model.id} className="relative">
                  <RadioGroupItem
                    value={String(model.id)}
                    id={`model-${model.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`model-${model.id}`}
                    className="flex flex-col h-full p-4 border rounded-md cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{model.name}</span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full">{model.provider}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                    <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                      <span>Max Tokens: {model.settings?.max_tokens || "Default"}</span>
                      {model.is_default && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    {selectedModelId === model.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditModel(model);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>
      
      {/* Only show configuration cards if a model is selected */}
      {selectedModel && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key Management
              </CardTitle>
              <CardDescription>
                Configure your API keys for {selectedModel.provider}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="mt-1 flex">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className={isAPIKeyValid === false ? "border-red-500" : ""}
                      disabled={isSaving}
                    />
                    <Button 
                      onClick={handleAPIKeySave} 
                      className="ml-2"
                      disabled={isSaving}
                    >
                      {isSaving ? <Spinner size="sm" /> : "Save Key"}
                    </Button>
                  </div>
                  {isAPIKeyValid === false && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Invalid API key format
                    </p>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleTestConnection}
                  disabled={isTesting || !isAPIKeyValid}
                >
                  {isTesting ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Test Connection
                </Button>
                
                <Alert className="bg-muted/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your API key is stored securely and is never shared with third parties.
                    See our <a href="#" className="underline">documentation</a> for more details.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Parameters
              </CardTitle>
              <CardDescription>
                Adjust parameters to control AI behavior and output
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">
                      Temperature: {temperature[0].toFixed(1)}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                          <Info className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <p className="text-sm">
                          Controls randomness: lower values produce more predictable responses,
                          higher values more creative ones. Range from 0 to 1.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onValueChange={setTemperature}
                    disabled={isSaving}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="max-tokens">
                      Max Output Tokens: {maxTokens[0]}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                          <Info className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <p className="text-sm">
                          Limits the number of tokens in the model's response. One token is roughly 4 characters.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Slider
                    id="max-tokens"
                    min={100}
                    max={4096}
                    step={100}
                    value={maxTokens}
                    onValueChange={setMaxTokens}
                    disabled={isSaving}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Brief</span>
                    <span>Moderate</span>
                    <span>Detailed</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleSaveConfiguration}
                  disabled={isSaving}
                >
                  {isSaving ? <Spinner size="sm" className="mr-2" /> : "Save Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
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
