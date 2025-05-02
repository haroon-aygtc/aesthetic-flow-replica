
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { Suggestion, FollowUpConfigValues } from "./follow-up/follow-up-schema";
import { FollowUpSettingsTab } from "./follow-up/follow-up-settings-tab";
import { FollowUpSuggestionsTab } from "./follow-up/follow-up-suggestions-tab";
import { FollowUpPreview } from "./follow-up/follow-up-preview";

export function FollowUpEngine() {
  const [activeTab, setActiveTab] = useState("settings");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      text: "Tell me more about your pricing",
      category: "pricing",
      context: "product",
      active: true,
    },
    {
      id: "2",
      text: "How does your support work?",
      category: "support",
      context: "service",
      active: true,
    },
    {
      id: "3",
      text: "Do you have a free trial?",
      category: "pricing",
      context: "product",
      active: true,
    },
  ]);
  
  // Default form values
  const defaultConfigValues: FollowUpConfigValues = {
    enableFollowUp: true,
    suggestionsCount: "3",
    suggestionsStyle: "buttons",
    buttonStyle: "rounded",
    customPrompt: "",
    contexts: ["product", "service", "pricing"],
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
              <FollowUpSettingsTab defaultValues={defaultConfigValues} />
            </TabsContent>
            
            <TabsContent value="suggestions" className="pt-6">
              <FollowUpSuggestionsTab 
                suggestions={suggestions} 
                setSuggestions={setSuggestions} 
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
            config={defaultConfigValues} 
            suggestions={suggestions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
