
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { knowledgeBaseService, KnowledgeDocument } from "@/utils/knowledge-base-service";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  MoreVertical, 
  Trash2, 
  Download, 
  Search, 
  Plus, 
  Check,
  AlertCircle,
  Clock 
} from "lucide-react";

interface KnowledgeDocumentListProps {
  documents: KnowledgeDocument[];
  onDocumentsChange: (documents: KnowledgeDocument[]) => void;
}

export function KnowledgeDocumentList({ documents, onDocumentsChange }: KnowledgeDocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  const categories = ["all", ...Array.from(new Set(documents.map(doc => doc.category)))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteDocument = async (id: string) => {
    try {
      await knowledgeBaseService.deleteDocument(id);
      onDocumentsChange(documents.filter(doc => doc.id !== id));
      toast({
        title: "Document deleted",
        description: "The document has been removed from your knowledge base"
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error deleting document",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const handleDownloadDocument = async (document: KnowledgeDocument) => {
    try {
      const response = await knowledgeBaseService.downloadDocument(document.id);
      
      // Create blob URL from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a link element using the document global object, not the KnowledgeDocument
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.filename);
      
      // Append to the global document body, not the KnowledgeDocument
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error downloading document",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleUploadComplete = (newDocuments: KnowledgeDocument[]) => {
    onDocumentsChange([...newDocuments, ...documents]);
    setIsUploadDialogOpen(false);
    toast({
      title: "Upload complete",
      description: `${newDocuments.length} document(s) uploaded successfully`
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "processed":
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <Badge 
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category === "all" ? "All" : category}
          </Badge>
        ))}
      </div>

      <div className="border rounded-md">
        <div className="grid grid-cols-12 p-3 border-b bg-muted/50 font-medium text-sm">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
        <div className="divide-y">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="grid grid-cols-12 p-3 items-center text-sm hover:bg-muted/50">
                <div className="col-span-5 flex items-center gap-2 overflow-hidden">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="truncate">
                    {doc.filename}
                  </div>
                </div>
                <div className="col-span-2 capitalize">{doc.filetype}</div>
                <div className="col-span-2">{formatFileSize(doc.size)}</div>
                <div className="col-span-2">
                  <div className={cn("px-2 py-1 rounded-full text-xs inline-flex items-center gap-1", getStatusClass(doc.status))}>
                    {getStatusIcon(doc.status)}
                    <span className="capitalize">{doc.status}</span>
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                        <Download className="h-4 w-4 mr-2" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteDocument(doc.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery || selectedCategory !== "all"
                ? "No documents match your search criteria."
                : "No documents found. Upload documents to get started."}
            </div>
          )}
        </div>
      </div>

      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
