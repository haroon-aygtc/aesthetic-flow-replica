
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookTemplate, PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface TemplateSelectorProps {
  selectedModelId: number | null;
  onTemplateSelect: (templateId: string | null) => void;
  onCreateTemplate: () => void;
  selectedTemplateId: string | null;
}

export function TemplateSelector({ 
  selectedModelId, 
  onTemplateSelect,
  onCreateTemplate,
  selectedTemplateId 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [useTemplate, setUseTemplate] = useState(!!selectedTemplateId);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch templates when the selected model changes
  useEffect(() => {
    if (!selectedModelId) return;
    
    fetchTemplates(selectedModelId);
  }, [selectedModelId]);

  const fetchTemplates = async (modelId: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/models/${modelId}/templates`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load prompt templates",
        variant: "destructive"
      });
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTemplate = (checked: boolean) => {
    setUseTemplate(checked);
    if (!checked) {
      onTemplateSelect(null);
    } else if (templates.length > 0) {
      onTemplateSelect(templates[0].id);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    onTemplateSelect(templateId);
  };

  if (!selectedModelId) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <BookTemplate className="h-5 w-5" />
          Prompt Templates
        </CardTitle>
        <CardDescription>
          Assign a prompt template to define how the model responds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={useTemplate} 
              onCheckedChange={handleToggleTemplate} 
              id="use-template"
            />
            <Label htmlFor="use-template">Use prompt template</Label>
          </div>
          
          {useTemplate && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="template-select">Select template</Label>
                <Select 
                  disabled={isLoading || templates.length === 0} 
                  value={selectedTemplateId || ""} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder={isLoading ? "Loading templates..." : "Select a template"} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 && !isLoading ? (
                      <SelectItem value="no-templates" disabled>No templates available</SelectItem>
                    ) : (
                      templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex justify-between items-center">
                            <span>{template.name}</span>
                            <Badge variant="outline" className="ml-2">{template.category}</Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTemplateId && templates.find(t => t.id === selectedTemplateId) && (
                <div className="bg-muted/50 p-3 rounded text-sm">
                  {templates.find(t => t.id === selectedTemplateId)?.description}
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 w-full"
                onClick={onCreateTemplate}
              >
                <PlusCircle className="h-4 w-4" /> Create New Template
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
