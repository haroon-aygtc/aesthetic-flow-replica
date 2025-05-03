
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface EmbedCodeDisplayProps {
  code: string;
  description: string;
  isLoading?: boolean;
}

export function EmbedCodeDisplay({ code, description, isLoading = false }: EmbedCodeDisplayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Reset copied state when code changes
    setCopied(false);
  }, [code]);

  const handleCopyCode = () => {
    if (isLoading || !code) return;
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard!",
      description: "The embed code has been copied to your clipboard."
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm">
        {description}
      </p>
      
      <div className="bg-secondary/50 p-4 rounded-md">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" />
          </div>
        ) : (
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {code}
          </pre>
        )}
      </div>
      
      <Button 
        className="gap-2 transition-all duration-200" 
        onClick={handleCopyCode}
        disabled={isLoading || !code}
      >
        {copied ? (
          <>
            <ClipboardCheck className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Clipboard className="h-4 w-4" />
            Copy Code
          </>
        )}
      </Button>
    </div>
  );
}
