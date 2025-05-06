
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIModelManager } from "@/components/ai-configuration/ai-model-manager";
import { useSearchParams } from "react-router-dom";
import { useEnvironmentCheck } from "../hooks/use-environment-check";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Container component for AI Model Management
 * Provides a card wrapper with error handling for the AI Model Manager
 */
export function AIModelManagerContainer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Check environment variables
  useEnvironmentCheck({
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  // Handle tab changes by updating URL params
  const handleTabChange = (value: string) => {
    searchParams.set("tab", value);
    setSearchParams(searchParams);
  };

  // Get the initial tab from URL or default to "basic"
  const initialTab = searchParams.get("tab") || "basic";

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Management</CardTitle>
        <CardDescription>
          Configure and manage the AI models used in your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AIModelManager initialTab={initialTab} onTabChange={handleTabChange} />
      </CardContent>
    </Card>
  );
}
