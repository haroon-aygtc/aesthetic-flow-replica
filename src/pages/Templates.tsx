import AdminLayout from "@/components/layouts/admin-layout";
import { File, FileEdit, Copy, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { promptTemplateService, PromptTemplate } from "@/utils/prompt-template-service";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface DisplayTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

const Templates = () => {
  const [templates, setTemplates] = useState<DisplayTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Convert API template to display format
  const mapToDisplayTemplate = (template: PromptTemplate): DisplayTemplate => {
    return {
      id: template.id,
      title: template.name,
      category: template.metadata.tags[0] || "General",
      description: template.description,
      prompt: template.content,
      variables: template.variables.map(v => v.name),
      createdAt: template.createdAt ? formatDate(template.createdAt) : "",
      updatedAt: template.updatedAt ? formatDate(template.updatedAt) : ""
    };
  };

  // Fetch templates from service
  useEffect(() => {
    async function fetchTemplates() {
      setIsLoading(true);
      try {
        const response = await promptTemplateService.getTemplates();
        const displayTemplates = response.data.map(mapToDisplayTemplate);
        setTemplates(displayTemplates);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, [toast]);

  const handleCreateTemplate = () => {
    navigate("/dashboard/ai-configuration/prompt-templates/new");
  };

  const handleEditTemplate = (id: string) => {
    navigate(`/dashboard/ai-configuration/prompt-templates/edit/${id}`);
  };

  const handleDuplicateTemplate = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await promptTemplateService.duplicateTemplate(id);
      const newTemplate = mapToDisplayTemplate(response.data);
      setTemplates([...templates, newTemplate]);

      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });
    } catch (error) {
      console.error("Failed to duplicate template:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    setIsLoading(true);
    try {
      await promptTemplateService.deleteTemplate(id);
      setTemplates(templates.filter(template => template.id !== id));

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories from templates
  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))];

  if (isLoading && templates.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Prompt Templates</h1>
            <p className="text-muted-foreground">
              Manage and customize AI prompt templates for your chat system
            </p>
          </div>
          <Button className="gap-2" onClick={handleCreateTemplate} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Create Template
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8">
            {categories.map(category => (
              <TabsTrigger key={category} value={category === "all" ? "all" : category}>
                {category === "all" ? "All Templates" : category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category === "all" ? "all" : category} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(category === "all"
                  ? templates
                  : templates.filter(t => t.category === category)
                ).map(template => (
                  <Card key={template.id} className="overflow-hidden">
                    <div className="border-b p-4 flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-md">
                          <File className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.title}</h3>
                          <div className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm inline-block mt-1">
                            Category: {template.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEditTemplate(template.id)}
                          disabled={isLoading}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleDuplicateTemplate(template.id)}
                          disabled={isLoading}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <p className="text-sm mb-4">{template.description}</p>

                      <div className="bg-secondary/50 rounded-md p-3 mb-4">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-32">
                          {template.prompt}
                        </pre>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map((variable, i) => (
                            <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Created: {template.createdAt}</span>
                        <span>Updated: {template.updatedAt}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(category === "all" ? templates.length === 0 : templates.filter(t => t.category === category).length === 0) && (
                  <div className="col-span-full text-center p-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No templates found. Create one to get started.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Templates;
