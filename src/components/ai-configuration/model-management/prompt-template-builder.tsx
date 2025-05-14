import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sparkles,
  Save,
  Loader2
} from "lucide-react";
import { AIModelData } from "@/utils/ai-model-service";
import { promptTemplateService } from "@/utils/prompt-template-service";
import api from "@/utils/api";

interface PromptTemplateBuilderProps {
  model: AIModelData | null;
  onSave: (templateContent: string, templateId: number | null) => Promise<void>;
  isLoading?: boolean;
}

export function PromptTemplateBuilder({
  model,
  onSave,
  isLoading = false
}: PromptTemplateBuilderProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("raw");
  const [promptContent, setPromptContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<{ id: number, name: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(model?.template_id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [useExistingTemplate, setUseExistingTemplate] = useState(!!model?.template_id);

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

    loadTemplates();
  }, [toast]);

  // Load existing template content if model has a template_id
  useEffect(() => {
    async function loadTemplateContent() {
      if (model?.template_id) {
        try {
          const response = await promptTemplateService.getTemplate(model.template_id.toString());
          setPromptContent(response.data.content);
          setSelectedTemplateId(model.template_id);
        } catch (error) {
          console.error("Failed to load template content:", error);
        }
      } else if (model && selectedBlocks.length === 0) {
        // If no template is assigned but we have a model, pre-select appropriate blocks
        const recommendedBlocks = ["identity", "role", "guidelines", "ethics"];
        setSelectedBlocks(recommendedBlocks);
      }
    }

    if (model?.template_id) {
      loadTemplateContent();
    } else if (model && selectedBlocks.length === 0) {
      // If no template is assigned but we have a model, pre-select appropriate blocks
      const recommendedBlocks = ["identity", "role", "guidelines", "ethics"];
      setSelectedBlocks(recommendedBlocks);
    }
  }, [model, selectedBlocks.length]);

  // Update prompt content when blocks change
  useEffect(() => {
    if (activeTab === "builder") {
      const allBlocks = [...TEMPLATE_BLOCKS, ...customBlocks];
      const selectedBlocksContent = selectedBlocks
        .map(blockId => {
          const block = allBlocks.find(b => b.id === blockId);
          if (!block) return "";

          // Replace placeholders with model data if available
          let content = block.content;
          if (model) {
            content = content
              .replace("[MODEL_NAME]", model.name || "AI Assistant")
              .replace("[PROVIDER]", model.provider || "the provider")
              .replace("[PRIMARY_ROLE]", "assist with " + (model.description || "various tasks"))
              .replace("[SPECIFIC_TASKS]", model.description || "their questions and needs")
              .replace("[TONE]", "professional and friendly")
              .replace("[KNOWLEDGE_SOURCE]", "your training data and knowledge base");
          }

          return content;
        })
        .filter(content => content)
        .join("\n\n");

      setPromptContent(selectedBlocksContent);
    }
  }, [selectedBlocks, customBlocks, activeTab, model]);

  const handleAddBlock = (blockId: string) => {
    if (!selectedBlocks.includes(blockId)) {
      setSelectedBlocks([...selectedBlocks, blockId]);
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    setSelectedBlocks(selectedBlocks.filter(id => id !== blockId));
  };

  const handleAddCustomBlock = () => {
    if (!newBlockName.trim()) {
      toast({
        title: "Block name required",
        description: "Please provide a name for your custom block",
        variant: "destructive"
      });
      return;
    }

    if (!newBlockContent.trim()) {
      toast({
        title: "Block content required",
        description: "Please provide content for your custom block",
        variant: "destructive"
      });
      return;
    }

    const newBlockId = `custom_${Date.now()}`;
    const newBlock = {
      id: newBlockId,
      name: newBlockName,
      content: newBlockContent
    };

    setCustomBlocks([...customBlocks, newBlock]);
    setSelectedBlocks([...selectedBlocks, newBlockId]);
    setNewBlockName("");
    setNewBlockContent("");
  };

  const handleRemoveCustomBlock = (blockId: string) => {
    setCustomBlocks(customBlocks.filter(block => block.id !== blockId));
    setSelectedBlocks(selectedBlocks.filter(id => id !== blockId));
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      // Call the API to generate a prompt based on the model
      const response = await api.post('/ai/generate-prompt', {
        model_name: model?.name || 'AI Assistant',
        model_description: model?.description || 'General purpose assistant',
        provider: model?.provider || 'unknown',
        settings: model?.settings || {}
      });

      // Use the generated prompt from the API
      const generatedPrompt = response.data.prompt || `You are ${model?.name || 'an AI assistant'}.

Role: ${model?.description || 'A helpful AI assistant'}
Provider: ${model?.provider || 'AI service'}

Instructions:
- Respond to user queries in a helpful and accurate manner
- Be concise and clear in your responses
- If you don't know something, admit it clearly
- Maintain a professional and friendly tone
- Respect user privacy and confidentiality`;

      setPromptContent(generatedPrompt);
      setActiveTab("raw");

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
      await onSave(promptContent, useExistingTemplate ? selectedTemplateId : null);

      toast({
        title: "Prompt saved",
        description: "Your prompt template has been saved successfully"
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

  const handleTemplateChange = async (templateId: string) => {
    const id = parseInt(templateId);
    setSelectedTemplateId(id);

    try {
      const response = await promptTemplateService.getTemplate(templateId);
      setPromptContent(response.data.content);
      setActiveTab("raw");
    } catch (error) {
      console.error("Failed to load template content:", error);
      toast({
        title: "Error loading template",
        description: "Failed to load the selected template. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Prompt Template</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="use-existing-template"
              checked={useExistingTemplate}
              onCheckedChange={setUseExistingTemplate}
            />
            <Label htmlFor="use-existing-template">Use existing template</Label>
          </div>

          {useExistingTemplate ? (
            <div className="space-y-4">
              <Select
                value={selectedTemplateId?.toString() || ""}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
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

              {selectedTemplateId && (
                <div className="p-4 border rounded-md bg-muted/20">
                  <pre className="text-sm whitespace-pre-wrap">{promptContent}</pre>
                </div>
              )}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="builder">Block Builder</TabsTrigger>
                <TabsTrigger value="raw">Raw Editor</TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Available Blocks</h3>
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="predefined">
                        <AccordionTrigger>Predefined Blocks</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {TEMPLATE_BLOCKS.map(block => (
                              <div key={block.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-accent/10">
                                <div>
                                  <p className="font-medium">{block.name}</p>
                                  <p className="text-sm text-muted-foreground">{block.description}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddBlock(block.id)}
                                  disabled={selectedBlocks.includes(block.id)}
                                >
                                  {selectedBlocks.includes(block.id) ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="custom">
                        <AccordionTrigger>Custom Blocks</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {customBlocks.length > 0 ? (
                              <div className="space-y-2">
                                {customBlocks.map(block => (
                                  <div key={block.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-accent/10">
                                    <div>
                                      <p className="font-medium">{block.name}</p>
                                      <p className="text-sm text-muted-foreground line-clamp-1">{block.content}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddBlock(block.id)}
                                        disabled={selectedBlocks.includes(block.id)}
                                      >
                                        {selectedBlocks.includes(block.id) ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <Plus className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete custom block</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete this custom block? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemoveCustomBlock(block.id)}>
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No custom blocks created yet.</p>
                            )}

                            <Separator />

                            <div className="space-y-2">
                              <Label htmlFor="new-block-name">Block Name</Label>
                              <Input
                                id="new-block-name"
                                value={newBlockName}
                                onChange={e => setNewBlockName(e.target.value)}
                                placeholder="Enter block name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="new-block-content">Block Content</Label>
                              <Textarea
                                id="new-block-content"
                                value={newBlockContent}
                                onChange={e => setNewBlockContent(e.target.value)}
                                placeholder="Enter block content"
                                rows={4}
                              />
                            </div>

                            <Button onClick={handleAddCustomBlock} className="w-full">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Custom Block
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

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
                          <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Generate Prompt
                      </Button>

                      <Button
                        onClick={() => setActiveTab("raw")}
                        variant="secondary"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View Raw
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Selected Blocks</h3>
                    {selectedBlocks.length > 0 ? (
                      <div className="space-y-2">
                        {selectedBlocks.map(blockId => {
                          const block = [...TEMPLATE_BLOCKS, ...customBlocks].find(b => b.id === blockId);
                          if (!block) return null;

                          return (
                            <div key={blockId} className="p-3 border rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <Badge variant="outline">{block.name}</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveBlock(blockId)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{block.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-muted/20 h-[300px]">
                        <p className="text-muted-foreground mb-4">No blocks selected yet</p>
                        <p className="text-sm text-center text-muted-foreground">
                          Add blocks from the left panel to build your prompt template
                        </p>
                      </div>
                    )}

                    <div className="p-4 border rounded-md bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">Preview</h4>
                      <pre className="text-sm whitespace-pre-wrap">{promptContent}</pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="raw">
                <div className="space-y-4">
                  <Textarea
                    value={promptContent}
                    onChange={e => setPromptContent(e.target.value)}
                    placeholder="Enter your prompt template here..."
                    rows={15}
                    className="font-mono"
                  />

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
                      onClick={() => setActiveTab("builder")}
                      variant="secondary"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Block Builder
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end mt-6">
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
              Save Prompt Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
