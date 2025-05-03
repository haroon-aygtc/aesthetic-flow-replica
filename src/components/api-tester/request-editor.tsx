
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, RefreshCw } from "lucide-react";
import { ApiRoute, ApiTestRequest, apiTestService } from "@/utils/api-test-service";

interface RequestEditorProps {
  selectedRoute?: ApiRoute;
  selectedMethod?: string;
  onExecute: (request: ApiTestRequest) => void;
  isLoading: boolean;
}

export function RequestEditor({ 
  selectedRoute, 
  selectedMethod, 
  onExecute, 
  isLoading 
}: RequestEditorProps) {
  const [url, setUrl] = useState<string>("");
  const [requestData, setRequestData] = useState<string>("");
  
  // Update the form when selected route changes
  useEffect(() => {
    if (selectedRoute && selectedMethod) {
      setUrl(`/api${selectedRoute.uri.replace(/\{([^}]+)\}/g, ':$1')}`);
      
      // Generate example data
      const exampleData = apiTestService.generateExampleData(
        selectedRoute.uri,
        selectedMethod
      );
      setRequestData(JSON.stringify(exampleData, null, 2));
    }
  }, [selectedRoute, selectedMethod]);

  const handleExecute = () => {
    try {
      const parsedData = requestData.trim() ? JSON.parse(requestData) : {};
      onExecute({
        method: selectedMethod || "GET",
        url,
        data: parsedData
      });
    } catch (e) {
      console.error("Invalid JSON in request data:", e);
      alert("Invalid JSON in request body");
    }
  };

  const formatJson = () => {
    try {
      if (requestData.trim()) {
        const parsed = JSON.parse(requestData);
        setRequestData(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.error("Failed to format JSON:", e);
    }
  };

  return (
    <div className="bg-card border rounded-md shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Request</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-l-md font-mono text-sm border-y border-l">
              {selectedMethod || "METHOD"}
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/api/endpoint"
              className="font-mono text-sm flex-1"
            />
          </div>
        </div>

        {(selectedMethod === "POST" || selectedMethod === "PUT") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="request-body">Request Body</Label>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={formatJson}
                type="button"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Format
              </Button>
            </div>
            <Textarea
              id="request-body"
              value={requestData}
              onChange={(e) => setRequestData(e.target.value)}
              className="font-mono text-sm h-60"
              placeholder="{}"
            />
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleExecute} 
          disabled={isLoading || !url || !selectedMethod}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Execute Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
