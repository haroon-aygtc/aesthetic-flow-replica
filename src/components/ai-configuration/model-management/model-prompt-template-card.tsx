import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Sparkles, Save, Loader2, MessageSquare } from "lucide-react";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { promptTemplateService } from "@/utils/prompt-template-service";
import api from "@/utils/api";
import { PromptTemplateBuilder } from "./prompt-template-builder";

interface ModelPromptTemplateCardProps {
  selectedModel: AIModelData;
  onUpdateModel: (updatedModel: AIModelData) => void;
  isLoading?: boolean;
}

export function ModelPromptTemplateCard({
  selectedModel,
  onUpdateModel,
  isLoading = false
}: ModelPromptTemplateCardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("builder");
  const [promptContent, setPromptContent] = useState("");
  const [availableTemplates, setAvailableTemplates] = useState<{ id: number, name: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(selectedModel?.template_id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load available templates
  useEffect(() => {
    async function loadTemplates() {
      try {
        // Load system prompt templates specifically for AI models
        const response = await promptTemplateService.getSystemPromptTemplates();
        const templates = response.data.map(template => ({
          id: parseInt(template.id),
          name: template.name
        }));
        setAvailableTemplates(templates);
      } catch (error) {
        console.error("Failed to load templates:", error);
        toast({
          title: "Error loading templates",
          description: "Failed to load prompt templates. Please try again later.",
          variant: "destructive"
        });
      }
    }

    // Load templates for the selected model's provider
    async function loadTemplatesForModel() {
      if (selectedModel?.provider) {
        try {
          const response = await promptTemplateService.getTemplatesByAIModel(selectedModel.provider);
          const templates = response.data.map(template => ({
            id: parseInt(template.id),
            name: template.name
          }));

          // Merge with any existing templates, avoiding duplicates
          setAvailableTemplates(prevTemplates => {
            const existingIds = new Set(prevTemplates.map(t => t.id));
            const newTemplates = templates.filter(t => !existingIds.has(t.id));
            return [...prevTemplates, ...newTemplates];
          });
        } catch (error) {
          console.error(`Failed to load templates for provider ${selectedModel.provider}:`, error);
        }
      }
    }

    loadTemplates();
    loadTemplatesForModel();
  }, [toast, selectedModel?.provider]);

  // Load existing template content if model has a template_id
  useEffect(() => {
    async function loadTemplateContent() {
      if (selectedModel?.template_id) {
        try {
          const response = await promptTemplateService.getTemplate(selectedModel.template_id.toString());
          setPromptContent(response.data.content);
          setSelectedTemplateId(selectedModel.template_id);
        } catch (error) {
          console.error("Failed to load template content:", error);
        }
      }
    }

    if (selectedModel?.template_id) {
      loadTemplateContent();
    }
  }, [selectedModel]);

  const handleTemplateChange = async (templateId: string) => {
    const id = parseInt(templateId);
    setSelectedTemplateId(id);

    try {
      const response = await promptTemplateService.getTemplate(templateId);
      setPromptContent(response.data.content);
    } catch (error) {
      console.error("Failed to load template content:", error);
      toast({
        title: "Error loading template",
        description: "Failed to load the selected template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      // Call the API to generate a prompt based on the model
      const response = await api.post('/ai/generate-prompt', {
        model_name: selectedModel?.name || 'AI Assistant',
        model_description: selectedModel?.description || 'General purpose assistant',
        provider: selectedModel?.provider || 'unknown',
        settings: selectedModel?.settings || {}
      });

      // Use the generated prompt from the API
      const generatedPrompt = response.data.prompt || `You are ${selectedModel?.name || 'an AI assistant'}.

Role: ${selectedModel?.description || 'A helpful AI assistant'}
Provider: ${selectedModel?.provider || 'AI service'}

Instructions:
- Respond to user queries in a helpful and accurate manner
- Be concise and clear in your responses
- If you don't know something, admit it clearly
- Maintain a professional and friendly tone
- Respect user privacy and confidentiality`;

      setPromptContent(generatedPrompt);

      toast({
        title: "Prompt generated",
        description: "A new prompt has been generated based on your model settings"
      });
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptContent.trim()) {
      toast({
        title: "Prompt content required",
        description: "Please provide content for your prompt template",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // If we have a selected template, update it
      if (selectedTemplateId) {
        await promptTemplateService.updateTemplate(selectedTemplateId.toString(), {
          content: promptContent
        });
      } else {
        // Create a new template
        const newTemplate = await promptTemplateService.createTemplate({
          name: `${selectedModel.name} Template`,
          description: `System prompt for ${selectedModel.name}`,
          content: promptContent,
          variables: [],
          metadata: {
            tags: ["system-prompt", selectedModel.provider],
            aiModel: [selectedModel.provider],
            version: 1,
            lastModified: new Date(),
            creator: "current-user",
            activationRules: []
          }
        });

        setSelectedTemplateId(parseInt(newTemplate.data.id));
      }

      // Assign the template to the model
      await aiModelService.assignTemplate(
        selectedModel.id as number,
        selectedTemplateId?.toString() || null
      );

      // Update the model in the parent component
      onUpdateModel({
        ...selectedModel,
        template_id: selectedTemplateId
      });

      toast({
        title: "Prompt saved",
        description: "Your prompt template has been saved and assigned to the model"
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save prompt template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTemplateFromBuilder = async (content: string, templateId: number | null) => {
    setPromptContent(content);

    if (templateId) {
      setSelectedTemplateId(templateId);
    }

    try {
      // If we have a selected template, update it
      if (templateId) {
        await promptTemplateService.updateTemplate(templateId.toString(), {
          content: content
        });
      } else {
        // Create a new template
        const newTemplate = await promptTemplateService.createTemplate({
          name: `${selectedModel.name} Template`,
          description: `System prompt for ${selectedModel.name}`,
          content: content,
          variables: [],
          metadata: {
            tags: ["system-prompt", selectedModel.provider],
            aiModel: [selectedModel.provider],
            version: 1,
            lastModified: new Date(),
            creator: "current-user",
            activationRules: []
          }
        });

        const newTemplateId = parseInt(newTemplate.data.id);
        setSelectedTemplateId(newTemplateId);

        // Assign the template to the model
        await aiModelService.assignTemplate(
          selectedModel.id as number,
          newTemplateId.toString()
        );

        // Update the model in the parent component
        onUpdateModel({
          ...selectedModel,
          template_id: newTemplateId
        });
      }

      toast({
        title: "Prompt saved",
        description: "Your prompt template has been saved and assigned to the model"
      });
    } catch (error) {
      console.error("Failed to save template:", error);
      toast({
        title: "Save failed",
        description: "Failed to save prompt template. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Visual Builder</TabsTrigger>
          <TabsTrigger value="raw">Raw Editor</TabsTrigger>
          <TabsTrigger value="existing">Existing Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <PromptTemplateBuilder
            model={selectedModel}
            onSave={handleSaveTemplateFromBuilder}
            isLoading={isSaving || isLoading}
          />
        </TabsContent>

        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Raw Prompt Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-content">Prompt Template</Label>
                  <Textarea
                    id="prompt-content"
                    value={promptContent}
                    onChange={e => setPromptContent(e.target.value)}
                    placeholder="Enter your prompt template here..."
                    rows={12}
                    className="font-mono"
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleGeneratePrompt}
                    disabled={isGenerating}
                    className="flex items-center"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate with AI
                  </Button>

                  <Button
                    onClick={handleSavePrompt}
                    disabled={isSaving || isLoading || !promptContent.trim()}
                    className="flex items-center"
                  >
                    {(isSaving || isLoading) ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Prompt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="existing">
          <Card>
            <CardHeader>
              <CardTitle>Select Existing Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="template-select">Choose a Template</Label>
                  <Select
                    value={selectedTemplateId?.toString() || ""}
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplateId && (
                  <div className="space-y-2">
                    <Label>Template Content</Label>
                    <div className="p-4 border rounded-md bg-muted/20 max-h-[300px] overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">{promptContent}</pre>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSavePrompt}
                  disabled={isSaving || isLoading || !selectedTemplateId}
                  className="flex items-center"
                >
                  {(isSaving || isLoading) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="mr-2 h-4 w-4" />
                  )}
                  Assign Template to Model
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
