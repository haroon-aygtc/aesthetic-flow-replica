
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

import { Settings, Key, AlertCircle, Info } from "lucide-react";

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  recommended: boolean;
}

export function AIModelManager() {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");
  const [temperature, setTemperature] = useState<number[]>([0.7]);
  const [maxTokens, setMaxTokens] = useState<number[]>([2048]);
  const [apiKey, setApiKey] = useState<string>("");
  const [isAPIKeyValid, setIsAPIKeyValid] = useState<boolean | null>(null);

  // Mock data - would come from API later
  const modelOptions: ModelOption[] = [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      description: "The most powerful model for general use and vision capabilities",
      maxTokens: 8192,
      recommended: true
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "OpenAI",
      description: "Smaller, faster and more cost-effective than GPT-4o",
      maxTokens: 8192,
      recommended: false
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      provider: "Google",
      description: "Google's most capable model for text, code, and reasoning",
      maxTokens: 8192,
      recommended: false
    },
    {
      id: "claude-3-opus",
      name: "Claude 3 Opus",
      provider: "Anthropic",
      description: "Anthropic's most capable model for complex tasks",
      maxTokens: 100000,
      recommended: false
    },
    {
      id: "llama-3-70b",
      name: "Llama 3 (70B)",
      provider: "Meta",
      description: "Open source large language model from Meta",
      maxTokens: 8192,
      recommended: false
    }
  ];

  const handleAPIKeySave = () => {
    // This would validate with the backend in a real implementation
    if (apiKey.length > 20) {
      setIsAPIKeyValid(true);
      toast({
        title: "API Key Updated",
        description: "Your API key has been saved successfully."
      });
    } else {
      setIsAPIKeyValid(false);
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key for the selected provider.",
        variant: "destructive"
      });
    }
  };

  const handleSaveConfiguration = () => {
    toast({
      title: "Configuration Saved",
      description: `Model ${selectedModel} configured with temperature ${temperature[0]} and max tokens ${maxTokens[0]}.`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Model Selection
          </CardTitle>
          <CardDescription>
            Choose which AI model powers your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedModel} 
            onValueChange={setSelectedModel}
            className="grid gap-4 md:grid-cols-2"
          >
            {modelOptions.map((model) => (
              <div key={model.id} className="relative">
                <RadioGroupItem
                  value={model.id}
                  id={model.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={model.id}
                  className="flex flex-col h-full p-4 border rounded-md cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{model.name}</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full">{model.provider}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                    <span>Max Tokens: {model.maxTokens.toLocaleString()}</span>
                    {model.recommended && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">Recommended</span>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Management
            </CardTitle>
            <CardDescription>
              Configure your API keys for the selected model provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key for {modelOptions.find(m => m.id === selectedModel)?.provider}</Label>
                <div className="mt-1 flex">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={isAPIKeyValid === false ? "border-red-500" : ""}
                  />
                  <Button 
                    onClick={handleAPIKeySave} 
                    className="ml-2"
                  >
                    Save Key
                  </Button>
                </div>
                {isAPIKeyValid === false && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Invalid API key format
                  </p>
                )}
              </div>
              
              <Alert className="bg-muted/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your API key is stored securely and is never shared with third parties.
                  See our <a href="#" className="underline">documentation</a> for more details.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration Parameters
            </CardTitle>
            <CardDescription>
              Adjust parameters to control AI behavior and output
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">
                    Temperature: {temperature[0].toFixed(1)}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">
                        Controls randomness: lower values produce more predictable responses,
                        higher values more creative ones. Range from 0 to 1.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={temperature}
                  onValueChange={setTemperature}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-tokens">
                    Max Output Tokens: {maxTokens[0]}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">
                        Limits the number of tokens in the model's response. One token is roughly 4 characters.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Slider
                  id="max-tokens"
                  min={100}
                  max={4096}
                  step={100}
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Brief</span>
                  <span>Moderate</span>
                  <span>Detailed</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSaveConfiguration}
              >
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
