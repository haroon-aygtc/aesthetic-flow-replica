
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWidgetSettings } from "@/hooks/use-widget-settings";
import { useEmbedCode } from "@/hooks/use-embed-code";
import { AlertCircle, Copy, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function EmbedCodeModule() {
  const [activeTab, setActiveTab] = useState("standard");
  const { getWidgetConfig } = useWidgetSettings();
  const { copied, setCopied, generateEmbedCode, getEmbedDescription } = useEmbedCode();
  const [embedCode, setEmbedCode] = useState("");
  
  const handleGenerateCode = async (type: string) => {
    const code = await generateEmbedCode(type, getWidgetConfig());
    setEmbedCode(code);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Module in development</AlertTitle>
        <AlertDescription>
          The Embed Code module is currently under development. Please check back later.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Embed Code Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            handleGenerateCode(value);
          }}>
            <TabsList className="mb-4">
              <TabsTrigger value="standard">Standard Script</TabsTrigger>
              <TabsTrigger value="iframe">iFrame</TabsTrigger>
              <TabsTrigger value="webcomponent">Web Component</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              <p className="text-muted-foreground">
                {getEmbedDescription(activeTab)}
              </p>
              
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="text-sm">{embedCode || "Click 'Generate Code' to create embed code"}</code>
                </pre>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button onClick={() => handleGenerateCode(activeTab)}>
                Generate Code
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
