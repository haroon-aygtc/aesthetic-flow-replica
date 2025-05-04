
import { BrandingEngine } from "@/components/ai-configuration/branding-engine";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";

export function BrandingEngineModule() {
  // In a real implementation, we would load branding data from API here
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Simulate loading if needed for testing
  // useEffect(() => {
  //   setIsLoading(true);
  //   setTimeout(() => setIsLoading(false), 1000);
  // }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" className="mr-2" />
        <p>Loading branding configuration...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load branding configuration. Please try refreshing the page.
          <p className="mt-2">{error.message}</p>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branding Engine</CardTitle>
          <CardDescription>
            Configure how your AI assistant represents your brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingEngine />
        </CardContent>
      </Card>
    </div>
  );
}
