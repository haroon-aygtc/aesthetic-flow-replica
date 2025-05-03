
import { useState } from "react";
import { CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiTestResponse } from "@/utils/api-test-service";

interface ResponseViewerProps {
  response?: ApiTestResponse;
  isLoading: boolean;
}

export function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState("body");

  const getStatusColor = (status?: number) => {
    if (!status) return "bg-gray-500";
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-blue-500";
    if (status >= 400 && status < 500) return "bg-yellow-500";
    return "bg-red-500";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="bg-card border rounded-md shadow-sm h-full flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Waiting for response...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-card border rounded-md shadow-sm h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Execute a request to see the response</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-md shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">Response</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(response.status)}`}></div>
            <span className="font-medium">{response.status}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {response.duration.toFixed(0)}ms
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-2 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="body" className="p-4">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
            >
              Copy
            </Button>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
              <code>{JSON.stringify(response.data, null, 2)}</code>
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="headers" className="p-4">
          <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr>
                  <th className="pb-2 font-medium">Header</th>
                  <th className="pb-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers).map(([key, value], idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="py-2 pr-4 font-mono">{key}</td>
                    <td className="py-2 font-mono break-all">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
