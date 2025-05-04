
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { ChatWidgetPreview } from "@/components/widget-preview";

// Define schema for response formatter settings
const responseFormatterSchema = z.object({
  formatType: z.string().min(1, "Please select a format type"),
  codeHighlighting: z.boolean().default(true),
  markdownFormatting: z.boolean().default(true),
  autoFormatting: z.boolean().default(true),
  mediaEmbedding: z.boolean().default(true),
  responseStyling: z.string().default("clean"),
  customCSS: z.string().optional(),
  maximumResponseLength: z.coerce.number().default(2000),
  bulletListStyle: z.string().default("disc"),
  snippetLanguages: z.string().default("javascript,python,html,css"),
});

type ResponseFormatterValues = z.infer<typeof responseFormatterSchema>;

export function ResponseFormatter() {
  const [activeTab, setActiveTab] = useState("formatting");
  const [previewResponse, setPreviewResponse] = useState(false);
  
  // Initialize form with defaults
  const form = useForm<ResponseFormatterValues>({
    resolver: zodResolver(responseFormatterSchema),
    defaultValues: {
      formatType: "markdown",
      codeHighlighting: true,
      markdownFormatting: true,
      autoFormatting: true,
      mediaEmbedding: true,
      responseStyling: "clean",
      customCSS: "",
      maximumResponseLength: 2000,
      bulletListStyle: "disc",
      snippetLanguages: "javascript,python,html,css"
    },
  });

  const onSubmit = (values: ResponseFormatterValues) => {
    console.log("Response formatter settings:", values);
    
    toast({
      title: "Settings saved",
      description: "Response formatter settings have been updated.",
    });
  };

  // Sample widget settings for preview
  const widgetSettings = {
    primaryColor: "#4f46e5",
    secondaryColor: "#4f46e5",
    borderRadius: 8,
    position: "bottom-right",
    headerTitle: "AI Chat",
    initialMessage: "Hello! How can I help you today?"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Response Formatter</CardTitle>
          <CardDescription>
            Configure how AI responses are formatted and presented to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="formatting" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formatting">Formatting Options</TabsTrigger>
              <TabsTrigger value="styling">Styling & Preview</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
                <TabsContent value="formatting" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="formatType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select format type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="markdown">Markdown</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="plaintext">Plain Text</SelectItem>
                            <SelectItem value="rich">Rich Text</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how you want your AI responses to be formatted
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="codeHighlighting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>Code Highlighting</FormLabel>
                            <FormDescription>
                              Syntax highlighting for code blocks
                            </FormDescription>
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
                    
                    <FormField
                      control={form.control}
                      name="markdownFormatting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>Markdown Formatting</FormLabel>
                            <FormDescription>
                              Format responses with Markdown
                            </FormDescription>
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
                    
                    <FormField
                      control={form.control}
                      name="autoFormatting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>Auto Formatting</FormLabel>
                            <FormDescription>
                              Automatically format responses
                            </FormDescription>
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
                    
                    <FormField
                      control={form.control}
                      name="mediaEmbedding"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div>
                            <FormLabel>Media Embedding</FormLabel>
                            <FormDescription>
                              Allow embedding of images and media
                            </FormDescription>
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
                  
                  <FormField
                    control={form.control}
                    name="snippetLanguages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supported Code Languages</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="javascript,python,html,css" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of languages for code highlighting
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maximumResponseLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Response Length</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of characters in a single response
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="styling" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="responseStyling"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Response Style</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clean">Clean</SelectItem>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="expanded">Expanded</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the visual style for AI responses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bulletListStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bullet List Style</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select bullet style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disc">Disc (•)</SelectItem>
                            <SelectItem value="circle">Circle (○)</SelectItem>
                            <SelectItem value="square">Square (■)</SelectItem>
                            <SelectItem value="dash">Dash (-)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Style for bullet points in lists
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("responseStyling") === "custom" && (
                    <FormField
                      control={form.control}
                      name="customCSS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom CSS</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder=".response { padding: 10px; }" 
                              className="font-mono text-sm h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Custom CSS for response formatting
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPreviewResponse(!previewResponse)}
                      className="mb-4"
                    >
                      {previewResponse ? "Hide Preview" : "Show Preview"}
                    </Button>
                    
                    {previewResponse && (
                      <div className="border rounded-lg p-4 mt-2">
                        <h4 className="text-sm font-medium mb-2">Response Preview</h4>
                        <div className="max-w-sm mx-auto">
                          <ChatWidgetPreview settings={widgetSettings} />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
