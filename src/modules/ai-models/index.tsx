
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIModelManager } from "@/components/ai-configuration/ai-model-manager";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function AIModelsModule() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if required environment variables are set
    const missingEnvVars = [];
    if (!import.meta.env.VITE_API_URL) {
      missingEnvVars.push('VITE_API_URL');
    }
    
    if (missingEnvVars.length > 0) {
      toast({
        title: "Missing Configuration",
        description: `Please set the following environment variables: ${missingEnvVars.join(', ')}`,
        variant: "destructive",
      });
    }
  }, [toast]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
          <CardDescription>
            Configure and manage the AI models used in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIModelManager />
        </CardContent>
      </Card>
    </div>
  );
}
