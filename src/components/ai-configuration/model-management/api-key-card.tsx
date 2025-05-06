
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Key, RefreshCw } from "lucide-react";
import { AIModelData } from "@/utils/ai-model-service";
import { ConnectionTestStatus, ConnectionTestResult } from "./connection-test-status";

interface ApiKeyCardProps {
  selectedModel: AIModelData | null;
  apiKey: string;
  isAPIKeyValid: boolean | null;
  isSaving: boolean;
  isTesting: boolean;
  onApiKeyChange: (value: string) => void;
  onApiKeySave: () => void;
  onTestConnection: () => Promise<{ data: { message: string } }>;
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
  const [testResult, setTestResult] = useState<ConnectionTestResult>({
    status: "idle"
  });

  // Reset test result when model changes
  useEffect(() => {
    setTestResult({ status: "idle" });
  }, [selectedModel?.id]);

  const handleTestConnection = async () => {
    try {
      // Set status to pending
      setTestResult({
        status: "pending",
        message: "Testing connection...",
        timestamp: new Date()
      });

      // Measure latency
      const startTime = Date.now();

      // Call the provided test connection function
      const testResult = await onTestConnection();

      const latency = Date.now() - startTime;

      // Update test result to success
      setTestResult({
        status: "success",
        message: testResult.data?.message || "Connection successful! The API key is valid.",
        timestamp: new Date(),
        latency
      });
    } catch (error: any) {
      // Update test result to error
      setTestResult({
        status: "error",
        message: error.message || "Connection failed. Please check your API key.",
        timestamp: new Date()
      });
    }
  };

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
            onClick={handleTestConnection}
            disabled={isTesting || !isAPIKeyValid}
          >
            {isTesting ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Test Connection
          </Button>

          <ConnectionTestStatus testResult={testResult} />

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
