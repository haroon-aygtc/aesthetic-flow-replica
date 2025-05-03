
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Info, Settings } from "lucide-react";
import { AIModelData } from "@/utils/ai-model-service";

interface ConfigParametersCardProps {
  selectedModel: AIModelData | null;
  temperature: number[];
  maxTokens: number[];
  isSaving: boolean;
  onTemperatureChange: (values: number[]) => void;
  onMaxTokensChange: (values: number[]) => void;
  onSaveConfiguration: () => void;
}

export function ConfigParametersCard({
  selectedModel,
  temperature,
  maxTokens,
  isSaving,
  onTemperatureChange,
  onMaxTokensChange,
  onSaveConfiguration
}: ConfigParametersCardProps) {
  if (!selectedModel) return null;

  return (
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
              onValueChange={onMaxTokensChange}
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
            {isSaving ? <Spinner size="sm" className="mr-2" /> : "Save Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
