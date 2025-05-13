import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { ModuleConfig, moduleConfigService } from "@/utils/module-config-service";
import {
  MessageSquare,
  FileText,
  Sparkles,
  Bell,
  Star,
  Settings,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AIConfigurationModule() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasInitializedRef = useRef(false);
  const fetchingModuleRef = useRef(false);

  // Get module ID from URL path if available
  const getModuleIdFromPath = useCallback(() => {
    const path = location.pathname;
    if (path.includes('response-formatter')) return 'response_formatter';
    if (path.includes('knowledge-base')) return 'knowledge_base';
    if (path.includes('follow-up')) return 'follow_up';
    if (path.includes('branding')) return 'branding';
    return 'chat'; // Default
  }, [location.pathname]);

  const [modules, setModules] = useState<ModuleConfig[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(getModuleIdFromPath());
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load initial data once
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load models
        const modelsData = await loadModels();
        setAvailableModels(modelsData.filter(model => model.active !== false));
        
        // Load default modules (without API call)
        const defaultModules = getDefaultModules();
        setModules(defaultModules);
        
        // Set initial selected module
        const initialModuleId = getModuleIdFromPath();
        const initialModule = defaultModules.find(m => m.id === initialModuleId);
        if (initialModule) {
          setSelectedModule(initialModule);
        }
        
        hasInitializedRef.current = true;
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load configuration data. Please try again.");
        
        // Set default modules as fallback
        const defaultModules = getDefaultModules();
        setModules(defaultModules);
        
        // Set initial selected module from defaults
        const initialModuleId = getModuleIdFromPath();
        const initialModule = defaultModules.find(m => m.id === initialModuleId);
        if (initialModule) {
          setSelectedModule(initialModule);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [getModuleIdFromPath]);

  // Handle module selection from the list
  const handleModuleSelect = (moduleId: string) => {
    if (moduleId === selectedModuleId) return;
    
    // Set the selected module ID
    setSelectedModuleId(moduleId);
    
    // Find the module in the current modules list
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModule(module);
    } else {
      // If not found, use a default module with the correct ID
      const defaultModules = getDefaultModules();
      const defaultModule = defaultModules.find(m => m.id === moduleId);
      if (defaultModule) {
        setSelectedModule(defaultModule);
        // Add to modules list
        setModules(prev => [...prev, defaultModule]);
      }
    }

    // Navigate to the appropriate URL
    setTimeout(() => {
      switch (moduleId) {
        case 'response_formatter':
          navigate('/dashboard/response-formatter');
          break;
        case 'knowledge_base':
          navigate('/dashboard/knowledge-base');
          break;
        case 'follow_up':
          navigate('/dashboard/follow-up');
          break;
        case 'branding':
          navigate('/dashboard/branding');
          break;
        default:
          navigate('/dashboard/ai-configuration');
      }
    }, 50);
  };

  const loadModels = async (): Promise<AIModelData[]> => {
    try {
      return await aiModelService.getModels();
    } catch (error) {
      console.error("Failed to load AI models:", error);
      toast({
        title: "Error",
        description: "Failed to load AI models. Using default settings.",
        variant: "destructive"
      });
      return [];
    }
  };

  const getIconComponent = (iconName: string): React.ElementType => {
    switch (iconName) {
      case 'MessageSquare': return MessageSquare;
      case 'FileText': return FileText;
      case 'Sparkles': return Sparkles;
      case 'Bell': return Bell;
      case 'Star': return Star;
      default: return Settings;
    }
  };

  const getDefaultModules = (): ModuleConfig[] => {
    return [
      {
        id: "chat",
        name: "Chat Interface",
        description: "Configure AI model settings for the chat widget",
        icon: MessageSquare,
        modelId: null,
        settings: {
          temperature: 0.7,
          max_tokens: 2048,
          system_prompt: "You are a helpful assistant."
        }
      },
      {
        id: "knowledge_base",
        name: "Knowledge Base",
        description: "Configure AI model settings for knowledge base interactions",
        icon: FileText,
        modelId: null,
        settings: {
          temperature: 0.3,
          max_tokens: 1024,
          system_prompt: "You are a knowledge base assistant. Answer questions based on the provided context."
        }
      },
      {
        id: "response_formatter",
        name: "Response Formatter",
        description: "Configure AI model settings for response formatting",
        icon: Sparkles,
        modelId: null,
        settings: {
          temperature: 0.5,
          max_tokens: 1024,
          system_prompt: "Format the following response according to the specified guidelines."
        }
      },
      {
        id: "follow_up",
        name: "Follow-Up Engine",
        description: "Configure AI model settings for generating follow-up suggestions",
        icon: Bell,
        modelId: null,
        settings: {
          temperature: 0.8,
          max_tokens: 512,
          system_prompt: "Generate follow-up questions or suggestions based on the conversation."
        }
      },
      {
        id: "branding",
        name: "Branding Engine",
        description: "Configure AI model settings for brand-aligned responses",
        icon: Star,
        modelId: null,
        settings: {
          temperature: 0.6,
          max_tokens: 1024,
          system_prompt: "Ensure responses align with the brand voice and guidelines."
        }
      }
    ];
  };

  const handleModelSelect = (modelId: string) => {
    if (!selectedModule) return;

    const updatedModule = {
      ...selectedModule,
      modelId: modelId && modelId !== 'none' ? Number(modelId) : null
    };

    setSelectedModule(updatedModule);
    
    // Update the modules list
    setModules(prevModules => {
      return prevModules.map(m => 
        m.id === updatedModule.id ? updatedModule : m
      );
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    if (!selectedModule) return;

    const updatedModule = {
      ...selectedModule,
      settings: {
        ...selectedModule.settings,
        [key]: value
      }
    };

    setSelectedModule(updatedModule);
    
    // Update the modules list
    setModules(prevModules => {
      return prevModules.map(m => 
        m.id === updatedModule.id ? updatedModule : m
      );
    });
  };

  const handleSaveConfiguration = async () => {
    if (!selectedModule) return;

    setIsSaving(true);
    setError(null);

    try {
      // Update the specific module configuration
      await moduleConfigService.updateModuleConfiguration(selectedModule.id, {
        modelId: selectedModule.modelId,
        settings: selectedModule.settings
      });

      toast({
        title: "Configuration Saved",
        description: `${selectedModule.name} configuration has been saved successfully.`
      });
    } catch (error) {
      console.error("Failed to save module configuration:", error);
      setError("Failed to save configuration. Please try again.");
      toast({
        title: "Error",
        description: "Failed to save module configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedModelName = () => {
    if (!selectedModule?.modelId) return "None";
    const model = availableModels.find(m => m.id === selectedModule.modelId);
    return model ? model.name : "Unknown";
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>
            Configure which AI models are used for different modules in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-12 gap-6">
            {/* Module Selection */}
            <div className="md:col-span-3">
              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-medium">Modules</h3>
                <p className="text-sm text-muted-foreground">
                  Select a module to configure its AI settings
                </p>
              </div>

              <div className="space-y-2">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted flex items-center gap-3 ${selectedModuleId === module.id ? "border-primary bg-muted" : ""
                      }`}
                    onClick={() => handleModuleSelect(module.id)}
                  >
                    <module.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{module.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {module.modelId
                          ? `Using: ${availableModels.find(m => m.id === module.modelId)?.name || "Unknown"}`
                          : "No model assigned"
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Configuration */}
            <div className="md:col-span-9">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <Spinner size="lg" />
                </div>
              ) : !selectedModule ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Select a module</h3>
                    <p className="text-muted-foreground">Choose a module from the list to configure its AI settings</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <selectedModule.icon className="h-5 w-5" />
                        {selectedModule.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">{selectedModule.description}</p>
                    </div>
                    <Button
                      onClick={handleSaveConfiguration}
                      disabled={isSaving}
                    >
                      {isSaving ? <Spinner size="sm" className="mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                      Save Configuration
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI Model Selection</CardTitle>
                      <CardDescription>
                        Choose which AI model to use for this module
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="ai-model">AI Model</Label>
                          <Select
                            value={selectedModule.modelId?.toString() || "none"}
                            onValueChange={handleModelSelect}
                          >
                            <SelectTrigger id="ai-model">
                              <SelectValue placeholder="Select an AI model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {availableModels.map((model) => (
                                <SelectItem key={model.id} value={model.id?.toString() || "model_id_missing"}>
                                  {model.name} ({model.provider})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="flex items-center justify-between rounded-md border p-3">
                            <div className="text-sm font-medium">Selected Model</div>
                            <div className="text-sm">{getSelectedModelName()}</div>
                          </div>
                          <div className="flex items-center justify-between rounded-md border p-3">
                            <div className="text-sm font-medium">Provider</div>
                            <div className="text-sm">
                              {selectedModule.modelId
                                ? availableModels.find(m => m.id === selectedModule.modelId)?.provider || "Unknown"
                                : "N/A"
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Module-Specific Settings</CardTitle>
                      <CardDescription>
                        Configure specific settings for how this module uses the AI model
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="basic">
                        <TabsList className="mb-4">
                          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="temperature">Temperature: {selectedModule.settings?.temperature || 0.7}</Label>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">0</span>
                                <input
                                  id="temperature"
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={selectedModule.settings?.temperature || 0.7}
                                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                                  className="flex-1"
                                />
                                <span className="text-sm">1</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Controls randomness: Lower values are more deterministic, higher values more creative
                              </p>
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="max-tokens">Max Tokens</Label>
                              <input
                                id="max-tokens"
                                type="number"
                                value={selectedModule.settings?.max_tokens || 2048}
                                onChange={(e) => handleSettingChange('max_tokens', parseInt(e.target.value))}
                                min="1"
                                max="4000"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              />
                              <p className="text-xs text-muted-foreground">
                                Maximum number of tokens to generate in the response
                              </p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4">
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="system-prompt">System Prompt</Label>
                              <textarea
                                id="system-prompt"
                                value={selectedModule.settings?.system_prompt || ""}
                                onChange={(e) => handleSettingChange('system_prompt', e.target.value)}
                                rows={5}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              />
                              <p className="text-xs text-muted-foreground">
                                System instructions that define how the AI should behave for this module
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
