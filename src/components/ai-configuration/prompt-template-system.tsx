
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Edit, 
  FileText, 
  Play, 
  Save, 
  Trash2, 
  PlusCircle, 
  RotateCcw,
  Copy
} from "lucide-react";

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  version: number;
  lastUpdated: string;
}

export function PromptTemplateSystem() {
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState<PromptTemplate[]>([
    {
      id: "template-1",
      name: "Customer Support Agent",
      description: "Generic template for customer support inquiries",
      category: "Support",
      content: "You are a helpful customer support agent for {company_name}. You help customers with questions about {product_name}. When you don't know an answer, you should say so and offer to connect the customer with a human agent. Always be polite and concise.\n\nCustomer: {customer_query}",
      version: 1,
      lastUpdated: "2025-04-25"
    },
    {
      id: "template-2",
      name: "Product Recommendation",
      description: "Template for product recommendations based on user preferences",
      category: "Sales",
      content: "Based on the customer's preferences and needs, recommend the most suitable products from our catalog. Include key features and benefits that align with their requirements.\n\nCustomer preferences: {customer_preferences}\nBudget constraints: {budget}\nUse case: {use_case}",
      version: 2,
      lastUpdated: "2025-04-24"
    },
    {
      id: "template-3",
      name: "Technical Support Troubleshooting",
      description: "Template for technical support troubleshooting",
      category: "Support",
      content: "You are a technical support specialist for {product_name}. Guide the user through troubleshooting steps in a clear, sequential manner. If the issue persists after basic troubleshooting, escalate to the appropriate department.\n\nProduct: {product_name}\nIssue description: {issue_description}\nTroubleshooting steps attempted: {previous_steps}",
      version: 1,
      lastUpdated: "2025-04-23"
    }
  ]);
  
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState("");

  const handleSelectTemplate = (template: PromptTemplate) => {
    setActiveTemplate(template);
    setEditContent(template.content);
    setEditMode(false);
    setTestMessage("");
    setTestResult("");
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    if (activeTemplate) {
      const updatedTemplates = templates.map(t => 
        t.id === activeTemplate.id 
          ? { 
              ...t, 
              content: editContent, 
              version: t.version + 1, 
              lastUpdated: new Date().toISOString().split('T')[0] 
            } 
          : t
      );
      setTemplates(updatedTemplates);
      setActiveTemplate({
        ...activeTemplate,
        content: editContent,
        version: activeTemplate.version + 1,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
      setEditMode(false);
      toast({
        title: "Template Updated",
        description: "The prompt template has been saved successfully."
      });
    }
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (activeTemplate?.id === id) {
      setActiveTemplate(null);
    }
    toast({
      title: "Template Deleted",
      description: "The prompt template has been removed."
    });
  };

  const handleTest = () => {
    // This would interact with the AI API in a real implementation
    if (activeTemplate && testMessage) {
      // Simulate API call delay
      setTimeout(() => {
        setTestResult(`This is a simulated AI response based on your "${activeTemplate.name}" template and the test message: "${testMessage}".`);
        toast({
          title: "Test Completed",
          description: "The prompt template test has been processed."
        });
      }, 1000);
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: PromptTemplate = {
      id: `template-${templates.length + 1}`,
      name: "New Template",
      description: "Enter a description for this template",
      category: "General",
      content: "Enter your prompt template here. Use {variable_name} for variables that should be replaced with actual values.",
      version: 1,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setTemplates([...templates, newTemplate]);
    setActiveTemplate(newTemplate);
    setEditContent(newTemplate.content);
    setEditMode(true);
  };

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleCreateTemplate}>
                <PlusCircle className="h-4 w-4 mr-2" /> New
              </Button>
            </div>
            <CardDescription>
              Create and manage prompt templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted ${activeTemplate?.id === template.id ? 'border-primary bg-muted/50' : ''}`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.category} • v{template.version}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {templates.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No templates found.</p>
                  <p className="text-sm">Create a new template to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-8 space-y-6">
        {activeTemplate ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">{activeTemplate.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {activeTemplate.description}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {editMode ? (
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                    ) : (
                      <Button onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded-full">
                    {activeTemplate.category}
                  </span>
                  <span className="bg-muted text-muted-foreground px-2 py-1 text-xs rounded-full">
                    Version {activeTemplate.version}
                  </span>
                  <span className="bg-muted text-muted-foreground px-2 py-1 text-xs rounded-full">
                    Updated {activeTemplate.lastUpdated}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div>
                    <Label htmlFor="template-content">Template Content</Label>
                    <textarea 
                      id="template-content"
                      className="mt-1 w-full h-64 p-3 rounded-md border border-input bg-background text-sm font-mono"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Enter your prompt template here"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Use {"{variable_name}"} syntax for variables that should be replaced with actual values.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label>Template Content</Label>
                    <div className="mt-1 p-3 rounded-md border bg-muted/30 whitespace-pre-wrap font-mono text-sm">
                      {activeTemplate.content}
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(activeTemplate.content);
                          toast({
                            title: "Copied to Clipboard",
                            description: "Template content has been copied to clipboard."
                          });
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Test Template
                </CardTitle>
                <CardDescription>
                  Test your template with a sample message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-message">Test Message</Label>
                    <Input
                      id="test-message"
                      placeholder="Enter a test message"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                    />
                  </div>
                  
                  {testResult && (
                    <div>
                      <Label>AI Response</Label>
                      <div className="mt-1 p-3 rounded-md border bg-muted/30">
                        {testResult}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setTestResult("")}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
                <Button onClick={handleTest} disabled={!testMessage}>
                  <Play className="h-4 w-4 mr-2" /> Test
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">Select a template</h3>
                <p className="text-muted-foreground mt-1">
                  Select a template from the list or create a new one to get started.
                </p>
                <Button className="mt-4" onClick={handleCreateTemplate}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Create New Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
