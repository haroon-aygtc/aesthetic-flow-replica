
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData } from "@/utils/ai-model-service";
import { Info } from "lucide-react";

interface ModelParametersSettingsProps {
  model: AIModelData;
  onSave: (params: { temperature: number, maxTokens: number }) => Promise<void>;
  isSaving: boolean;
}

export function ModelParametersSettings({
  model,
  onSave,
  isSaving
}: ModelParametersSettingsProps) {
  const [temperature, setTemperature] = useState<number[]>([0.7]);
  const [maxTokens, setMaxTokens] = useState<number[]>([2048]);
  
  useEffect(() => {
    // Initialize with model settings if available
    if (model.settings) {
      if (model.settings.temperature !== undefined) {
        setTemperature([model.settings.temperature]);
      }
      if (model.settings.max_tokens !== undefined) {
        setMaxTokens([model.settings.max_tokens]);
      }
    }
  }, [model]);

  const handleSave = () => {
    onSave({
      temperature: temperature[0],
      maxTokens: maxTokens[0]
    });
  };

  // Get maximum token limit based on provider and model
  const getMaxTokenLimit = (): number => {
    const modelName = model.settings?.model_name?.toLowerCase() || "";
    
    if (model.provider === "openai") {
      if (modelName.includes("gpt-4")) return 8192;
      if (modelName.includes("gpt-3.5")) return 4096;
    }
    
    if (model.provider === "anthropic") {
      if (modelName.includes("claude-3")) return 100000;
      if (modelName.includes("claude-2")) return 100000;
    }
    
    return 8192; // Default fallback
  };

  const maxTokenLimit = getMaxTokenLimit();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">
            Temperature: {temperature[0].toFixed(2)}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">About Temperature</h4>
                <p className="text-sm">
                  Controls randomness: lower values produce more predictable responses,
                  higher values produce more creative ones. Range from 0 to 1.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.01}
          value={temperature}
          onValueChange={setTemperature}
          disabled={isSaving}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Precise (0.0)</span>
          <span>Balanced (0.5)</span>
          <span>Creative (1.0)</span>
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
              <div className="space-y-2">
                <h4 className="font-medium">About Max Tokens</h4>
                <p className="text-sm">
                  Limits the number of tokens in the model's response. One token is roughly 4 characters
                  or 0.75 words in English.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Slider
          id="max-tokens"
          min={100}
          max={maxTokenLimit}
          step={100}
          value={maxTokens}
          onValueChange={setMaxTokens}
          disabled={isSaving}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Brief</span>
          <span>Medium</span>
          <span>Extended ({maxTokenLimit})</span>
        </div>
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
        Save Parameters
      </Button>
    </div>
  );
}
