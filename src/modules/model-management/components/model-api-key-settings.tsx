
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData } from "@/utils/ai-model-service";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ModelApiKeySettingsProps {
  model: AIModelData;
  onSave: (apiKey: string) => Promise<void>;
  onTest: () => Promise<void>;
  isSaving: boolean;
  isTesting: boolean;
}

export function ModelApiKeySettings({ 
  model, 
  onSave, 
  onTest,
  isSaving,
  isTesting
}: ModelApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const [hasExistingKey, setHasExistingKey] = useState(false);
  
  useEffect(() => {
    // Check if model has an API key set
    if (model.api_key) {
      setHasExistingKey(true);
      setApiKey(model.api_key.startsWith("••••") ? "" : model.api_key);
    } else {
      setHasExistingKey(false);
      setApiKey("");
    }
  }, [model]);

  const handleSave = () => {
    onSave(apiKey);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <Label htmlFor="api-key">API Key for {model.provider}</Label>
          {hasExistingKey && (
            <span className="text-xs text-muted-foreground">
              API key already configured
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            id="api-key"
            type="password"
            placeholder={hasExistingKey ? "••••••••••••••••" : "Enter your API key"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
            disabled={isSaving}
          />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
            Save
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1.5">
          {getProviderInfoText(model.provider)}
        </p>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onTest}
        disabled={isTesting || (!hasExistingKey && !apiKey)}
      >
        {isTesting ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Test Connection
      </Button>
      
      <Alert className="bg-accent">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your API key is securely encrypted in the database and never shared with third parties.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function getProviderInfoText(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'Enter your OpenAI API key. You can get this from your OpenAI dashboard.';
    case 'anthropic':
      return 'Enter your Anthropic API key. You can get this from your Anthropic console.';
    case 'gemini':
      return 'Enter your Google API key with Gemini access. You can get this from Google AI Studio.';
    default:
      return `Enter your ${provider} API key.`;
  }
}
