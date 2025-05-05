
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useEnvironmentCheck() {
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
}
