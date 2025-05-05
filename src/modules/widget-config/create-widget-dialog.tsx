
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { widgetService } from "@/utils/widgetService";
import { useToast } from "@/hooks/use-toast";

interface CreateWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWidgetCreated: () => void;
}

export function CreateWidgetDialog({ open, onOpenChange, onWidgetCreated }: CreateWidgetDialogProps) {
  const [name, setName] = useState("");
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Widget name required",
        description: "Please enter a name for your widget",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await widgetService.createWidget({
        name,
        ai_model_id: aiModel && aiModel !== "default" ? parseInt(aiModel) : null,
        is_active: true,
        // Set default settings
        settings: {
          primaryColor: "#4f46e5",
          secondaryColor: "#4f46e5",
          borderRadius: 8,
          position: "bottom-right",
          headerTitle: "AI Chat Assistant",
          initialMessage: "Hello! How can I help you today?",
          inputPlaceholder: "Type your message...",
          sendButtonText: "Send"
        }
      });

      toast({
        title: "Widget created",
        description: `Widget "${name}" has been created successfully.`
      });

      onWidgetCreated();
      resetForm();
    } catch (error) {
      console.error("Failed to create widget:", error);
      toast({
        title: "Failed to create widget",
        description: "There was an error creating your widget. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAiModel(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Widget</DialogTitle>
            <DialogDescription>
              Create a new chat widget for your website or application.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Widget Name*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Customer Support Chat"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="aiModel">AI Model</Label>
              <Select value={aiModel || "default"} onValueChange={setAiModel} disabled={isLoading}>
                <SelectTrigger id="aiModel">
                  <SelectValue placeholder="Select an AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Model</SelectItem>
                  <SelectItem value="1">GPT-4o</SelectItem>
                  <SelectItem value="2">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="3">Claude 3 Opus</SelectItem>
                  <SelectItem value="4">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Widget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
