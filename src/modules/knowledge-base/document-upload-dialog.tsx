
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { knowledgeBaseService } from "@/utils/knowledge-base-service";
import { Upload, X, FileText, AlertCircle, Loader2 } from "lucide-react";

interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  category: string;
  error?: string;
}

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (documents: any[]) => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [category, setCategory] = useState("General");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const availableCategories = ["General", "Support", "Technical", "Marketing", "Legal"];

  const resetState = () => {
    setFiles([]);
    setCategory("General");
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "pending" as const,
      category: category,
    }));
    
    setFiles((prev) => [...prev, ...newFiles]);
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    
    setIsUploading(true);
    
    try {
      const uploadedDocuments = [];
      
      for (const file of files) {
        if (file.status === "complete") continue;
        
        try {
          // Update file status to uploading
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: "uploading" as const } : f
            )
          );
          
          const result = await knowledgeBaseService.uploadDocument(file.file, file.category);
          
          // Update file status to complete
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, status: "complete" as const, progress: 100 }
                : f
            )
          );
          
          uploadedDocuments.push(result.data);
        } catch (error) {
          console.error("Error uploading file:", error);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    status: "error" as const,
                    error: "Upload failed",
                  }
                : f
            )
          );
        }
      }
      
      if (uploadedDocuments.length) {
        onUploadComplete(uploadedDocuments);
        resetState();
      }
    } catch (error) {
      console.error("Error during upload:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your documents",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    // Also update category for all pending files
    setFiles((prev) =>
      prev.map((file) =>
        file.status === "pending" ? { ...file, category: value } : file
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isUploading) {
        resetState();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOCX, TXT, XLSX, CSV (Max 20MB)
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
              className="hidden"
              disabled={isUploading}
            />
          </div>
          
          {files.length > 0 && (
            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-3 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2 truncate flex-1">
                    <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="truncate flex-1">
                      <div className="font-medium truncate">{file.file.name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.file.size / 1024).toFixed(1)} KB • {file.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                    {file.status === "uploading" && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {file.status === "complete" && (
                      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {file.status !== "uploading" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(file.id);
                        }}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!isUploading) onOpenChange(false);
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading || files.every((f) => f.status === "complete")}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
