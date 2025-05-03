
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData } from "@/utils/ai-model-service";
import { modelFormSchema, ModelFormValues } from "./model-form-schema";
import { ModelBasicInfoFields } from "./model-basic-info-fields";
import { ModelApiKeyField } from "./model-api-key-field";
import { ModelSettingsFields } from "./model-settings-fields";
import { ModelDefaultToggle } from "./model-default-toggle";

interface AIModelDialogProps {
  model?: AIModelData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AIModelData) => Promise<void>;
  isLoading?: boolean;
}

export function AIModelDialog({ 
  model, 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading = false 
}: AIModelDialogProps) {
  // Initialize form with default values or existing model data
  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      name: model?.name || "",
      provider: model?.provider || "",
      description: model?.description || "",
      api_key: model?.api_key || "",
      is_default: model?.is_default || false,
      settings: {
        model_name: model?.settings?.model_name || "",
        temperature: model?.settings?.temperature || 0.7,
        max_tokens: model?.settings?.max_tokens || 2048,
      }
    },
  });

  const handleFormSubmit = async (data: ModelFormValues) => {
    await onSubmit(data as AIModelData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {model ? "Edit AI Model" : "Add New AI Model"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic information */}
            <ModelBasicInfoFields />

            {/* API Key */}
            <ModelApiKeyField />

            {/* Model settings */}
            <ModelSettingsFields />

            {/* Default model toggle */}
            <ModelDefaultToggle />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2" size="sm" />}
                {model ? "Save Changes" : "Create Model"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
