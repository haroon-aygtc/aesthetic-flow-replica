
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatWidgetPreview } from "@/components/chat-widget-preview";
import { WidgetSettings } from "@/utils/widgetService";
import { Code, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetConfig {
  id: string;
  primaryColor: string;
  borderRadius: string;
  position: string;
  initialMessage: string;
}

interface WidgetPreviewSectionProps {
  widgetSettings: WidgetSettings;
  widgetConfig: WidgetConfig;
}

export function WidgetPreviewSection({ widgetSettings, widgetConfig }: WidgetPreviewSectionProps) {
  return (
    <div className="space-y-8">
      <Card className="transition-all duration-200">
        <CardHeader>
          <CardTitle>Widget Preview</CardTitle>
          <CardDescription>Preview your selected widget</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-6">
          <ChatWidgetPreview settings={widgetSettings} widgetId={widgetConfig.id} />
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-200">
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
      
      <Card className="transition-all duration-200">
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
  );
}
