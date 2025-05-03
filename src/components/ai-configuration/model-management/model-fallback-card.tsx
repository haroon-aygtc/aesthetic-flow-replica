
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, BarChart, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";

interface ModelFallbackCardProps {
  selectedModel: AIModelData | null;
  onUpdateModel: (updatedModel: AIModelData) => void;
  isLoading?: boolean;
}

export function ModelFallbackCard({
  selectedModel,
  onUpdateModel,
  isLoading = false
}: ModelFallbackCardProps) {
  const { toast } = useToast();
  const [fallbackOptions, setFallbackOptions] = useState<AIModelData[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number[]>([0.7]);
  const [fallbackModelId, setFallbackModelId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load fallback options when model changes
  useEffect(() => {
    if (selectedModel?.id) {
      loadFallbackOptions(selectedModel.id);
      setConfidenceThreshold([selectedModel.confidence_threshold || 0.7]);
      setFallbackModelId(selectedModel.fallback_model_id || null);
      setIsActive(selectedModel.active !== false);
    }
  }, [selectedModel]);

  const loadFallbackOptions = async (modelId: number) => {
    setIsLoadingOptions(true);
    try {
      const options = await aiModelService.getFallbackOptions(modelId);
      setFallbackOptions(options);
    } catch (error) {
      console.error("Failed to load fallback options:", error);
      toast({
        title: "Error",
        description: "Failed to load model fallback options",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleFallbackChange = (value: string) => {
    setFallbackModelId(value ? Number(value) : null);
  };

  const handleConfidenceThresholdChange = (values: number[]) => {
    setConfidenceThreshold(values);
  };

  const handleActiveToggle = async (active: boolean) => {
    if (!selectedModel?.id) return;

    setIsSaving(true);
    try {
      const updatedModel = await aiModelService.toggleModelActivation(
        selectedModel.id, 
        active
      );
      setIsActive(updatedModel.active !== false);
      onUpdateModel(updatedModel);
      
      toast({
        title: active ? "Model Activated" : "Model Deactivated",
        description: `${selectedModel.name} has been ${active ? 'activated' : 'deactivated'}.`
      });
    } catch (error: any) {
      console.error("Failed to toggle model activation:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle model activation",
        variant: "destructive"
      });
      setIsActive(selectedModel.active !== false); // Reset to original value
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedModel?.id) return;

    setIsSaving(true);
    try {
      const updatedModel = await aiModelService.updateModel(selectedModel.id, {
        fallback_model_id: fallbackModelId,
        confidence_threshold: confidenceThreshold[0]
      });
      
      onUpdateModel(updatedModel);
      
      toast({
        title: "Settings Saved",
        description: "Model fallback settings have been updated successfully."
      });
    } catch (error) {
      console.error("Failed to save fallback settings:", error);
      toast({
        title: "Error",
        description: "Failed to save model fallback settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedModel) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <History className="h-5 w-5" />
          Model Fallback & Activation
        </CardTitle>
        <CardDescription>
          Configure model fallback hierarchy and activation settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Model Activation Toggle */}
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="model-active">Model Active</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this model
              </p>
            </div>
            <Switch
              id="model-active"
              checked={isActive}
              onCheckedChange={handleActiveToggle}
              disabled={isLoading || isSaving || selectedModel.is_default}
            />
          </div>

          {selectedModel.is_default && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This is the default model and cannot be deactivated.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Fallback Model Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="fallback-model">Fallback Model</Label>
              <Select
                value={fallbackModelId?.toString() || ""}
                onValueChange={handleFallbackChange}
                disabled={isLoading || isLoadingOptions || isSaving}
              >
                <SelectTrigger id="fallback-model">
                  <SelectValue placeholder="Select a fallback model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {fallbackOptions.map((model) => (
                    <SelectItem key={model.id} value={model.id!.toString()}>
                      {model.name} ({model.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If this model fails or confidence is low, system will fallback to this model
              </p>
            </div>

            {/* Confidence Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                <span className="text-sm font-medium">{confidenceThreshold[0].toFixed(2)}</span>
              </div>
              <Slider
                id="confidence-threshold"
                min={0}
                max={1}
                step={0.01}
                value={confidenceThreshold}
                onValueChange={handleConfidenceThresholdChange}
                disabled={isLoading || isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Minimum confidence score to accept a response, otherwise fall back
              </p>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveSettings}
              disabled={isLoading || isSaving}
              className="w-full mt-2"
            >
              {isSaving && <Spinner className="mr-2" size="sm" />}
              Save Fallback Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
