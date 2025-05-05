
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { ModelFallbackCard } from "@/components/ai-configuration/model-management/model-fallback-card";
import { TemplateSelector } from "@/components/ai-configuration/model-management/template-selector";
import { ModelApiKeySettings } from "./model-api-key-settings";
import { ModelParametersSettings } from "./model-parameters-settings";
import { useToast } from "@/hooks/use-toast";
import { Cog, Key, Sliders } from "lucide-react";

interface ModelConfigurationPanelProps {
  selectedModel: AIModelData;
  onUpdateModel: (model: AIModelData) => void;
}

export function ModelConfigurationPanel({ 
  selectedModel, 
  onUpdateModel 
}: ModelConfigurationPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState("api-key");
  const { toast } = useToast();
  
  const handleSaveApiKey = async (apiKey: string) => {
    if (!selectedModel.id) return;
    
    try {
      setIsSaving(true);
      const updatedModel = await aiModelService.updateModel(selectedModel.id, {
        api_key: apiKey
      });
      onUpdateModel(updatedModel);
      toast({
        title: "API Key Updated",
        description: "Your API key has been saved successfully."
      });
    } catch (error) {
      console.error("Failed to save API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTestConnection = async () => {
    if (!selectedModel.id) return;
    
    try {
      setIsTesting(true);
      const result = await aiModelService.testConnection(selectedModel.id);
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message || "Successfully connected to the API."
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message || "Failed to connect to the API.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      toast({
        title: "Error",
        description: "Connection test failed. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSaveParameters = async (params: { temperature: number, maxTokens: number }) => {
    if (!selectedModel.id) return;
    
    try {
      setIsSaving(true);
      const updatedModel = await aiModelService.updateModel(selectedModel.id, {
        settings: {
          ...selectedModel.settings,
          temperature: params.temperature,
          max_tokens: params.maxTokens
        }
      });
      onUpdateModel(updatedModel);
      toast({
        title: "Parameters Updated",
        description: "Model parameters have been updated successfully."
      });
    } catch (error) {
      console.error("Failed to save parameters:", error);
      toast({
        title: "Error",
        description: "Failed to save parameters. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Model Settings: {selectedModel.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Parameters
            </TabsTrigger>
            <TabsTrigger value="fallback" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Fallback Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-key">
            <ModelApiKeySettings
              model={selectedModel}
              onSave={handleSaveApiKey}
              onTest={handleTestConnection}
              isSaving={isSaving}
              isTesting={isTesting}
            />
          </TabsContent>
          
          <TabsContent value="parameters">
            <ModelParametersSettings
              model={selectedModel}
              onSave={handleSaveParameters}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="fallback">
            <ModelFallbackCard
              selectedModel={selectedModel}
              onUpdateModel={onUpdateModel}
            />
          </TabsContent>
        </Tabs>

        <div>
          <h3 className="text-lg font-medium mb-3">Prompt Template</h3>
          <TemplateSelector
            selectedModelId={selectedModel.id}
            onTemplateSelect={() => {}}
            onCreateTemplate={() => {}}
            selectedTemplateId={null}
          />
        </div>
      </CardContent>
    </Card>
  );
}
