
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseEnvironmentCheckProps {
  onError?: (errorMessage: string) => void;
  requiredVars?: string[];
  silent?: boolean;
}

/**
 * Hook to check if required environment variables are set
 * @param onError - Callback function to handle error messages
 * @param requiredVars - Array of required environment variable names
 * @param silent - If true, will not show toast notifications
 */
export function useEnvironmentCheck({
  onError,
  requiredVars = ['VITE_API_URL'],
  silent = false
}: UseEnvironmentCheckProps = {}) {
  const { toast } = useToast();

  useEffect(() => {
    // Check if required environment variables are set
    const missingEnvVars = requiredVars.filter(varName => {
      return !import.meta.env[varName];
    });

    if (missingEnvVars.length > 0) {
      const errorMessage = `Please set the following environment variables: ${missingEnvVars.join(', ')}`;

      // Show toast notification if not silent
      if (!silent) {
        toast({
          title: "Missing Configuration",
          description: errorMessage,
          variant: "destructive",
        });
      }

      // Call onError callback if provided
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [toast, onError, requiredVars, silent]);
}
