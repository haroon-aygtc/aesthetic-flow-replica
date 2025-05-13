import React, { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { getModelOptions } from "./model-provider-options";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, ChevronsUpDown, RefreshCw, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface ModelOption {
  value: string;
  label: string;
  isFree?: boolean;
  isRestricted?: boolean;
  isCustom?: boolean;
}

interface ModelSettingsFieldsProps {
  fetchedModels?: ModelOption[];
  isLoadingModels?: boolean;
  autoUpdateModelName?: boolean;
  onFetchModels?: () => Promise<void>;
}

// Helper function to create a professional name from provider and model
const generateModelName = (provider: string, modelName: string): string => {
  if (!provider || !modelName) return '';
  
  // Format provider name to be more readable
  let formattedProvider = provider
    .charAt(0).toUpperCase() + provider.slice(1)
    .replace(/([A-Z])/g, ' $1')
    .trim();
  
  // Handle special case providers
  if (provider.toLowerCase() === 'openai') {
    formattedProvider = 'OpenAI';
  } else if (provider.toLowerCase() === 'anthropic') {
    formattedProvider = 'Anthropic';
  } else if (provider.toLowerCase() === 'google') {
    formattedProvider = 'Google';
  } else if (provider.toLowerCase() === 'mistral') {
    formattedProvider = 'Mistral AI';
  } else if (provider.toLowerCase() === 'cohere') {
    formattedProvider = 'Cohere';
  }
  
  // Format the model name - remove provider prefix if it exists
  let formattedModelName = modelName;
  
  // Handle model names with provider prefixes (e.g., openai/gpt-4, google/gemini-pro)
  if (modelName.includes('/')) {
    formattedModelName = modelName.split('/').pop() || modelName;
  }
  
  // Clean up the model name for display
  formattedModelName = formattedModelName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  
  // Format specific well-known models
  if (formattedModelName.toLowerCase().includes('gpt')) {
    // Ensure GPT is properly capitalized
    formattedModelName = formattedModelName
      .replace(/\bgpt\b/i, 'GPT')
      .replace(/\bgpt(\d+)\b/i, 'GPT-$1');
  } else if (formattedModelName.toLowerCase().includes('claude')) {
    // Format Claude models
    formattedModelName = formattedModelName
      .replace(/\bclaude\b/i, 'Claude')
      .replace(/\bclaude(\d+)\b/i, 'Claude $1');
  }
  
  return `${formattedProvider} - ${formattedModelName}`;
};

// Define provider-specific recommendations
interface ProviderRecommendations {
  temperature: {
    min: number;
    max: number;
    recommended: number;
    creative: number;
    precise: number;
  };
  maxTokens: {
    min: number;
    max: number;
    recommended: number;
    description: string;
  };
}

const providerRecommendations: Record<string, ProviderRecommendations> = {
  openai: {
    temperature: {
      min: 0,
      max: 2,
      recommended: 0.7,
      creative: 1.0,
      precise: 0.2
    },
    maxTokens: {
      min: 1,
      max: 16000,
      recommended: 4000,
      description: "GPT-4 Turbo supports up to 16K tokens, GPT-3.5 Turbo up to 4K"
    }
  },
  anthropic: {
    temperature: {
      min: 0,
      max: 1,
      recommended: 0.7,
      creative: 1.0,
      precise: 0.1
    },
    maxTokens: {
      min: 1,
      max: 100000,
      recommended: 4000,
      description: "Claude 3 Opus supports up to 100K tokens"
    }
  },
  google: {
    temperature: {
      min: 0,
      max: 1,
      recommended: 0.4,
      creative: 0.8,
      precise: 0.1
    },
    maxTokens: {
      min: 1,
      max: 8000,
      recommended: 2048,
      description: "Gemini models support up to 8K tokens for responses"
    }
  },
  mistral: {
    temperature: {
      min: 0,
      max: 1,
      recommended: 0.5,
      creative: 0.7,
      precise: 0.1
    },
    maxTokens: {
      min: 1,
      max: 4000,
      recommended: 2048,
      description: "Mistral models typically support up to 4K tokens for responses"
    }
  },
  cohere: {
    temperature: {
      min: 0,
      max: 2,
      recommended: 0.7,
      creative: 1.2,
      precise: 0.1
    },
    maxTokens: {
      min: 1,
      max: 4000,
      recommended: 2048,
      description: "Cohere Command models support up to 4K tokens for responses"
    }
  },
  default: {
    temperature: {
      min: 0,
      max: 1,
      recommended: 0.7,
      creative: 0.9,
      precise: 0.2
    },
    maxTokens: {
      min: 1,
      max: 8000,
      recommended: 2048,
      description: "Default token limit varies by model"
    }
  }
};

export const ModelSettingsFields: React.FC<ModelSettingsFieldsProps> = ({ 
  fetchedModels = [],
  isLoadingModels = false,
  autoUpdateModelName = true,
  onFetchModels
}) => {
  const form = useFormContext();
  const { toast } = useToast();
  const selectedProvider = useWatch({
    control: form.control,
    name: "provider",
  });
  
  const selectedModelName = useWatch({
    control: form.control,
    name: "settings.model_name",
  });
  
  const currentModelName = useWatch({
    control: form.control,
    name: "name"
  });

  // State for model combobox
  const [modelCommandOpen, setModelCommandOpen] = useState(false);
  
  // Add state for dynamic provider parameters
  const [providerParameters, setProviderParameters] = useState<any>(null);
  const [isLoadingParameters, setIsLoadingParameters] = useState(false);
  
  // Get the appropriate recommendations - either from API or fallback to hardcoded
  const recommendations = providerParameters || providerRecommendations[selectedProvider?.toLowerCase() || ''] || providerRecommendations.default;
  
  // Auto-update model name when provider or model selection changes
  useEffect(() => {
    if (!autoUpdateModelName || !selectedProvider || !selectedModelName) return;
    
    // Generate a name based on the selected provider and model
    const generatedName = generateModelName(selectedProvider, selectedModelName);
    
    // Always set the name automatically since the field is readonly
    if (generatedName) {
      form.setValue("name", generatedName);
    }
  }, [selectedProvider, selectedModelName, form, autoUpdateModelName]);
  
  // Fetch provider parameters when provider changes
  useEffect(() => {
    if (!selectedProvider) return;
    
    setIsLoadingParameters(true);
    
    fetch(`/api/providers/${selectedProvider}/parameters`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProviderParameters({
            temperature: {
              min: data.data.temperature?.config?.min || 0,
              max: data.data.temperature?.config?.max || 1,
              recommended: data.data.temperature?.config?.presets?.balanced || 0.7,
              creative: data.data.temperature?.config?.presets?.creative || 0.9,
              precise: data.data.temperature?.config?.presets?.precise || 0.2
            },
            maxTokens: {
              min: data.data.maxTokens?.config?.min || 1,
              max: data.data.maxTokens?.config?.max || 8000,
              recommended: data.data.maxTokens?.default || 2048,
              description: data.data.maxTokens?.description || "Default token limit varies by model"
            }
          });
          
          // Set default values if not already set
          if (data.data.temperature && !form.getValues("settings.temperature")) {
            form.setValue("settings.temperature", data.data.temperature.default);
          }
          
          if (data.data.maxTokens && !form.getValues("settings.max_tokens")) {
            form.setValue("settings.max_tokens", data.data.maxTokens.default);
          }
          
          if (data.data.topP && !form.getValues("settings.top_p")) {
            form.setValue("settings.top_p", data.data.topP.default);
          }
          
          if (data.data.frequencyPenalty && !form.getValues("settings.frequency_penalty")) {
            form.setValue("settings.frequency_penalty", data.data.frequencyPenalty.default);
          }
          
          if (data.data.presencePenalty && !form.getValues("settings.presence_penalty")) {
            form.setValue("settings.presence_penalty", data.data.presencePenalty.default);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching provider parameters:", err);
      })
      .finally(() => {
        setIsLoadingParameters(false);
      });
  }, [selectedProvider, form]);
  
  // Auto-update recommended values when provider changes (fallback to hardcoded)
  useEffect(() => {
    if (!selectedProvider) return;
    
    // Only set these values if they haven't been explicitly set by the user yet
    // and if we don't have dynamic parameters from the API
    if (!providerParameters) {
      const recs = providerRecommendations[selectedProvider?.toLowerCase() || ''] || providerRecommendations.default;
      
      if (!form.getValues("settings.temperature")) {
        form.setValue("settings.temperature", recs.temperature.recommended);
      }
      
      if (!form.getValues("settings.max_tokens")) {
        form.setValue("settings.max_tokens", recs.maxTokens.recommended);
      }
    }
  }, [selectedProvider, form, providerParameters]);
  
  // Get static model options as a fallback
  const staticModelOptions = getModelOptions(selectedProvider);
  
  // Use fetched models if available, otherwise use static options
  const modelOptions = fetchedModels.length > 0 ? fetchedModels : staticModelOptions;

  // Organize models by category (free, restricted, etc.)
  const categorizeModels = (models: ModelOption[]) => {
    const freeModels: ModelOption[] = [];
    const restrictedModels: ModelOption[] = [];
    const otherModels: ModelOption[] = [];
    
    models.forEach(model => {
      if (model.isFree || model.label.includes('Free')) {
        freeModels.push({...model, isFree: true});
      } else if (model.isRestricted || model.label.includes('Restricted')) {
        restrictedModels.push({...model, isRestricted: true});
      } else {
        otherModels.push(model);
      }
    });
    
    return { freeModels, restrictedModels, otherModels };
  };
  
  const { freeModels, restrictedModels, otherModels } = categorizeModels(modelOptions);
  
  if (!selectedProvider) {
    return null;
  }
  
  const handlePreciseClick = () => {
    form.setValue("settings.temperature", recommendations.temperature.precise);
  };
  
  const handleBalancedClick = () => {
    form.setValue("settings.temperature", recommendations.temperature.recommended);
  };
  
  const handleCreativeClick = () => {
    form.setValue("settings.temperature", recommendations.temperature.creative);
  };
  
  return (
    <div className="space-y-6 border p-4 rounded-md">
      <h3 className="font-medium">Model Settings</h3>
      
      {/* Model name selection */}
      <FormField
        control={form.control}
        name="settings.model_name"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
            <FormLabel>Model</FormLabel>
              {onFetchModels && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onFetchModels();
                    toast({
                      title: "Fetching Models",
                      description: "Retrieving available models from the provider...",
                      variant: "default",
                    });
                  }}
                  disabled={isLoadingModels}
                >
                  {isLoadingModels ? (
                    <>
                      <Skeleton className="h-4 w-4 mr-2" /> Fetching...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" /> Fetch Models
                    </>
                  )}
                </Button>
              )}
            </div>
            {isLoadingModels ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <FormDescription>Loading available models...</FormDescription>
              </div>
            ) : (
              <>
                <Popover open={modelCommandOpen} onOpenChange={setModelCommandOpen}>
                  <PopoverTrigger asChild>
              <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={modelCommandOpen}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? modelOptions.find(
                          (model) => model.value === field.value
                        )?.label || field.value : "Select model"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
              </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-full min-w-[300px]" align="start">
                    <Command className="w-full">
                      <CommandInput placeholder="Search model..." className="h-9" />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>
                          No model found. 
                          {onFetchModels && (
                            <div className="p-2 text-xs">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2" 
                                onClick={onFetchModels}
                              >
                                <RefreshCw className="h-3 w-3 mr-2" /> 
                                Try fetching models
                              </Button>
                            </div>
                          )}
                        </CommandEmpty>
                        
                        {/* Free models */}
                        {freeModels.length > 0 && (
                          <CommandGroup heading="Free Models">
                            {freeModels.map((model) => (
                              <CommandItem
                                key={model.value}
                                value={model.value}
                                onSelect={() => {
                                  form.setValue("settings.model_name", model.value);
                                  setModelCommandOpen(false);
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        model.value === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="font-medium">{model.label}</span>
                                  </div>
                                  <Badge variant="outline" className="bg-green-50 text-green-800 text-xs">Free</Badge>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        
                        {/* Other models */}
                        {otherModels.length > 0 && (
                          <CommandGroup heading="Standard Models">
                            {otherModels.map((model) => (
                              <CommandItem
                                key={model.value}
                                value={model.value}
                                onSelect={() => {
                                  form.setValue("settings.model_name", model.value);
                                  setModelCommandOpen(false);
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    model.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span className="font-medium">{model.label}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        
                        {/* Restricted models */}
                        {restrictedModels.length > 0 && (
                          <CommandGroup heading="Models Requiring Access Approval">
                            {restrictedModels.map((model) => (
                              <CommandItem
                                key={model.value}
                                value={model.value}
                                onSelect={() => {
                                  form.setValue("settings.model_name", model.value);
                                  setModelCommandOpen(false);
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        model.value === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="font-medium">{model.label}</span>
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 text-xs">Restricted</Badge>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {fetchedModels.length > 0 && (
                  <FormDescription>
                    Models fetched from provider
                  </FormDescription>
                )}
                {fetchedModels.length === 0 && (
                  <FormDescription>
                    Using default model list. Click "Fetch Models" to retrieve up-to-date models from the provider.
                  </FormDescription>
                )}
              </>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Temperature setting */}
      {isLoadingParameters ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <FormField
            control={form.control}
            name="settings.temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature</FormLabel>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={recommendations.temperature.min}
                      max={recommendations.temperature.max}
                      step="0.1"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="w-12 text-right font-medium bg-muted px-2 py-1 rounded-md text-foreground">{field.value?.toFixed(1) || '0.0'}</span>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <button
                      type="button"
                      onClick={handlePreciseClick}
                      className={`px-3 py-1 text-xs rounded-full ${
                        Math.abs(field.value - recommendations.temperature.precise) < 0.1 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700' 
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      Precise
                    </button>
                    <button
                      type="button"
                      onClick={handleBalancedClick}
                      className={`px-3 py-1 text-xs rounded-full ${
                        Math.abs(field.value - recommendations.temperature.recommended) < 0.1 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border border-green-300 dark:border-green-700' 
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      Balanced
                    </button>
                    <button
                      type="button"
                      onClick={handleCreativeClick}
                      className={`px-3 py-1 text-xs rounded-full ${
                        Math.abs(field.value - recommendations.temperature.creative) < 0.1 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 border border-purple-300 dark:border-purple-700' 
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      Creative
                    </button>
                  </div>
                  
                  <FormDescription>
                    <span className="block mb-1">Temperature controls randomness:</span>
                    <span className="block text-xs text-muted-foreground">• Low (0-0.3): More predictable, consistent, and factual responses</span>
                    <span className="block text-xs text-muted-foreground">• Medium (0.4-0.7): Balanced between creativity and accuracy</span>
                    <span className="block text-xs text-muted-foreground">• High (0.8+): More creative, diverse, and unexpected responses</span>
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Max tokens */}
          <FormField
            control={form.control}
            name="settings.max_tokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Output Tokens</FormLabel>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || recommendations.maxTokens.recommended)}
                      min={recommendations.maxTokens.min}
                      max={recommendations.maxTokens.max}
                      step="100"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => field.onChange(recommendations.maxTokens.recommended)}
                      className={`px-3 py-1 text-xs whitespace-nowrap rounded-full ${
                        field.value === recommendations.maxTokens.recommended 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border border-green-300 dark:border-green-700' 
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      Recommended
                    </button>
                  </div>
                  
                  <FormDescription>
                    <span className="block mb-1">Max tokens limits the length of the model's response.</span>
                    <span className="block text-xs text-muted-foreground font-medium">{recommendations.maxTokens.description}</span>
                    <span className="block text-xs text-muted-foreground mt-1">• Higher values allow longer responses but may increase costs</span>
                    <span className="block text-xs text-muted-foreground">• 1000 tokens ≈ 750 words</span>
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Top P Parameter */}
          <FormField
            control={form.control}
            name="settings.top_p"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Top P</FormLabel>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="my-2"
                      />
                    </FormControl>
                    <span className="ml-2 w-12 text-right bg-muted px-2 py-1 rounded-md text-foreground">
                      {field.value?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <FormDescription>
                    Controls diversity via nucleus sampling: 1.0 considers all tokens, lower values focus on higher probability tokens.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Frequency Penalty */}
          <FormField
            control={form.control}
            name="settings.frequency_penalty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency Penalty</FormLabel>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <FormControl>
                      <Slider
                        min={0}
                        max={2}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="my-2"
                      />
                    </FormControl>
                    <span className="ml-2 w-12 text-right bg-muted px-2 py-1 rounded-md text-foreground">
                      {field.value?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <FormDescription>
                    Reduces repetition by penalizing tokens that have already appeared in the text.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Presence Penalty */}
          <FormField
            control={form.control}
            name="settings.presence_penalty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presence Penalty</FormLabel>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <FormControl>
                      <Slider
                        min={0}
                        max={2}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="my-2"
                      />
                    </FormControl>
                    <span className="ml-2 w-12 text-right bg-muted px-2 py-1 rounded-md text-foreground">
                      {field.value?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <FormDescription>
                    Encourages the model to talk about new topics by penalizing tokens that have appeared at all.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};
