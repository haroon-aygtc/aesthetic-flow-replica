import React, { useEffect } from "react";
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
import { ModelBasicInfoFields } from "./model-basic-info-fields";
import { ModelApiKeyField } from "./model-api-key-field";
import { ModelSettingsFields } from "./model-settings-fields";
import { ModelDefaultToggle } from "./model-default-toggle";
import { ModelActiveToggle } from "./model-active-toggle";
import { useModelForm } from "@/hooks/use-model-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Zap } from "lucide-react";

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
  // Use our shared model form hook
  const {
    form,
    isFetchingModels,
    fetchedModels,
    handleFetchModels,
    handleFormSubmit,
    setModel
  } = useModelForm({
    initialModel: model || null, 
    onSubmitSuccess: () => {
      onOpenChange(false);
    }
  });
  
  // Update the model when it changes
  useEffect(() => {
    setModel(model || null);
    
    if (model) {
      form.reset({
        name: model.name || "",
        provider: model.provider || "",
        description: model.description || "",
        api_key: model.api_key || "",
        is_default: model.is_default || false,
        active: model.active !== false,
        fallback_model_id: model.fallback_model_id || null,
        confidence_threshold: model.confidence_threshold || 0.7,
        settings: {
          model_name: model.settings?.model_name || "",
          temperature: model.settings?.temperature || 0.7,
          max_tokens: model.settings?.max_tokens || 2048,
          top_p: model.settings?.top_p || 1.0,
          frequency_penalty: model.settings?.frequency_penalty || 0.0,
          presence_penalty: model.settings?.presence_penalty || 0.0,
        }
      });
    } else {
      form.reset({
        name: "",
        provider: "",
        description: "",
        api_key: "",
        is_default: false,
        active: true,
        fallback_model_id: null,
        confidence_threshold: 0.7,
        settings: {
          model_name: "",
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }
      });
    }
  }, [model, form, setModel]);
  
  // Custom form submit handler to use the provided onSubmit function
  const customSubmit = async (data: any) => {
    await onSubmit(data as AIModelData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {model ? "Edit AI Model" : "Add New AI Model"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(customSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="basic">
                  <Zap className="h-4 w-4 mr-2" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Settings className="h-4 w-4 mr-2" />
                  Model Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                {/* Basic information */}
                <ModelBasicInfoFields />

                {/* API Key */}
                <ModelApiKeyField 
                  onFetchModels={handleFetchModels} 
                  isFetching={isFetchingModels}
                />
                
                {/* Toggles */}
                <div className="space-y-4">
                  {/* Default model toggle */}
                  <ModelDefaultToggle />

                  {/* Active model toggle */}
                  <ModelActiveToggle />
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6">
                {/* Model settings */}
                <ModelSettingsFields 
                  fetchedModels={fetchedModels}
                  isLoadingModels={isFetchingModels}
                  autoUpdateModelName={true}
                  onFetchModels={handleFetchModels}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isFetchingModels}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isFetchingModels}
                className="min-w-[120px]"
              >
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
