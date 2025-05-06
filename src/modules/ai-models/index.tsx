
import { AIModelManagerContainer } from "./components/ai-model-manager-container";

/**
 * AI Models Module
 * Main module for AI model management functionality
 */
export function AIModelsModule() {
  return (
    <div className="space-y-6">
      <AIModelManagerContainer />
    </div>
  );
}
