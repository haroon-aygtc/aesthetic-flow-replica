import { AIModelManagerContainer } from "./components/ai-model-manager-container";
import AdminLayout from "@/components/layouts/admin-layout";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-6 bg-destructive/10 rounded-lg flex flex-col items-center justify-center text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>
        <RefreshCw className="h-4 w-4 mr-2" /> Try again
      </Button>
    </div>
  );
}

export function AIModelsModule() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <AIModelManagerContainer />
        </ErrorBoundary>
      </div>
    </AdminLayout>
  );
}

export default AIModelsModule;
