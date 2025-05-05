
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AIModelData } from '@/utils/ai-model-service';
import { Spinner } from '@/components/ui/spinner';

interface ModelParametersSettingsProps {
  model: AIModelData;
  onSave: (params: { temperature: number; maxTokens: number }) => Promise<void>;
  isSaving: boolean;
}

export function ModelParametersSettings({
  model,
  onSave,
  isSaving
}: ModelParametersSettingsProps) {
  const [temperature, setTemperature] = useState<number[]>([0.7]);
  const [maxTokens, setMaxTokens] = useState<number[]>([2048]);
  const [hasChanges, setHasChanges] = useState(false);
  
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
    setHasChanges(false);
  }, [model]);
  
  const handleSave = async () => {
    await onSave({
      temperature: temperature[0],
      maxTokens: maxTokens[0]
    });
    setHasChanges(false);
  };
  
  const handleTemperatureChange = (value: number[]) => {
    setTemperature(value);
    checkForChanges(value, maxTokens);
  };
  
  const handleMaxTokensChange = (value: number[]) => {
    setMaxTokens(value);
    checkForChanges(temperature, value);
  };
  
  const checkForChanges = (temp: number[], tokens: number[]) => {
    const currentTemp = model.settings?.temperature !== undefined ? model.settings.temperature : 0.7;
    const currentMaxTokens = model.settings?.max_tokens !== undefined ? model.settings.max_tokens : 2048;
    
    setHasChanges(
      temp[0] !== currentTemp || 
      tokens[0] !== currentMaxTokens
    );
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature: {temperature[0].toFixed(1)}</Label>
              <span className="text-xs text-muted-foreground">
                {temperature[0] < 0.3 ? 'More deterministic' : 
                 temperature[0] > 0.7 ? 'More creative' : 'Balanced'}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onValueChange={handleTemperatureChange}
            />
            <p className="text-sm text-muted-foreground">
              Controls randomness: Lower values make output more deterministic, higher values introduce more randomness.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-tokens">Max Tokens: {maxTokens[0]}</Label>
              <Input
                id="max-tokens-input"
                type="number"
                min={1}
                max={8192}
                value={maxTokens[0]}
                onChange={(e) => handleMaxTokensChange([parseInt(e.target.value) || 0])}
                className="w-24"
              />
            </div>
            <Slider
              id="max-tokens"
              min={1}
              max={8192}
              step={1}
              value={maxTokens}
              onValueChange={handleMaxTokensChange}
            />
            <p className="text-sm text-muted-foreground">
              Maximum number of tokens to generate. One token is roughly 4 characters or 0.75 words.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving && <Spinner className="mr-2 h-4 w-4" />}
              Save Parameters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
