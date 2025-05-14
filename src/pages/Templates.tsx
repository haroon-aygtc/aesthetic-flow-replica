
import { AdminLayout } from "@/components/layouts/admin-layout";
import { File, FileEdit, Copy, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Templates = () => {
  const templates = [
    {
      id: 1,
      title: "General Information Query",
      category: "General",
      description: "A general template for handling basic information queries",
      prompt: "You are a helpful assistant. Answer the following question: {{question}}",
      variables: ["question"],
      createdAt: "4/28/2025",
      updatedAt: "4/28/2025"
    },
    {
      id: 2,
      title: "UAE Government Information",
      category: "Uae-Gov",
      description: "Template specifically for UAE government related queries",
      prompt: "You are an assistant specializing in UAE government information. Please provide information about {{topic}} within the context of UAE government services.",
      variables: ["topic"],
      createdAt: "4/28/2025",
      updatedAt: "4/28/2025"
    },
    {
      id: 3,
      title: "Product Support",
      category: "Support",
      description: "Template for handling product support queries",
      prompt: "You are a product support specialist. Help the user with their question about {{product}}: {{issue}}",
      variables: ["product", "issue"],
      createdAt: "4/28/2025",
      updatedAt: "4/28/2025"
    }
  ];

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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        <Tabs defaultValue="all-templates" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all-templates">All Templates</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="uae-gov">Uae-Gov</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="all-templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
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
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <p className="text-sm mb-4">{template.description}</p>

                    <div className="bg-secondary/50 rounded-md p-3 mb-4">
                      <pre className="text-xs overflow-auto whitespace-pre-wrap">
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
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(t => t.category === "General")
                .map(template => (
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
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <p className="text-sm mb-4">{template.description}</p>

                      <div className="bg-secondary/50 rounded-md p-3 mb-4">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
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
            </div>
          </TabsContent>

          <TabsContent value="uae-gov" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(t => t.category === "Uae-Gov")
                .map(template => (
                  <Card key={template.id} className="overflow-hidden">
                    {/* Same content structure as above */}
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
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <p className="text-sm mb-4">{template.description}</p>

                      <div className="bg-secondary/50 rounded-md p-3 mb-4">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
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
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(t => t.category === "Support")
                .map(template => (
                  <Card key={template.id} className="overflow-hidden">
                    {/* Same content structure as above */}
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
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <p className="text-sm mb-4">{template.description}</p>

                      <div className="bg-secondary/50 rounded-md p-3 mb-4">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Templates;
