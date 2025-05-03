
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Key, RefreshCw } from "lucide-react";
import { AIModelData } from "@/utils/ai-model-service";

interface ApiKeyCardProps {
  selectedModel: AIModelData | null;
  apiKey: string;
  isAPIKeyValid: boolean | null;
  isSaving: boolean;
  isTesting: boolean;
  onApiKeyChange: (value: string) => void;
  onApiKeySave: () => void;
  onTestConnection: () => void;
}

export function ApiKeyCard({
  selectedModel,
  apiKey,
  isAPIKeyValid,
  isSaving,
  isTesting,
  onApiKeyChange,
  onApiKeySave,
  onTestConnection
}: ApiKeyCardProps) {
  if (!selectedModel) return null;

  return (
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
                onChange={(e) => onApiKeyChange(e.target.value)}
                className={isAPIKeyValid === false ? "border-red-500" : ""}
                disabled={isSaving}
              />
              <Button 
                onClick={onApiKeySave} 
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
            onClick={onTestConnection}
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
  );
}
