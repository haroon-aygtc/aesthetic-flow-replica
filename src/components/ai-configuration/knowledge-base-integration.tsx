
import { useState, useEffect } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { knowledgeBaseService } from "@/utils/knowledge-base-service";

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
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const [newCategory, setNewCategory] = useState("");
  const [relevanceWeight, setRelevanceWeight] = useState<number[]>([0.7]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await knowledgeBaseService.getDocuments();

        if (response.data) {
          // Transform the data to match our component's expected format
          const formattedDocs = response.data.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type.toUpperCase(),
            size: formatFileSize(doc.size),
            category: doc.category,
            uploadDate: new Date(doc.created_at).toLocaleDateString(),
            status: doc.status
          }));

          setDocuments(formattedDocs);

          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(formattedDocs.map((doc: any) => doc.category))
          );

          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to load knowledge base documents",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [toast]);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await knowledgeBaseService.deleteDocument(id);
      setDocuments(documents.filter(doc => doc.id !== id));
      toast({
        title: "Document Deleted",
        description: "The document has been removed from your knowledge base."
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const category = selectedCategory === "all" ? "General" : selectedCategory;

    try {
      toast({
        title: "Upload Started",
        description: "Your document is being processed and will be available shortly."
      });

      const response = await knowledgeBaseService.uploadDocument(file, category);

      // Add the new document to the list
      if (response.data) {
        const newDoc = {
          id: response.data.id,
          name: response.data.name,
          type: response.data.type.toUpperCase(),
          size: formatFileSize(response.data.size),
          category: response.data.category,
          uploadDate: new Date(response.data.created_at).toLocaleDateString(),
          status: response.data.status
        };

        setDocuments([newDoc, ...documents]);

        toast({
          title: "Upload Complete",
          description: "Your document has been uploaded and is being processed."
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = selectedCategory === "all"
    ? documents
    : documents.filter(doc => doc.category === selectedCategory);

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
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
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Spinner className="mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading documents...</p>
                  </div>
                ) : filteredDocuments.length > 0 ? (
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
            <div className="w-full">
              <label htmlFor="file-upload" className="w-full">
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.json"
                />
                <Button className="w-full" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload New Documents
                </Button>
              </label>
            </div>
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
