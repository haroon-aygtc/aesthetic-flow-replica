import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  modelFormSchema,
  ModelFormValues,
} from "@/components/ai-configuration/model-management/model-form-schema";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { useToast } from "./use-toast";

interface UseModelFormProps {
  initialModel: AIModelData | null;
  onSubmitSuccess?: () => void;
}

export function useModelForm({
  initialModel,
  onSubmitSuccess,
}: UseModelFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [model, setModel] = useState<AIModelData | null>(initialModel);
  const { toast } = useToast();

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      name: initialModel?.name || "",
      provider: initialModel?.provider || "",
      description: initialModel?.description || "",
      api_key: initialModel?.api_key || "",
      is_default: initialModel?.is_default || false,
      active: initialModel?.active !== false, // Default to true if not explicitly false
      fallback_model_id: initialModel?.fallback_model_id || null,
      confidence_threshold: initialModel?.confidence_threshold || 0.7,
      settings: {
        model_name: initialModel?.settings?.model_name || "",
        temperature: initialModel?.settings?.temperature || 0.7,
        max_tokens: initialModel?.settings?.max_tokens || 2048,
        top_p: initialModel?.settings?.top_p || 1.0,
        frequency_penalty: initialModel?.settings?.frequency_penalty || 0.0,
        presence_penalty: initialModel?.settings?.presence_penalty || 0.0,
      },
    },
  });

  // Update form when initialModel changes
  useEffect(() => {
    if (initialModel) {
      form.reset({
        name: initialModel.name || "",
        provider: initialModel.provider || "",
        description: initialModel.description || "",
        api_key: initialModel.api_key || "",
        is_default: initialModel.is_default || false,
        active: initialModel.active !== false,
        fallback_model_id: initialModel.fallback_model_id || null,
        confidence_threshold: initialModel.confidence_threshold || 0.7,
        settings: {
          model_name: initialModel.settings?.model_name || "",
          temperature: initialModel.settings?.temperature || 0.7,
          max_tokens: initialModel.settings?.max_tokens || 2048,
          top_p: initialModel.settings?.top_p || 1.0,
          frequency_penalty: initialModel.settings?.frequency_penalty || 0.0,
          presence_penalty: initialModel.settings?.presence_penalty || 0.0,
        },
      });
      setModel(initialModel);
    }
  }, [initialModel, form]);

  // Function to fetch available models for a provider
  const handleFetchModels = async () => {
    const apiKey = form.getValues("api_key");
    const provider = form.getValues("provider");

    if (!apiKey || !provider) {
      toast({
        title: "Missing Information",
        description:
          "Please enter both provider and API key to fetch available models.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingModels(true);
    try {
      // If we have an existing model ID, use that to discover models
      if (model?.id) {
        const result = await aiModelService.discoverModels(model.id);
        if (result.success && result.data?.models) {
          setFetchedModels(result.data.models);

          // If there's a current model and it's not already selected, set it
          if (
            result.data.current_model &&
            !form.getValues("settings.model_name")
          ) {
            form.setValue("settings.model_name", result.data.current_model);
          }

          toast({
            title: "Models Retrieved",
            description: `Found ${result.data.models.length} available models.`,
          });
        } else {
          throw new Error(result.message || "Failed to retrieve models");
        }
      }
      // Otherwise create a temporary model to test the connection
      else {
        // This would typically call a backend endpoint to discover models with the provided API key
        // For now, we'll simulate this with a mock response
        toast({
          title: "Connection Test",
          description: "Testing connection with provided API key...",
        });

        // In a real implementation, you would call an API endpoint here
        // const response = await api.post('/api/test-provider-connection', { provider, api_key: apiKey });
        // setFetchedModels(response.data.models);

        // Mock response for demonstration
        setTimeout(() => {
          const mockModels = [
            "gpt-4",
            "gpt-3.5-turbo",
            "text-davinci-003",
            "text-curie-001",
          ];
          setFetchedModels(mockModels);
          toast({
            title: "Models Retrieved",
            description: `Found ${mockModels.length} available models.`,
          });
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error fetching models:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to fetch available models. Please check your API key and provider.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleFormSubmit = async (values: ModelFormValues) => {
    setIsLoading(true);
    setFormError(null);
    try {
      if (initialModel?.id) {
        // Update existing model
        await aiModelService.updateModel(initialModel.id, values);
      } else {
        // Create new model
        await aiModelService.createModel(values);
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("Error saving model:", error);

      // Extract detailed error information
      let errorMessage = "Failed to save the model. Please try again.";

      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        const errorFields = Object.keys(validationErrors);

        if (errorFields.length > 0) {
          const firstError = validationErrors[errorFields[0]];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setFormError(errorMessage);

      toast({
        title: "Error Saving Model",
        description: errorMessage,
        variant: "destructive",
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
    formError,
    setModel,
  };
}
