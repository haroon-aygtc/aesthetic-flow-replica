import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, Zap, Clock, Hash, AlertCircle } from "lucide-react";

interface ModelTestChatDialogProps {
  model: AIModelData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelTestChatDialog({ model, open, onOpenChange }: ModelTestChatDialogProps) {
  const [message, setMessage] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseMetadata, setResponseMetadata] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const responseRef = useRef<HTMLDivElement>(null);

  // Reset state when dialog opens/closes or model changes
  useEffect(() => {
    if (!open) {
      // Small delay to avoid flickering during close animation
      const timer = setTimeout(() => {
        setMessage("");
        setResponse(null);
        setResponseMetadata(null);
        setError(null);
      }, 300);
      return () => clearTimeout(timer);
    } else if (model) {
      // Set initial values from model settings when dialog opens
      setTemperature(model.settings?.temperature || 0.7);
      setMaxTokens(model.settings?.max_tokens || 2048);

      // Clear previous responses
      setResponse(null);
      setResponseMetadata(null);
      setError(null);
    }
  }, [open, model]);

  // Scroll to bottom of response when it changes
  useEffect(() => {
    if (responseRef.current && response) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const handleSendMessage = async () => {
    if (!model?.id || !message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiModelService.testChat(model.id, message, {
        temperature,
        max_tokens: maxTokens
      });

      setResponse(result.response);
      setResponseMetadata(result.metadata);

      if (!result.success) {
        setError(result.metadata.error || "Unknown error occurred");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || "Failed to get response from AI model");
      toast({
        title: "Test Failed",
        description: "Failed to get response from AI model. Please check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Test Chat with {model?.name || "AI Model"}</DialogTitle>
          {model && (
            <div className="text-sm text-muted-foreground mt-1">
              Provider: {model.provider} | Model: {model.settings?.model_name || "Default"}
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="md:col-span-2 flex flex-col space-y-4">
            <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto border rounded-md p-4 bg-muted/30" ref={responseRef}>
              {/* User message */}
              {message && (
                <div className="flex gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">You</p>
                    <p className="text-sm whitespace-pre-wrap">{message}</p>
                  </div>
                </div>
              )}

              {/* AI response */}
              {(isLoading || response) && (
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{model?.name || "AI"}</p>
                    {isLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Spinner size="sm" />
                        <p className="text-sm text-muted-foreground">Generating response...</p>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{response}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[80px]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="self-end"
              >
                {isLoading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature: {temperature}</Label>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Max Tokens</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      min={1}
                      max={4000}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {responseMetadata && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Response Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Response time:</span>
                      <span className="ml-auto font-mono">{responseMetadata.response_time}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Input tokens:</span>
                      <span className="ml-auto font-mono">{responseMetadata.tokens_input}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Output tokens:</span>
                      <span className="ml-auto font-mono">{responseMetadata.tokens_output}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="ml-auto">{responseMetadata.provider}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
