
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WidgetSettings } from "@/utils/widgetService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    systemPrompt: settings.systemPrompt || "You are a helpful AI assistant."
  });

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
          <Select 
            value={localSettings.ai_model_id?.toString() || ""} 
            onValueChange={(value) => handleChange("ai_model_id", Number(value) || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an AI model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">GPT-4o</SelectItem>
              <SelectItem value="2">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="3">Claude 3 Opus</SelectItem>
              <SelectItem value="4">Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
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
