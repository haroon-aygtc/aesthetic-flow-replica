
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

import { 
  Database, 
  FileText, 
  FolderPlus, 
  Trash2, 
  Upload, 
  FileImage,
  AlertCircle, 
  Archive 
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  uploadDate: string;
  status: "indexed" | "processing" | "failed";
}

export function KnowledgeBaseIntegration() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([
    {
      id: "doc-1",
      name: "Company FAQ.pdf",
      type: "PDF",
      size: "2.3 MB",
      category: "Customer Support",
      uploadDate: "2025-04-25",
      status: "indexed"
    },
    {
      id: "doc-2",
      name: "Product Manual.docx",
      type: "DOCX",
      size: "1.7 MB",
      category: "Technical Documentation",
      uploadDate: "2025-04-24",
      status: "indexed"
    },
    {
      id: "doc-3",
      name: "Support Knowledge Base.csv",
      type: "CSV",
      size: "0.9 MB",
      category: "Customer Support",
      uploadDate: "2025-04-23",
      status: "processing"
    },
    {
      id: "doc-4",
      name: "Product Specifications.xlsx",
      type: "XLSX",
      size: "1.2 MB",
      category: "Technical Documentation",
      uploadDate: "2025-04-22",
      status: "failed"
    }
  ]);
  
  const [categories, setCategories] = useState<string[]>([
    "Customer Support", 
    "Technical Documentation", 
    "Marketing Materials",
    "Legal Documents"
  ]);
  
  const [newCategory, setNewCategory] = useState("");
  const [relevanceWeight, setRelevanceWeight] = useState<number[]>([0.7]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast({
      title: "Document Deleted",
      description: "The document has been removed from your knowledge base."
    });
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
      toast({
        title: "Category Added",
        description: `New category "${newCategory}" has been created.`
      });
    }
  };

  const handleUpload = () => {
    toast({
      title: "Upload Started",
      description: "Your documents are being processed and will be available shortly."
    });
  };

  const filteredDocuments = selectedCategory === "all" 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const getStatusBadgeClasses = (status: string) => {
    switch(status) {
      case "indexed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Database className="h-5 w-5" />
              Knowledge Documents
            </CardTitle>
            <CardDescription>
              Manage documents that form your AI's knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className={`${selectedCategory === "all" ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories.map(category => (
                <Button 
                  key={category}
                  variant="outline"
                  className={`${selectedCategory === category ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="border rounded-md">
              <div className="grid grid-cols-5 p-4 border-b bg-muted/40 font-medium text-sm">
                <div className="col-span-2">Document</div>
                <div>Category</div>
                <div>Size</div>
                <div>Status</div>
              </div>
              <div className="divide-y">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-5 p-4 items-center text-sm">
                      <div className="col-span-2 flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">Uploaded on {doc.uploadDate}</p>
                        </div>
                      </div>
                      <div>{doc.category}</div>
                      <div>{doc.size}</div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClasses(doc.status)}`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No documents found for the selected filter.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" /> Upload New Documents
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>
              Create categories and manage indexing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-category">New Category</Label>
              <div className="flex gap-2">
                <Input 
                  id="new-category" 
                  placeholder="Enter category name" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button onClick={handleAddCategory}>
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Document Types</Label>
              <div className="space-y-2">
                {["PDF", "DOCX", "TXT", "CSV", "XLSX", "JSON"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={`type-${type}`} defaultChecked={type !== "JSON"} />
                    <Label htmlFor={`type-${type}`} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="indexing">
                <AccordionTrigger>Indexing Settings</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auto-index" defaultChecked />
                      <Label htmlFor="auto-index" className="text-sm">Automatically index new documents</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="relevance">Relevance Weight: {relevanceWeight[0].toFixed(1)}</Label>
                      </div>
                      <Slider
                        id="relevance"
                        min={0}
                        max={1}
                        step={0.1}
                        value={relevanceWeight}
                        onValueChange={setRelevanceWeight}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Broader Results</span>
                        <span>Precise Results</span>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full">Reindex All Documents</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Document Viewer
          </CardTitle>
          <CardDescription>
            Preview and manage individual documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">Select a document to preview</h3>
            <p className="text-muted-foreground mt-1">
              Click on any document from the list above to view its content and manage indexing options.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
