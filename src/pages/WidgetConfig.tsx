import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChatWidgetPreview } from "@/components/chat-widget-preview";
import { AdminLayout } from "@/components/admin-layout";
import { Code, FileText, Palette, Settings } from "lucide-react";

const WidgetConfig = () => {
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [secondaryColor, setSecondaryColor] = useState("#4f46e5");
  const [borderRadius, setBorderRadius] = useState([8]);
  const [chatIconSize, setChatIconSize] = useState([40]);
  const [fontFamily, setFontFamily] = useState("Inter");

  const colorOptions = [
    { value: "#4f46e5", label: "Blue" },
    { value: "#22c55e", label: "Green" },
    { value: "#ef4444", label: "Red" },
    { value: "#eab308", label: "Yellow" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#000000", label: "Black" },
    { value: "#ffffff", label: "White" },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Widget Configurator</h1>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Configuration Panel */}
          <div>
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="behavior" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Behavior
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="embedding" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Embedding
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="appearance">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-2">Visual Style</h2>
                      <p className="text-sm text-muted-foreground">Customize how your chat widget looks</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="grid grid-cols-7 gap-2">
                          {colorOptions.map((color) => (
                            <div
                              key={color.value}
                              className={`w-8 h-8 aspect-square rounded-full border-2 cursor-pointer ${primaryColor === color.value ? 'border-black dark:border-white ring-2 ring-offset-2' : 'border-gray-200'}`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => setPrimaryColor(color.value)}
                            ></div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">This color will be used for the chat header and buttons</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="grid grid-cols-7 gap-2">
                          {colorOptions.map((color) => (
                            <div
                              key={color.value}
                              className={`w-8 h-8 aspect-square rounded-full border-2 cursor-pointer ${secondaryColor === color.value ? 'border-black dark:border-white ring-2 ring-offset-2' : 'border-gray-200'}`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => setSecondaryColor(color.value)}
                            ></div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Used for backgrounds and secondary elements</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <Select defaultValue={fontFamily} onValueChange={setFontFamily}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="System-ui">System UI</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">Choose a font for your chat widget</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="borderRadius">Border Radius: {borderRadius}px</Label>
                        </div>
                        <Slider
                          id="borderRadius"
                          min={0}
                          max={20}
                          step={1}
                          value={borderRadius}
                          onValueChange={setBorderRadius}
                        />
                        <p className="text-xs text-muted-foreground mt-2">Adjust the roundness of corners</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="chatIconSize">Chat Icon Size: {chatIconSize}px</Label>
                        </div>
                        <Slider
                          id="chatIconSize"
                          min={24}
                          max={60}
                          step={2}
                          value={chatIconSize}
                          onValueChange={setChatIconSize}
                        />
                        <p className="text-xs text-muted-foreground mt-2">Size of the chat button when minimized</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="behavior">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-2">Behavior Settings</h2>
                      <p className="text-sm text-muted-foreground">Configure how the chat widget behaves</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="autoOpen">Auto Open Delay (seconds)</Label>
                        <Input
                          id="autoOpen"
                          type="number"
                          min={0}
                          defaultValue={5}
                          className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Set to 0 to disable auto-opening</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Widget Position</Label>
                        <Select defaultValue="bottom-right">
                          <SelectTrigger className="max-w-md">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="initialMessage">Initial Message</Label>
                        <Input
                          id="initialMessage"
                          placeholder="Hello! How can I help you today?"
                          className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground mt-2">First message sent by the AI when chat opens</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobileSupport">Mobile Behavior</Label>
                        <Select defaultValue="responsive">
                          <SelectTrigger className="max-w-md">
                            <SelectValue placeholder="Select behavior" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="responsive">Responsive (Auto-adjust)</SelectItem>
                            <SelectItem value="fullscreen">Full Screen on Mobile</SelectItem>
                            <SelectItem value="minimized">Always Start Minimized</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="content">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-2">Content Settings</h2>
                      <p className="text-sm text-muted-foreground">Customize the text and content of your chat widget</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="headerTitle">Header Title</Label>
                        <Input
                          id="headerTitle"
                          placeholder="AI Assistant"
                          className="max-w-md"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="chatPlaceholder">Input Placeholder</Label>
                        <Input
                          id="chatPlaceholder"
                          placeholder="Type your message..."
                          className="max-w-md"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sendButtonText">Send Button Text</Label>
                        <Input
                          id="sendButtonText"
                          placeholder="Send"
                          className="max-w-md"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="offlineMessage">Offline Message</Label>
                        <Input
                          id="offlineMessage"
                          placeholder="Sorry, our chat assistant is currently offline."
                          className="max-w-md"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="embedding">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-2">Embedding Code</h2>
                      <p className="text-sm text-muted-foreground">
                        Use this code to embed the chat widget on your website
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-secondary/50 p-4 rounded-md">
                        <pre className="text-sm overflow-auto whitespace-pre-wrap">
{`<script src="https://chatsystem.ai/widget/v1/script.js" 
  data-widget-id="your-widget-id"
  data-primary-color="${primaryColor}"
  data-border-radius="${borderRadius}"
  async>
</script>`}
                        </pre>
                      </div>
                      
                      <Button>Copy Code</Button>
                      
                      <div className="mt-6">
                        <h3 className="text-md font-medium mb-2">Installation Instructions</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Copy the code snippet above</li>
                          <li>Paste it just before the closing <code className="bg-secondary/50 px-1 rounded-sm">&lt;/body&gt;</code> tag of your HTML</li>
                          <li>Save your changes and reload your website</li>
                          <li>The chat widget should now appear on your site</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline">Reset</Button>
              <Button>Save Configuration</Button>
            </div>
          </div>
          
          {/* Live Preview */}
          <div>
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-6">Live Preview</h2>
              <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 flex justify-center">
                <ChatWidgetPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WidgetConfig;
