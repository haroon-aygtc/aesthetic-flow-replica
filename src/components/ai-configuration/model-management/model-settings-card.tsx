import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIModelData } from "@/utils/ai-model-service";
import { ModelSelector } from "./model-selector";
import { ChevronDown, ChevronUp, Cog, Settings, Sliders, Sparkles, Zap } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

interface ModelSettingsCardProps {
  selectedModel: AIModelData;
  onUpdateModel: (updatedModel: AIModelData) => void;
  isLoading?: boolean;
  showAdvanced?: boolean;
}

export function ModelSettingsCard({ 
  selectedModel, 
  onUpdateModel, 
  isLoading = false,
  showAdvanced = false
}: ModelSettingsCardProps) {
  const { toast } = useToast();
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(showAdvanced);
  const [temperature, setTemperature] = useState(
    selectedModel?.settings?.temperature ?? 0.7
  );
  const [maxTokens, setMaxTokens] = useState(
    selectedModel?.settings?.max_tokens ?? 2048
  );
  const [topP, setTopP] = useState(
    selectedModel?.settings?.top_p ?? 1.0
  );
  const [frequencyPenalty, setFrequencyPenalty] = useState(
    selectedModel?.settings?.frequency_penalty ?? 0.0
  );
  const [presencePenalty, setPresencePenalty] = useState(
    selectedModel?.settings?.presence_penalty ?? 0.0
  );
  
  // Updates to apply when model changes
  const handleModelNameChange = (modelName: string) => {
    if (!selectedModel) return;
    
    const updatedModel = {
      ...selectedModel,
      settings: {
        ...selectedModel.settings,
        model_name: modelName,
      },
    };
    
    onUpdateModel(updatedModel);
    toast({
      title: "Model Updated",
      description: "Model name has been changed successfully.",
      variant: "success",
    });
  };
  
  // Apply all settings changes
  const handleApplySettings = () => {
    if (!selectedModel) return;
    
    const updatedModel = {
      ...selectedModel,
      settings: {
        ...selectedModel.settings,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
      },
    };
    
    onUpdateModel(updatedModel);
    toast({
      title: "Settings Applied",
      description: "Model settings have been updated successfully.",
      variant: "success",
    });
  };
  
  // Presets for temperature settings
  const handlePresetClick = (preset: string) => {
    switch (preset) {
      case "precise":
        setTemperature(0.1);
        break;
      case "balanced":
        setTemperature(0.7);
        break;
      case "creative":
        setTemperature(1.0);
        break;
    }
  };

  if (!selectedModel) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Settings</CardTitle>
        <CardDescription>Configure how the AI model behaves</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selection Section */}
        <div>
          <ModelSelector
            selectedModel={selectedModel}
            onModelSelect={handleModelNameChange}
            disabled={isLoading}
          />
        </div>
        
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="basic">
              <Zap className="h-4 w-4 mr-2" />
              Basic Settings
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6 pt-4">
            {/* Temperature Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="temperature" className="text-sm font-medium">
                  Temperature: <span className="bg-muted px-2 py-0.5 rounded-md text-foreground">{temperature.toFixed(2)}</span>
                </Label>
                <div className="flex space-x-1">
                  <Button 
                    variant={temperature === 0.1 ? "default" : "outline"}
                    size="sm" 
                    onClick={() => handlePresetClick("precise")}
                    className="h-7 px-2 text-xs"
                  >
                    Precise
                  </Button>
                  <Button 
                    variant={temperature === 0.7 ? "default" : "outline"}
                    size="sm" 
                    onClick={() => handlePresetClick("balanced")}
                    className="h-7 px-2 text-xs"
                  >
                    Balanced
                  </Button>
                  <Button 
                    variant={temperature === 1.0 ? "default" : "outline"}
                    size="sm" 
                    onClick={() => handlePresetClick("creative")}
                    className="h-7 px-2 text-xs"
                  >
                    Creative
                  </Button>
                </div>
              </div>
              
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.01}
                value={[temperature]}
                onValueChange={(values) => setTemperature(values[0])}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                Controls randomness: lower values are more deterministic, higher values are more creative.
              </p>
            </div>
            
            {/* Max Tokens Control */}
            <div className="space-y-2">
              <Label htmlFor="max-tokens" className="text-sm font-medium">Max Response Tokens</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="max-tokens"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const value = parseInt(inputValue);
                    
                    if (isNaN(value)) {
                      return;
                    }
                    
                    if (value < 1) {
                      setMaxTokens(1);
                      toast({
                        title: "Invalid Value",
                        description: "Max tokens must be at least 1",
                        variant: "destructive"
                      });
                    } else if (value > 8000) {
                      setMaxTokens(8000);
                      toast({
                        title: "Invalid Value",
                        description: "Max tokens must not exceed 8000",
                        variant: "destructive"
                      });
                    } else {
                      setMaxTokens(value);
                    }
                  }}
                  className="w-24 text-right bg-background"
                />
                <Slider
                  id="max-tokens-slider"
                  min={1}
                  max={8000}
                  step={100}
                  value={[maxTokens]}
                  onValueChange={(values) => setMaxTokens(values[0])}
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxTokens(1024)}
                  className={`h-7 text-xs ${maxTokens === 1024 ? "bg-primary/10" : ""}`}
                >
                  1024
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxTokens(2048)}
                  className={`h-7 text-xs ${maxTokens === 2048 ? "bg-primary/10" : ""}`}
                >
                  2048
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxTokens(4000)}
                  className={`h-7 text-xs ${maxTokens === 4000 ? "bg-primary/10" : ""}`}
                >
                  4000
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMaxTokens(8000)}
                  className={`h-7 text-xs ${maxTokens === 8000 ? "bg-primary/10" : ""}`}
                >
                  8000
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum number of tokens the model can generate in a response. Higher values allow longer responses.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6 pt-4">
            {/* Top P Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="top-p" className="text-sm font-medium">
                  Top P: <span className="bg-muted px-2 py-0.5 rounded-md text-foreground">{topP.toFixed(2)}</span>
                </Label>
              </div>
              <Slider
                id="top-p"
                min={0}
                max={1}
                step={0.01}
                value={[topP]}
                onValueChange={(values) => setTopP(values[0])}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                Controls diversity via nucleus sampling: 1.0 considers all tokens, lower values focus on higher probability tokens.
              </p>
            </div>
            
            {/* Frequency Penalty Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="frequency-penalty" className="text-sm font-medium">
                  Frequency Penalty: <span className="bg-muted px-2 py-0.5 rounded-md text-foreground">{frequencyPenalty.toFixed(2)}</span>
                </Label>
              </div>
              <Slider
                id="frequency-penalty"
                min={0}
                max={2}
                step={0.01}
                value={[frequencyPenalty]}
                onValueChange={(values) => setFrequencyPenalty(values[0])}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                Reduces repetition by penalizing tokens that have already appeared in the text.
              </p>
            </div>
            
            {/* Presence Penalty Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="presence-penalty" className="text-sm font-medium">
                  Presence Penalty: <span className="bg-muted px-2 py-0.5 rounded-md text-foreground">{presencePenalty.toFixed(2)}</span>
                </Label>
              </div>
              <Slider
                id="presence-penalty"
                min={0}
                max={2}
                step={0.01}
                value={[presencePenalty]}
                onValueChange={(values) => setPresencePenalty(values[0])}
                className="my-2"
              />
              <p className="text-xs text-muted-foreground">
                Encourages the model to talk about new topics by penalizing tokens that have appeared at all.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleApplySettings} 
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
          Apply Settings
        </Button>
      </CardFooter>
    </Card>
  );
} 