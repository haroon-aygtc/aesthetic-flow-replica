
import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WidgetSettings } from "@/utils/widgetService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { aiModelService, AIModelData } from "@/utils/ai-model-service";
import { useToast } from "@/hooks/use-toast";

interface ContentTabProps {
  settings: WidgetSettings;
  onChange: (newSettings: Partial<WidgetSettings>) => void;
}

export function ContentTab({ settings, onChange }: ContentTabProps) {
  const [localSettings, setLocalSettings] = useState<Partial<WidgetSettings>>({
    headerTitle: settings.headerTitle || "AI Chat Assistant",
    initialMessage: settings.initialMessage || "Hello! How can I help you today?",
    inputPlaceholder: settings.inputPlaceholder || "Type your message...",
    sendButtonText: settings.sendButtonText || "Send",
    offlineMessage: settings.offlineMessage || "Sorry, we're currently offline. Please leave a message and we'll get back to you.",
    systemPrompt: settings.systemPrompt || "You are a helpful AI assistant.",
    ai_model_id: settings.ai_model_id || null
  });

  const [aiModels, setAiModels] = useState<AIModelData[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const { toast } = useToast();

  // Load AI models when component mounts
  useEffect(() => {
    const fetchAIModels = async () => {
      setIsLoadingModels(true);
      try {
        const models = await aiModelService.getModels();
        // Filter to only include active models
        const activeModels = models.filter(model => model.active !== false);
        setAiModels(activeModels);
      } catch (error) {
        console.error("Failed to load AI models:", error);
        toast({
          title: "Error",
          description: "Failed to load AI models. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchAIModels();
  }, [toast]);

  const handleChange = (key: string, value: any) => {
    setLocalSettings((prev) => {
      const updated = { ...prev, [key]: value };
      onChange(updated);
      return updated;
    });
  };

  return (
    <CardContent className="space-y-6 pt-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="headerTitle">Header Title</Label>
          <Input
            id="headerTitle"
            value={localSettings.headerTitle || ""}
            onChange={(e) => handleChange("headerTitle", e.target.value)}
            placeholder="AI Chat Assistant"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialMessage">Initial Welcome Message</Label>
          <Textarea
            id="initialMessage"
            value={localSettings.initialMessage || ""}
            onChange={(e) => handleChange("initialMessage", e.target.value)}
            placeholder="Hello! How can I help you today?"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            This message will be shown to the user when they first open the chat.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inputPlaceholder">Input Placeholder</Label>
          <Input
            id="inputPlaceholder"
            value={localSettings.inputPlaceholder || ""}
            onChange={(e) => handleChange("inputPlaceholder", e.target.value)}
            placeholder="Type your message..."
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sendButtonText">Send Button Text</Label>
          <Input
            id="sendButtonText"
            value={localSettings.sendButtonText || ""}
            onChange={(e) => handleChange("sendButtonText", e.target.value)}
            placeholder="Send"
            maxLength={20}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offlineMessage">Offline Message</Label>
          <Textarea
            id="offlineMessage"
            value={localSettings.offlineMessage || ""}
            onChange={(e) => handleChange("offlineMessage", e.target.value)}
            placeholder="Sorry, we're currently offline. Please leave a message and we'll get back to you."
            rows={3}
          />
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="text-lg font-medium">AI Configuration</h3>

        <div className="space-y-2">
          <Label htmlFor="aiModel">AI Model</Label>
          <div className="relative">
            {isLoadingModels && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 z-10">
                <Spinner size="sm" />
              </div>
            )}
            <Select
              value={localSettings.ai_model_id?.toString() || "none"}
              onValueChange={(value) => handleChange("ai_model_id", Number(value) || null)}
              disabled={isLoadingModels}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {aiModels.map((model) => (
                  <SelectItem key={model.id} value={model.id?.toString() || ""}>
                    {model.name} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Show selected model details if available */}
          {localSettings.ai_model_id && (
            <div className="text-xs text-muted-foreground mt-1">
              {aiModels.find(m => m.id === localSettings.ai_model_id)?.description || ""}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            value={localSettings.systemPrompt || ""}
            onChange={(e) => handleChange("systemPrompt", e.target.value)}
            placeholder="You are a helpful AI assistant."
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            Instructions for the AI on how to behave and respond during the conversation.
          </p>
        </div>
      </div>
    </CardContent>
  );
}
