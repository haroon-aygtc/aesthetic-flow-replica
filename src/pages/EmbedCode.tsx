
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useWidgetSettings } from "@/hooks/use-widget-settings";
import { useEmbedCode } from "@/hooks/use-embed-code";
import { WidgetSelector } from "@/components/embed-code/widget-selector";
import { EmbedTypeSelector } from "@/components/embed-code/embed-type-selector";
import { EmbedCodeDisplay } from "@/components/embed-code/embed-code-display";
import { WidgetPreviewSection } from "@/components/embed-code/widget-preview-section";
import { Spinner } from "@/components/ui/spinner";

export default function EmbedCode() {
  const [embedType, setEmbedType] = useState("standard");
  const [embedCodes, setEmbedCodes] = useState<Record<string, string>>({
    standard: "",
    iframe: "",
    webcomponent: ""
  });
  
  const { 
    widgets, 
    selectedWidget, 
    widgetSettings, 
    setSelectedWidget, 
    getWidgetConfig, 
    isLoading: widgetsLoading 
  } = useWidgetSettings();
  
  const { 
    generateEmbedCode, 
    getEmbedDescription, 
    isLoading: codeLoading 
  } = useEmbedCode();
  
  const widgetConfig = getWidgetConfig();
  
  // Generate embed code when widget or type changes
  useEffect(() => {
    if (!selectedWidget) return;
    
    const updateEmbedCode = async () => {
      const code = await generateEmbedCode(embedType, widgetConfig);
      setEmbedCodes(prev => ({
        ...prev,
        [embedType]: code
      }));
    };
    
    updateEmbedCode();
  }, [selectedWidget, embedType, widgetConfig]);
  
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Embed Code</h1>
          <p className="text-muted-foreground mt-2">
            Get the code needed to embed your chat widget on your website
          </p>
        </div>
        
        {widgetsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <Card className="transition-all duration-200">
                <CardHeader>
                  <CardTitle>Widget Selection</CardTitle>
                  <CardDescription>Select the widget you want to embed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <WidgetSelector 
                      widgets={widgets} 
                      selectedWidget={selectedWidget} 
                      onWidgetChange={setSelectedWidget} 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="transition-all duration-200">
                <CardHeader>
                  <CardTitle>Integration Type</CardTitle>
                  <CardDescription>Choose how to embed the widget on your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmbedTypeSelector 
                    embedType={embedType} 
                    onEmbedTypeChange={setEmbedType}
                  >
                    <TabsContent value="standard" className="animate-fade-in transition-all duration-300">
                      <EmbedCodeDisplay 
                        code={embedCodes.standard}
                        description={getEmbedDescription("standard")}
                        isLoading={codeLoading && embedType === "standard"}
                      />
                    </TabsContent>
                    
                    <TabsContent value="iframe" className="animate-fade-in transition-all duration-300">
                      <EmbedCodeDisplay 
                        code={embedCodes.iframe}
                        description={getEmbedDescription("iframe")}
                        isLoading={codeLoading && embedType === "iframe"}
                      />
                    </TabsContent>
                    
                    <TabsContent value="webcomponent" className="animate-fade-in transition-all duration-300">
                      <EmbedCodeDisplay 
                        code={embedCodes.webcomponent}
                        description={getEmbedDescription("webcomponent")}
                        isLoading={codeLoading && embedType === "webcomponent"}
                      />
                    </TabsContent>
                  </EmbedTypeSelector>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <WidgetPreviewSection 
                widgetSettings={widgetSettings}
                widgetConfig={widgetConfig}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
