import { useState, useEffect, useMemo } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { aiModelService } from "@/utils/ai-model-service";
import { RefreshCw, Check, ChevronsUpDown, Lock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModelInfo {
  name: string;
  display_name: string;
  description?: string;
  input_token_limit?: number;
  output_token_limit?: number;
  category?: 'free' | 'standard' | 'restricted';
  supported_features?: {
    streaming?: boolean;
    vision?: boolean;
  };
}

interface ModelSelectorProps {
  selectedModel: any;
  onModelSelect: (modelName: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelSelect, disabled = false }: ModelSelectorProps) {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (selectedModel?.id) {
      loadAvailableModels(selectedModel.id);
    }
  }, [selectedModel?.id]);

  const loadAvailableModels = async (modelId: number) => {
    setIsLoading(true);
    try {
      const response = await aiModelService.getAvailableModels(modelId);
      if (response.success && response.data) {
        setAvailableModels(response.data);
      } else {
        setAvailableModels([]);
      }
    } catch (error) {
      console.error("Failed to load available models:", error);
      toast({
        title: "Error",
        description: "Failed to load available models. Please try again.",
        variant: "destructive"
      });
      setAvailableModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscoverModels = async () => {
    if (!selectedModel?.id) return;

    setIsDiscovering(true);
    try {
      const response = await aiModelService.discoverModels(selectedModel.id);
      if (response.success) {
        toast({
          title: "Success",
          description: `Models discovered successfully. Found ${response.data?.models?.length || 0} models.`
        });
        // Reload available models
        await loadAvailableModels(selectedModel.id);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to discover models.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to discover models:", error);
      toast({
        title: "Error",
        description: "Failed to discover models. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleModelChange = (modelName: string) => {
    onModelSelect(modelName);
    setOpen(false);
  };

  const currentModelName = selectedModel?.settings?.model_name || "";
  const currentModel = availableModels.find(m => m.name === currentModelName);

  // Group models by category
  const modelsByCategory = useMemo(() => {
    if (!availableModels.length) return {};
    
    return availableModels.reduce((acc, model) => {
      const category = model.category || 'standard';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(model);
      return acc;
    }, {} as Record<string, ModelInfo[]>);
  }, [availableModels]);

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!searchQuery) return modelsByCategory;
    
    const query = searchQuery.toLowerCase();
    const result: Record<string, ModelInfo[]> = {};
    
    Object.entries(modelsByCategory).forEach(([category, models]) => {
      const filtered = models.filter(model => 
        model.display_name.toLowerCase().includes(query) || 
        model.name.toLowerCase().includes(query) ||
        (model.description && model.description.toLowerCase().includes(query))
      );
      
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    
    return result;
  }, [modelsByCategory, searchQuery]);

  // Get category display name
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'free': return 'Free Models';
      case 'restricted': return 'Restricted Models (Requires Access)';
      case 'standard': return 'Standard Models';
      default: return 'Other Models';
    }
  };

  // Get category icon and color for badges
  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'free':
        return <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
          <Zap className="h-3 w-3 mr-1" />Free
        </Badge>;
      case 'restricted':
        return <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300">
          <Lock className="h-3 w-3 mr-1" />Restricted
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Model Name:</label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDiscoverModels}
          disabled={isDiscovering || disabled || !selectedModel?.id}
          className="h-8 px-2"
        >
          {isDiscovering ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
          Fetch Models
        </Button>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal relative h-9"
            disabled={isLoading || availableModels.length === 0 || disabled}
          >
            {currentModel ? currentModel.display_name : "Select a model..."}
            {isLoading && (
              <div className="absolute right-8">
                <Spinner size="sm" />
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search models..." value={searchQuery} onValueChange={setSearchQuery} />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              {Object.entries(filteredModels).map(([category, models]) => (
                <CommandGroup key={category} heading={getCategoryName(category)}>
                  {models.map((model) => (
                    <CommandItem
                      key={model.name}
                      value={model.name}
                      onSelect={() => handleModelChange(model.name)}
                      className="flex flex-col items-start"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="truncate">{model.display_name}</span>
                        {model.name === currentModelName && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      {model.description && (
                        <span className="text-xs text-muted-foreground truncate mt-0.5 max-w-full">
                          {model.description.length > 60 
                            ? model.description.substring(0, 60) + '...' 
                            : model.description}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {availableModels.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          No models available. Try discovering models first.
        </p>
      )}

      {currentModelName && currentModel && (
        <div className="text-sm space-y-2 mt-2">
          <div className="flex items-center">
            {getCategoryBadge(currentModel.category)}
            {currentModel.supported_features?.streaming && (
              <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                Streaming
              </Badge>
            )}
            {currentModel.supported_features?.vision && (
              <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300">
                Vision
              </Badge>
            )}
          </div>

          <div className="text-muted-foreground">
            {currentModel.description || ""}
          </div>

          {currentModel.input_token_limit && (
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                Context: {currentModel.input_token_limit.toLocaleString()} tokens
              </span>
              {currentModel.output_token_limit && (
                <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                  Max Output: {currentModel.output_token_limit.toLocaleString()} tokens
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
