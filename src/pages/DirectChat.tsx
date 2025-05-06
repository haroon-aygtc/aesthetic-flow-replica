import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Zap, Clock, Hash, AlertCircle, RefreshCw } from "lucide-react";
import { ModelSelector } from "@/components/ai-configuration/model-management/model-selector";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export function DirectChat() {
  const [models, setModels] = useState<AIModelData[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelData | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMetadata, setResponseMetadata] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update model settings when selected model changes
  useEffect(() => {
    if (selectedModel) {
      setTemperature(selectedModel.settings?.temperature || 0.7);
      setMaxTokens(selectedModel.settings?.max_tokens || 2048);
    }
  }, [selectedModel]);

  const fetchModels = async () => {
    setIsLoadingModels(true);
    try {
      const modelsList = await aiModelService.getModels();
      setModels(modelsList.filter(model => model.active));
      
      // Select the default model if available
      const defaultModel = modelsList.find(model => model.is_default);
      if (defaultModel) {
        setSelectedModelId(defaultModel.id || null);
        setSelectedModel(defaultModel);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      toast({
        title: "Error",
        description: "Failed to fetch AI models. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    const id = Number(modelId);
    setSelectedModelId(id);
    const model = models.find(m => m.id === id);
    if (model) {
      setSelectedModel(model);
    }
  };

  const handleModelNameChange = (modelName: string) => {
    if (!selectedModel) return;
    
    // Update the model settings with the new model name
    const updatedSettings = {
      ...selectedModel.settings,
      model_name: modelName
    };
    
    // Update the selected model
    const updatedModel = {
      ...selectedModel,
      settings: updatedSettings
    };
    
    setSelectedModel(updatedModel);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!selectedModel?.id || !inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };
    
    // Add system prompt if provided and not already added
    const updatedMessages = [...messages];
    const hasSystemPrompt = messages.some(msg => msg.role === "system");
    
    if (systemPrompt && !hasSystemPrompt) {
      updatedMessages.unshift({
        role: "system",
        content: systemPrompt
      });
    }
    
    updatedMessages.push(userMessage);
    setMessages(updatedMessages);
    setInputMessage("");
    setError(null);
    setIsLoading(true);
    
    try {
      // Format messages for API
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const result = await aiModelService.testChat(selectedModel.id, inputMessage, {
        temperature,
        max_tokens: maxTokens,
        system_prompt: systemPrompt
      });
      
      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.response,
        timestamp: new Date()
      };
      
      setMessages([...updatedMessages, assistantMessage]);
      setResponseMetadata(result.metadata);
      
      if (!result.success) {
        setError(result.metadata.error || "Unknown error occurred");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || "Failed to get response from AI model");
      toast({
        title: "Chat Failed",
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

  const clearChat = () => {
    setMessages([]);
    setResponseMetadata(null);
    setError(null);
  };

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Direct AI Chat</CardTitle>
          <CardDescription>
            Test and interact with your configured AI models directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Model Selection and Settings */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Model Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-select">Select AI Model</Label>
                    {isLoadingModels ? (
                      <div className="flex items-center gap-2 py-2">
                        <Spinner size="sm" />
                        <span className="text-sm text-muted-foreground">Loading models...</span>
                      </div>
                    ) : (
                      <Select
                        value={selectedModelId?.toString() || ""}
                        onValueChange={handleModelChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id?.toString() || ""}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {selectedModel && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Provider:</strong> {selectedModel.provider}</p>
                        <p><strong>Description:</strong> {selectedModel.description || "No description available"}</p>
                      </div>
                      
                      <div className="pt-2">
                        <ModelSelector 
                          selectedModel={selectedModel}
                          onModelSelect={handleModelNameChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      placeholder="Enter system instructions..."
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="min-h-[80px]"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
                    <Slider 
                      id="temperature"
                      min={0} 
                      max={1} 
                      step={0.1} 
                      value={[temperature]} 
                      onValueChange={(value) => setTemperature(value[0])}
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Precise</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Max Tokens</Label>
                    <Input 
                      id="max-tokens"
                      type="number" 
                      value={maxTokens} 
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      min={1}
                      max={8000}
                      disabled={isLoading}
                    />
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={clearChat}
                    disabled={isLoading || messages.length === 0}
                  >
                    Clear Chat
                  </Button>
                </CardContent>
              </Card>

              {responseMetadata && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Response Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
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

            {/* Chat Area */}
            <div className="lg:col-span-3 flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Chat</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchModels}
                      disabled={isLoadingModels}
                    >
                      {isLoadingModels ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Refresh Models
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center p-4">
                        <div className="space-y-2">
                          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
                          <h3 className="text-lg font-medium">No messages yet</h3>
                          <p className="text-sm text-muted-foreground">
                            Select a model and start chatting to test your AI models
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        message.role !== "system" && (
                          <div key={index} className={`flex gap-3 ${message.role === "assistant" ? "bg-muted/30 p-3 rounded-lg" : ""}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${message.role === "assistant" ? "bg-primary" : "bg-secondary"}`}>
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {message.role === "assistant" ? selectedModel?.name || "AI" : "You"}
                              </p>
                              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                              {message.timestamp && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      ))
                    )}

                    {isLoading && (
                      <div className="flex gap-3 bg-muted/30 p-3 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{selectedModel?.name || "AI"}</p>
                          <div className="flex items-center gap-2 py-2">
                            <Spinner size="sm" />
                            <p className="text-sm text-muted-foreground">Generating response...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="pt-4 mt-auto">
                    <div className="flex gap-2">
                      <Textarea 
                        placeholder={selectedModelId ? "Type your message here..." : "Please select a model first"}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-h-[80px]"
                        disabled={isLoading || !selectedModelId}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !inputMessage.trim() || !selectedModelId} 
                        className="self-end"
                      >
                        {isLoading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DirectChat;
