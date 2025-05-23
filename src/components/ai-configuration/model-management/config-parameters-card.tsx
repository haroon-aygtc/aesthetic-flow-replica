import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Info, Settings } from "lucide-react";
import { AIModelData } from "@/utils/ai-model-service";
import { ModelSelector } from "./model-selector";

interface ConfigParametersCardProps {
  temperature: number[];
  maxTokens: number[];
  isSaving: boolean;
  selectedModel: AIModelData | null;
  onTemperatureChange: (values: number[]) => void;
  onMaxTokensChange: (values: number[]) => void;
  onSaveConfiguration: () => void;
  onModelNameChange: (modelName: string) => void;
}

export function ConfigParametersCard({
  temperature,
  maxTokens,
  isSaving,
  selectedModel,
  onTemperatureChange,
  onMaxTokensChange,
  onSaveConfiguration,
  onModelNameChange
}: ConfigParametersCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Model Settings
        </CardTitle>
        <CardDescription>
          Adjust parameters to control AI behavior and output quality.
          These settings will be used when sending messages to the model.
        </CardDescription>
        {selectedModel && (
          <div className="mt-2 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Provider: {selectedModel.provider}</span>
              <span>Status: {selectedModel.active ? "Active" : "Inactive"}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4 pb-4 border-b">
            <ModelSelector
              selectedModel={selectedModel}
              onModelSelect={onModelNameChange}
              disabled={isSaving}
            />
          </div>

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
              onValueChange={onTemperatureChange}
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
                    Valid values are between 1 and 8000.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <Slider
              id="max-tokens"
              min={100}
              max={8000}
              step={100}
              value={maxTokens}
              onValueChange={(values) => {
                // Ensure values are within valid range before updating
                const newValue = values[0];
                if (newValue < 1) {
                  onMaxTokensChange([1]);
                } else if (newValue > 8000) {
                  onMaxTokensChange([8000]);
                } else {
                  onMaxTokensChange(values);
                }
              }}
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
            onClick={onSaveConfiguration}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
