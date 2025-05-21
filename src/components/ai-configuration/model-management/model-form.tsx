import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIModelData } from "@/utils/ai-model-service";
import { ModelBasicInfoFields } from "./model-basic-info-fields";
import { ModelApiKeyField } from "./model-api-key-field";
import { ModelSettingsFields } from "./model-settings-fields";
import { ModelDefaultToggle } from "./model-default-toggle";
import { ModelActiveToggle } from "./model-active-toggle";
import { useModelForm } from "@/hooks/use-model-form";
import { ArrowLeft, Server, Settings, Zap } from "lucide-react";
import { useRouter } from "next/router";

interface ModelFormProps {
  initialModel?: AIModelData | null;
  mode?: "create" | "edit";
}

export function ModelForm({ initialModel, mode = "create" }: ModelFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const {
    form,
    isLoading,
    isFetchingModels,
    fetchedModels,
    handleFetchModels,
    handleFormSubmit,
  } = useModelForm({
    initialModel,
    onSubmitSuccess: () => {
      toast({
        title: mode === "create" ? "Model Created" : "Model Updated",
        description: `Successfully ${mode === "create" ? "created" : "updated"} the AI model.`,
        variant: "success",
      });

      // Add a small delay before redirecting to ensure the update is processed
      setTimeout(() => {
        router.push("/ai-configuration/models");
      }, 500);
    },
  });

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          className="mr-2 h-8 w-8 p-0"
          onClick={() => router.push("/ai-configuration/models")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create" ? "Add New AI Model" : "Edit AI Model"}
        </h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            // Prevent default form submission which can cause page refresh
            e.preventDefault();
            form.handleSubmit(handleFormSubmit)(e);
          }}
          className="space-y-6"
        >
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span>Basic Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="connection"
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span>Connection</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Model Settings</span>
              </TabsTrigger>
            </TabsList>

            <Card className="border-none shadow-sm">
              <TabsContent value="basic" className="p-6 space-y-6 mt-0">
                <ModelBasicInfoFields />

                <div className="space-y-4 pt-4 border-t">
                  <ModelDefaultToggle />
                  <ModelActiveToggle />
                </div>
              </TabsContent>

              <TabsContent value="connection" className="p-6 space-y-6 mt-0">
                <ModelApiKeyField
                  onFetchModels={handleFetchModels}
                  isFetching={isFetchingModels}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <ModelSettingsFields
                  fetchedModels={fetchedModels}
                  isLoadingModels={isFetchingModels}
                  autoUpdateModelName={true}
                  onFetchModels={handleFetchModels}
                />
              </TabsContent>
            </Card>
          </Tabs>

          {formError && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    Error saving model
                  </p>
                  <p className="text-sm text-destructive/90">{formError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/ai-configuration/models")}
              className="mr-2"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={(e) => {
                // Additional safeguard against page refresh
                if (isLoading) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {isLoading && <Spinner className="mr-2" size="sm" />}
              {mode === "create" ? "Create Model" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
