import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { modelFormSchema, ModelFormValues } from "@/components/ai-configuration/model-management/model-form-schema";
import api from "@/utils/api";
import { z } from "zod";
import { getModelOptions } from "@/components/ai-configuration/model-management/model-provider-options";

interface ModelOption {
  value: string;
  label: string;
}

interface UseModelFormProps {
  initialModel?: AIModelData | null;
  onSubmitSuccess?: () => void;
}

export function useModelForm({ initialModel, onSubmitSuccess }: UseModelFormProps = {}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<ModelOption[]>([]);
  const [model, setModel] = useState<AIModelData | null>(initialModel || null);
  const [modelCache, setModelCache] = useState<Record<string, ModelOption[]>>({});

  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      name: initialModel?.name || "",
      provider: initialModel?.provider || "",
      description: initialModel?.description || "",
      api_key: initialModel?.api_key || "",
      is_default: initialModel?.is_default || false,
      active: initialModel?.active !== false,
      fallback_model_id: initialModel?.fallback_model_id || null,
      confidence_threshold: initialModel?.confidence_threshold || 0.7,
      settings: {
        model_name: initialModel?.settings?.model_name || "",
        temperature: initialModel?.settings?.temperature || 0.7,
        max_tokens: initialModel?.settings?.max_tokens || 2048,
        top_p: initialModel?.settings?.top_p || 1,
        frequency_penalty: initialModel?.settings?.frequency_penalty || 0,
        presence_penalty: initialModel?.settings?.presence_penalty || 0,
      }
    },
  });

  // Function to fetch models from the provider API
  const handleFetchModels = async () => {
    const tempModel = form.getValues();

    if (!tempModel.provider || !tempModel.api_key) {
      toast({
        title: "Missing Information",
        description: "Provider and API key are required to fetch models.",
        variant: "destructive",
      });
      return;
    }

    // Check if we already have cached models for this provider/key
    const cacheKey = `${tempModel.provider}-${tempModel.api_key}`;
    if (modelCache[cacheKey]) {
      setFetchedModels(modelCache[cacheKey]);
      form.setValue('settings.model_name', modelCache[cacheKey][0]?.value || '');

      toast({
        title: "Models Retrieved",
        description: `Loaded ${modelCache[cacheKey].length} models from cache.`,
        variant: "success",
      });

      return;
    }

    setIsFetchingModels(true);

    try {
      // If we already have an ID, update the existing model
      if (model?.id) {
        const response = await api.post(`/ai-models/${model.id}/discover-models`, {
          provider: tempModel.provider,
          api_key: tempModel.api_key
        });

        const result = response.data;

        if (result.success && result.data?.models) {
          // Convert the models array to options format with labels
          const options = result.data.models.map((modelName: string) => {
            // Determine if model is free or restricted
            const isFree = modelName.toLowerCase().includes('free') ||
                         (tempModel.provider.toLowerCase() === 'openai' && modelName.includes('gpt-3.5'));
            const isRestricted = modelName.toLowerCase().includes('restrict') ||
                               (tempModel.provider.toLowerCase() === 'openai' && modelName.includes('gpt-4-vision'));

            // Create label from model name
            const label = modelName.includes('/')
              ? modelName.split('/').pop()
              : modelName;

            return {
              value: modelName,
              label: label || modelName,
              isFree,
              isRestricted
            };
          });

          // Save to cache
          setModelCache(prev => ({
            ...prev,
            [cacheKey]: options
          }));

          setFetchedModels(options);

          // Set the current model in the form if it exists
          if (result.data.current_model) {
            form.setValue('settings.model_name', result.data.current_model);
          } else if (options.length > 0) {
            // Otherwise set to the first model
            form.setValue('settings.model_name', options[0].value);
          }

          toast({
            title: "Models Fetched",
            description: `Successfully retrieved ${options.length} models from the provider.`,
            variant: "success"
          });
        } else {
          toast({
            title: "Failed to Fetch Models",
            description: result.message || "Could not retrieve models from the provider",
            variant: "destructive"
          });
        }
      } else {
        // For new models, create a temporary model to test
        try {
          const response = await api.post('/ai-test', {
            provider: tempModel.provider,
            api_key: tempModel.api_key
          });

          const result = response.data;

          if (result.success && result.data?.models) {
            // Convert the models array to options format with labels
            const options = result.data.models.map((modelName: string) => {
              // Determine if model is free or restricted
              const isFree = modelName.toLowerCase().includes('free') ||
                           (tempModel.provider.toLowerCase() === 'openai' && modelName.includes('gpt-3.5'));
              const isRestricted = modelName.toLowerCase().includes('restrict') ||
                                 (tempModel.provider.toLowerCase() === 'openai' && modelName.includes('gpt-4-vision'));

              // Create label from model name
              const label = modelName.includes('/')
                ? modelName.split('/').pop()
                : modelName;

              return {
                value: modelName,
                label: label || modelName,
                isFree,
                isRestricted
              };
            });

            // Save to cache
            setModelCache(prev => ({
              ...prev,
              [cacheKey]: options
            }));

            setFetchedModels(options);

            if (options.length > 0) {
              form.setValue('settings.model_name', options[0].value);
            }

            toast({
              title: "Connection Successful",
              description: `Successfully connected to ${tempModel.provider} and retrieved ${options.length} models.`,
              variant: "success"
            });
          } else {
            // First API endpoint failed, try alternative test endpoint
            try {
              const alternativeResponse = await api.post('/ai-test-inference', {
                provider: tempModel.provider,
                api_key: tempModel.api_key
              });

              const alternativeResult = alternativeResponse.data;

              if (alternativeResult.success) {
                toast({
                  title: "Connection Verified",
                  description: `Successfully connected to ${tempModel.provider}, but couldn't retrieve model list. Using default models.`,
                  variant: "default"
                });

                // Use static model options as fallback
                const staticOptions = getModelOptions(tempModel.provider);
                setFetchedModels(staticOptions);

                if (staticOptions.length > 0) {
                  form.setValue('settings.model_name', staticOptions[0].value);
                }
              } else {
                throw new Error(alternativeResult.message || "API connection failed");
              }
            } catch (error) {
              console.error("Alternative API test failed:", error);
              toast({
                title: "Connection Failed",
                description: `Could not connect to ${tempModel.provider}. Please check your API key and try again.`,
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error("API test failed:", error);
          toast({
            title: "Connection Failed",
            description: `Could not connect to ${tempModel.provider}. Please check your API key and try again.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching models.",
        variant: "destructive"
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Clear fetched models when provider changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'provider') {
        setFetchedModels([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  const handleFormSubmit = async (data: ModelFormValues) => {
    setIsLoading(true);

    try {
      if (model?.id) {
        // Update existing model - ensure we're passing the ID in the data
        const modelData = {
          ...data,
          id: model.id // Explicitly include the ID to ensure we're updating the right model
        } as AIModelData;

        // Log the update operation for debugging
        console.log("Updating existing model with ID:", model.id);

        // Make sure we're not creating a duplicate by explicitly using the update endpoint
        const updatedModel = await aiModelService.updateModel(model.id, modelData);

        console.log("Model updated successfully:", updatedModel);

        toast({
          title: "Model Updated",
          description: `Successfully updated model "${data.name}".`,
          variant: "success"
        });
      } else {
        // Create new model
        console.log("Creating new model:", data.name);
        const newModel = await aiModelService.createModel(data as AIModelData);

        console.log("Model created successfully:", newModel);

        toast({
          title: "Model Created",
          description: `Successfully created model "${data.name}".`,
          variant: "success"
        });
      }

      // Add a small delay before calling the success callback
      // This ensures any backend operations have time to complete
      setTimeout(() => {
        // Call the success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }, 300);
    } catch (error: any) {
      console.error("Form submission error:", error);

      toast({
        title: "Submission Failed",
        description: error.message || "There was an error saving the model. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isFetchingModels,
    fetchedModels,
    handleFetchModels,
    handleFormSubmit,
    setModel
  };
}