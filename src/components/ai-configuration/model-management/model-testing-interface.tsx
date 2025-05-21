import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MessageSquare,
  Send,
  Zap,
  Clock,
  Hash,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModelTestingInterfaceProps {
  selectedModel: AIModelData | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ResponseMetadata {
  model: string;
  provider: string;
  response_time: number;
  tokens_input: number;
  tokens_output: number;
  error?: string;
}

export function ModelTestingInterface({
  selectedModel,
}: ModelTestingInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // No need to initialize temperature and max tokens anymore
  // We'll use the model settings directly when sending the request

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedModel?.id || !inputMessage.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    // Track start time for local response time calculation
    const startTime = performance.now();

    try {
      // Use the model's settings directly from the selectedModel object
      const result = await aiModelService.testChat(
        selectedModel.id,
        inputMessage,
        {
          temperature: selectedModel.settings?.temperature || 0.7,
          max_tokens: selectedModel.settings?.max_tokens || 2048,
        },
      );

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setResponseMetadata(result.metadata);

      if (!result.success) {
        setError(result.metadata.error || "Unknown error occurred");
      }
    } catch (error: any) {
      // Enhanced error handling with specific error types
      let errorMessage = "Failed to get response from AI model";
      let errorType = "unknown";

      if (error.response) {
        // Server responded with an error
        const status = error.response.status;
        errorMessage = error.response.data?.message || errorMessage;

        if (status === 401 || status === 403) {
          errorType = "authentication";
          errorMessage = "Authentication error: Please check your API key";
        } else if (status === 429) {
          errorType = "rate_limit";
          errorMessage = "Rate limit exceeded. Please try again later.";
        } else if (status >= 500) {
          errorType = "server";
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        // Request made but no response received
        errorType = "network";
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Error in setting up the request
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);

      // Add error message as AI response with error type
      const errorResponse: ChatMessage = {
        role: "assistant",
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);

      toast({
        title: `Test Failed (${errorType})`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setResponseMetadata(null);
    setError(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedModel) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h3 className="font-medium mb-2">Select a model</h3>
            <p className="text-muted-foreground">
              Choose an AI model from the list to test it
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Chat Interface */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Test Chat with {selectedModel.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </CardTitle>
          <CardDescription>
            Test your AI model with real-time chat to verify it's working
            correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[500px]">
            <ScrollArea className="flex-1 pr-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Send a message to start testing the AI model</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${msg.role === "assistant" ? "items-start" : "items-start"}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === "assistant"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium">
                            {msg.role === "assistant"
                              ? selectedModel.name
                              : "You"}
                          </p>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {selectedModel.name}
                        </p>
                        <div className="flex items-center gap-2 py-2">
                          <Spinner size="sm" />
                          <p className="text-sm text-muted-foreground">
                            Generating response...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <div className="flex gap-2 mt-2">
              <Textarea
                placeholder="Type your message here..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[80px]"
                disabled={isLoading || !selectedModel}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || !selectedModel}
                className="self-end"
              >
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings and Metrics */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Model Settings</CardTitle>
            <CardDescription>
              Current settings for {selectedModel.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Model Information */}
              <div className="space-y-2 mb-4 p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center">
                    Model Information
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            This is the currently selected AI model. You can
                            change settings in the Basic Settings tab.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Provider:</span>
                  <Badge variant="outline" className="font-mono">
                    {selectedModel.provider}
                  </Badge>
                </div>

                {selectedModel.settings?.model_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Model:</span>
                    <Badge variant="outline" className="font-mono">
                      {selectedModel.settings.model_name}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    variant={selectedModel.active ? "secondary" : "destructive"}
                  >
                    {selectedModel.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {selectedModel.is_default && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Default:</span>
                    <Badge variant="secondary">Default Model</Badge>
                  </div>
                )}
              </div>

              {/* Display current settings as read-only */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground">
                    Temperature
                  </span>
                  <Badge variant="outline" className="w-fit">
                    {selectedModel.settings?.temperature || 0.7}
                  </Badge>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground">
                    Max Tokens
                  </span>
                  <Badge variant="outline" className="w-fit">
                    {selectedModel.settings?.max_tokens || 2048}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {responseMetadata && (
          <Card>
            <CardHeader>
              <CardTitle>Response Metrics</CardTitle>
              <CardDescription>
                Performance data from the last test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-muted rounded-md mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">Model:</span>
                    <span className="ml-auto font-mono text-xs">
                      {responseMetadata.model}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">Provider:</span>
                    <span className="ml-auto font-mono text-xs">
                      {responseMetadata.provider}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Response time:</span>
                  <span className="ml-auto font-mono">
                    {responseMetadata.response_time}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Input tokens:</span>
                  <span className="ml-auto font-mono">
                    {responseMetadata.tokens_input}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Output tokens:</span>
                  <span className="ml-auto font-mono">
                    {responseMetadata.tokens_output}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Total tokens:</span>
                  <span className="ml-auto font-mono">
                    {responseMetadata.tokens_input +
                      responseMetadata.tokens_output}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
