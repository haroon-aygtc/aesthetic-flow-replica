
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import { FollowUpConfigValues } from "./follow-up/follow-up-schema";
import { FollowUpSettingsTab } from "./follow-up/follow-up-settings-tab";
import { FollowUpSuggestionsTab } from "./follow-up/follow-up-suggestions-tab";
import { FollowUpPreview } from "./follow-up/follow-up-preview";
import { useFollowUp } from "@/hooks/use-follow-up";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FollowUpSettings } from "@/utils/follow-up-service";

export function FollowUpEngine() {
  const [activeTab, setActiveTab] = useState("settings");

  // Use the follow-up hook to get data and mutations
  const {
    settings,
    suggestions,
    isLoading,
    hasError,
    updateSettings,
    addSuggestion,
    updateSuggestion,
    deleteSuggestion,
    toggleSuggestionStatus
  } = useFollowUp({
    widgetId: 1, // Default widget ID, in production this would come from context or URL params
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" className="mr-2" />
        <p>Loading follow-up configuration...</p>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>
          There was an error loading the follow-up configuration. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Convert settings to form values format
  const configValues: FollowUpConfigValues = {
    enableFollowUp: settings?.enabled || true,
    suggestionsCount: String(settings?.suggestionsCount || 3),
    suggestionsStyle: settings?.suggestionsStyle || "mixed",
    buttonStyle: settings?.buttonStyle || "rounded",
    customPrompt: settings?.customPrompt || "",
    contexts: settings?.contexts || ["all"],
    position: settings?.position || "end"
  };

  // Function to handle settings update
  const handleSettingsUpdate = (values: FollowUpConfigValues) => {
    // Convert form values to API format
    const apiSettings: FollowUpSettings = {
      widgetId: 1, // Default widget ID
      enabled: values.enableFollowUp,
      position: values.position,
      suggestionsCount: parseInt(values.suggestionsCount),
      suggestionsStyle: values.suggestionsStyle,
      buttonStyle: values.buttonStyle,
      contexts: values.contexts,
      customPrompt: values.customPrompt || '',
    };

    // Call the API to update settings
    updateSettings(apiSettings);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Follow-Up Engine</CardTitle>
          <CardDescription>
            Configure how your AI assistant suggests follow-up questions to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Configuration</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions Library</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-6 pt-6">
              <FollowUpSettingsTab
                defaultValues={configValues}
                onSubmit={handleSettingsUpdate}
              />
            </TabsContent>

            <TabsContent value="suggestions" className="pt-6">
              <FollowUpSuggestionsTab
                suggestions={suggestions || []}
                onAddSuggestion={(suggestion) => addSuggestion(1, suggestion)}
                onUpdateSuggestion={updateSuggestion}
                onDeleteSuggestion={deleteSuggestion}
                onToggleStatus={toggleSuggestionStatus}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>
            See how your follow-up suggestions will appear to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FollowUpPreview
            config={configValues}
            suggestions={suggestions || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
