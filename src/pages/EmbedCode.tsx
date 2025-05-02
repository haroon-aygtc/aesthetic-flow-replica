
import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Clipboard, ClipboardCheck, Code } from "lucide-react";

export default function EmbedCode() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState("default");
  const [embedType, setEmbedType] = useState("standard");
  
  // This would come from the backend in a real implementation
  const widgets = [
    { id: "default", name: "Default Widget" },
    { id: "support", name: "Support Widget" },
    { id: "sales", name: "Sales Widget" },
  ];
  
  // Example widget configuration
  const widgetConfig = {
    id: "widget_" + selectedWidget,
    primaryColor: "#4f46e5",
    borderRadius: "8",
    position: "bottom-right",
    initialMessage: "Hello! How can I help you today?"
  };
  
  const generateEmbedCode = (type: string) => {
    if (type === "standard") {
      return `<script src="https://chatsystem.ai/widget/v1/script.js" 
  data-widget-id="${widgetConfig.id}"
  data-primary-color="${widgetConfig.primaryColor}"
  data-border-radius="${widgetConfig.borderRadius}"
  async>
</script>`;
    } else if (type === "iframe") {
      return `<iframe 
  src="https://chatsystem.ai/widget/embed/${widgetConfig.id}" 
  width="100%" 
  height="500px"
  style="border: 1px solid #eee; border-radius: 8px;">
</iframe>`;
    } else {
      return `<chat-widget 
  widget-id="${widgetConfig.id}"
  primary-color="${widgetConfig.primaryColor}">
</chat-widget>

<script src="https://chatsystem.ai/widget/v1/web-component.js" async></script>`;
    }
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateEmbedCode(embedType));
    setCopied(true);
    
    toast({
      title: "Copied to clipboard!",
      description: "The embed code has been copied to your clipboard."
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Embed Code</h1>
          <p className="text-muted-foreground mt-2">
            Get the code needed to embed your chat widget on your website
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Widget Selection</CardTitle>
                <CardDescription>Select the widget you want to embed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Select defaultValue={selectedWidget} onValueChange={setSelectedWidget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a widget" />
                      </SelectTrigger>
                      <SelectContent>
                        {widgets.map((widget) => (
                          <SelectItem key={widget.id} value={widget.id}>
                            {widget.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integration Type</CardTitle>
                <CardDescription>Choose how to embed the widget on your website</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="standard" value={embedType} onValueChange={setEmbedType}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                    <TabsTrigger value="iframe">iFrame</TabsTrigger>
                    <TabsTrigger value="webcomponent">Web Component</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard">
                    <div className="space-y-4">
                      <p className="text-sm">
                        The standard integration adds a small script to your website that will load the widget when needed.
                        This is the recommended approach for most websites.
                      </p>
                      
                      <div className="bg-secondary/50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto whitespace-pre-wrap">
                          {generateEmbedCode("standard")}
                        </pre>
                      </div>
                      
                      <Button className="gap-2" onClick={handleCopyCode}>
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
                  </TabsContent>
                  
                  <TabsContent value="iframe">
                    <div className="space-y-4">
                      <p className="text-sm">
                        Use iFrame integration to embed the widget in a specific location on your page,
                        rather than as a floating chat button.
                      </p>
                      
                      <div className="bg-secondary/50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto whitespace-pre-wrap">
                          {generateEmbedCode("iframe")}
                        </pre>
                      </div>
                      
                      <Button className="gap-2" onClick={handleCopyCode}>
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
                  </TabsContent>
                  
                  <TabsContent value="webcomponent">
                    <div className="space-y-4">
                      <p className="text-sm">
                        Use Web Component integration for more control over the widget's position and styling.
                        This approach uses Shadow DOM for style encapsulation.
                      </p>
                      
                      <div className="bg-secondary/50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto whitespace-pre-wrap">
                          {generateEmbedCode("webcomponent")}
                        </pre>
                      </div>
                      
                      <Button className="gap-2" onClick={handleCopyCode}>
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Widget Preview</CardTitle>
                  <CardDescription>Preview your selected widget</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {/* This would be replaced with an actual preview */}
                  <div className="border rounded-lg w-64 h-96 flex items-center justify-center">
                    <p className="text-muted-foreground text-center p-4">
                      Widget Preview<br/>(ID: {widgetConfig.id})
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>Current widget settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Widget ID:</span>
                      <span className="font-mono">{widgetConfig.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Color:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: widgetConfig.primaryColor }}
                        ></div>
                        <span className="font-mono">{widgetConfig.primaryColor}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Border Radius:</span>
                      <span className="font-mono">{widgetConfig.borderRadius}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position:</span>
                      <span className="font-mono">{widgetConfig.position}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Integration Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary rounded-full p-2">
                        <Code className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Installation</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Copy the embed code and paste it just before the closing body tag on your website.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary rounded-full p-2">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Verification</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          After adding the code, visit your website and check if the widget appears.
                        </p>
                      </div>
                    </div>
                    
                    <Button variant="link" className="text-xs p-0 h-auto">
                      View documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
