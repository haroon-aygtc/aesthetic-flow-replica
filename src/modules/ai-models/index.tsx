
import { useEnvironmentCheck } from "./hooks/use-environment-check";
import { AIModelManagerContainer } from "./components/ai-model-manager-container";

export function AIModelsModule() {
  // Check for environment variables
  useEnvironmentCheck();
  
  return (
    <div className="space-y-6">
      <AIModelManagerContainer />
    </div>
  );
}
