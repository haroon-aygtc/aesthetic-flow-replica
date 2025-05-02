
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIModelManager } from "@/components/ai-configuration/ai-model-manager";

export function AIModelsModule() {
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
