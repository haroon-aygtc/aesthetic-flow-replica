import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChatWidgetPreview } from "@/components/chat-widget-preview";
import { AdminLayout } from "@/components/admin-layout";
import { Code, FileText, Palette, Settings, Save, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Widget, widgetService, WidgetSettings } from "@/utils/widgetService";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";

const widgetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ai_model_id: z.number().nullable(),
  is_active: z.boolean().default(true),
  settings: z.object({
    primaryColor: z.string().default("#4f46e5"),
    secondaryColor: z.string().default("#4f46e5"),
    fontFamily: z.string().default("Inter"),
    borderRadius: z.number().default(8),
    chatIconSize: z.number().default(40),
    autoOpenDelay: z.number().default(0),
    position: z.string().default("bottom-right"),
    initialMessage: z.string().default("Hello! How can I help you today?"),
    mobileBehavior: z.string().default("responsive"),
    headerTitle: z.string().default("AI Assistant"),
    inputPlaceholder: z.string().default("Type your message..."),
    sendButtonText: z.string().default("Send"),
    offlineMessage: z.string().default("Sorry, our chat assistant is currently offline."),
    systemPrompt: z.string().optional(),
  }),
});

type WidgetFormValues = z.infer<typeof widgetSchema>;

const WidgetConfig = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiModels, setAiModels] = useState<{ id: number; name: string; }[]>([]);

  // Default values for the form
  const defaultValues: WidgetFormValues = {
    name: "",
    ai_model_id: null,
    is_active: true,
    settings: {
      primaryColor: "#4f46e5",
      secondaryColor: "#4f46e5",
      fontFamily: "Inter",
      borderRadius: 8,
      chatIconSize: 40,
      autoOpenDelay: 0,
      position: "bottom-right",
      initialMessage: "Hello! How can I help you today?",
      mobileBehavior: "responsive",
      headerTitle: "AI Assistant",
      inputPlaceholder: "Type your message...",
      sendButtonText: "Send",
      offlineMessage: "Sorry, our chat assistant is currently offline.",
      systemPrompt: "",
    },
  };

  const form = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetSchema),
    defaultValues,
  });

  // Color options for the picker
  const colorOptions = [
    { value: "#4f46e5", label: "Blue" },
    { value: "#22c55e", label: "Green" },
    { value: "#ef4444", label: "Red" },
    { value: "#eab308", label: "Yellow" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#000000", label: "Black" },
    { value: "#ffffff", label: "White" },
  ];

  // Load widget if editing an existing one
  useEffect(() => {
    const fetchAIModels = async () => {
      try {
        const response = await fetch('/api/ai-models');
        const data = await response.json();
        setAiModels(data);
      } catch (error) {
        console.error("Failed to fetch AI models:", error);
        toast({
          title: "Error",
          description: "Failed to load AI models. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchAIModels();

    if (id) {
      const fetchWidget = async () => {
        setIsLoading(true);
        try {
          const response = await widgetService.getWidget(parseInt(id));
          const widget = response.data;
          
          // Set form values from loaded widget
          form.reset({
            name: widget.name,
            ai_model_id: widget.ai_model_id,
            is_active: widget.is_active,
            settings: {
              ...defaultValues.settings,
              ...widget.settings,
            },
          });
        } catch (error) {
          console.error("Failed to fetch widget:", error);
          toast({
            title: "Error",
            description: "Failed to load widget data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchWidget();
    }
  }, [id, form, toast]);

  // Handle form submission
  const onSubmit = async (values: WidgetFormValues) => {
    setIsLoading(true);
    try {
      if (id) {
        // Update existing widget
        await widgetService.updateWidget(parseInt(id), values);
        toast({
          title: "Success",
          description: "Widget updated successfully",
        });
      } else {
        // Create new widget
        const response = await widgetService.createWidget(values as Widget);
        toast({
          title: "Success",
          description: "Widget created successfully",
        });
        // Navigate to the edit page with the new ID
        navigate(`/dashboard/widget-config/${response.data.id}`);
      }
    } catch (error) {
      console.error("Failed to save widget:", error);
      toast({
        title: "Error",
        description: "Failed to save widget. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form to defaults
  const handleReset = () => {
    form.reset(defaultValues);
    toast({
      title: "Form Reset",
      description: "All settings have been reset to defaults",
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{id ? "Edit Widget" : "Create New Widget"}</h1>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Widget Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Chat Widget" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="ai_model_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Model</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value) || null)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an AI model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Default AI Model</SelectItem>
                          {aiModels.map((model) => (
                            <SelectItem key={model.id} value={model.id.toString()}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Widget Status</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable this widget
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
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
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Advanced
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
                          <FormField
                            control={form.control}
                            name="settings.primaryColor"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Primary Color</FormLabel>
                                <div className="grid grid-cols-7 gap-2">
                                  {colorOptions.map((color) => (
                                    <div
                                      key={color.value}
                                      className={`w-8 h-8 aspect-square rounded-full border-2 cursor-pointer ${field.value === color.value ? 'border-black dark:border-white ring-2 ring-offset-2' : 'border-gray-200'}`}
                                      style={{ backgroundColor: color.value }}
                                      onClick={() => field.onChange(color.value)}
                                    ></div>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">This color will be used for the chat header and buttons</p>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.secondaryColor"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Secondary Color</FormLabel>
                                <div className="grid grid-cols-7 gap-2">
                                  {colorOptions.map((color) => (
                                    <div
                                      key={color.value}
                                      className={`w-8 h-8 aspect-square rounded-full border-2 cursor-pointer ${field.value === color.value ? 'border-black dark:border-white ring-2 ring-offset-2' : 'border-gray-200'}`}
                                      style={{ backgroundColor: color.value }}
                                      onClick={() => field.onChange(color.value)}
                                    ></div>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Used for backgrounds and secondary elements</p>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.fontFamily"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Font Family</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select a font" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Inter">Inter</SelectItem>
                                    <SelectItem value="System-ui">System UI</SelectItem>
                                    <SelectItem value="Roboto">Roboto</SelectItem>
                                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                                    <SelectItem value="Lato">Lato</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">Choose a font for your chat widget</p>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.borderRadius"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <FormLabel>Border Radius: {field.value}px</FormLabel>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={20}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-2">Adjust the roundness of corners</p>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.chatIconSize"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <FormLabel>Chat Icon Size: {field.value}px</FormLabel>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={24}
                                    max={60}
                                    step={2}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-2">Size of the chat button when minimized</p>
                              </FormItem>
                            )}
                          />
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
                          <FormField
                            control={form.control}
                            name="settings.autoOpenDelay"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Auto Open Delay (seconds)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    className="max-w-md"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-2">Set to 0 to disable auto-opening</p>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.position"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Widget Position</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="max-w-md">
                                      <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                    <SelectItem value="top-right">Top Right</SelectItem>
                                    <SelectItem value="top-left">Top Left</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.initialMessage"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Initial Message</FormLabel>
                                <FormControl>
                                  <Input
                                    className="max-w-md"
                                    placeholder="Hello! How can I help you today?"
                                    {...field}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-2">First message sent by the AI when chat opens</p>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.mobileBehavior"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Mobile Behavior</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="max-w-md">
                                      <SelectValue placeholder="Select behavior" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="responsive">Responsive (Auto-adjust)</SelectItem>
                                    <SelectItem value="fullscreen">Full Screen on Mobile</SelectItem>
                                    <SelectItem value="minimized">Always Start Minimized</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
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
                          <FormField
                            control={form.control}
                            name="settings.headerTitle"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Header Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="AI Assistant"
                                    className="max-w-md"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.inputPlaceholder"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Input Placeholder</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Type your message..."
                                    className="max-w-md"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.sendButtonText"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Send Button Text</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Send"
                                    className="max-w-md"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="settings.offlineMessage"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Offline Message</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Sorry, our chat assistant is currently offline."
                                    className="max-w-md"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="advanced">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="mb-8">
                          <h2 className="text-xl font-semibold mb-2">Advanced Settings</h2>
                          <p className="text-sm text-muted-foreground">Configure advanced settings for your widget</p>
                        </div>
                        
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="settings.systemPrompt"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>System Prompt</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="You are a helpful AI assistant..."
                                    className="min-h-[150px]"
                                    {...field}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-2">Instructions for the AI to follow when responding (optional)</p>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end mt-6 space-x-4">
                  <Button variant="outline" onClick={handleReset} type="button">
                    Reset
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex gap-2 items-center">
                    {isLoading && <Spinner className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4 mr-1" />
                    {id ? "Update Widget" : "Create Widget"}
                  </Button>
                </div>
              </div>
              
              {/* Live Preview */}
              <div>
                <div className="sticky top-24">
                  <h2 className="text-xl font-bold mb-6">Live Preview</h2>
                  <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 flex justify-center">
                    <ChatWidgetPreview settings={form.watch("settings")} />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default WidgetConfig;
