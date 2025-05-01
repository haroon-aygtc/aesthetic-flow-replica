
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash2, Check, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Define the follow-up settings validation schema
const followUpConfigSchema = z.object({
  enableFollowUp: z.boolean().default(true),
  suggestionsCount: z.string().min(1, {
    message: "Please select the number of suggestions.",
  }),
  suggestionsStyle: z.string().min(1, {
    message: "Please select a suggestion style.",
  }),
  buttonStyle: z.string().min(1, {
    message: "Please select a button style.",
  }),
  customPrompt: z.string().optional(),
  contexts: z.array(z.string()),
});

// Define the suggestion schema
const suggestionSchema = z.object({
  text: z.string().min(3, {
    message: "Suggestion text must be at least 3 characters."
  }),
  category: z.string().min(1, {
    message: "Please select a category."
  }),
  context: z.string().min(1, {
    message: "Please select a context."
  }),
});

interface Suggestion {
  id: string;
  text: string;
  category: string;
  context: string;
  active: boolean;
}

export function FollowUpEngine() {
  const [activeTab, setActiveTab] = useState("settings");
  const [newSuggestion, setNewSuggestion] = useState({
    text: "",
    category: "general",
    context: "all",
  });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      text: "Tell me more about your pricing",
      category: "pricing",
      context: "product",
      active: true,
    },
    {
      id: "2",
      text: "How does your support work?",
      category: "support",
      context: "service",
      active: true,
    },
    {
      id: "3",
      text: "Do you have a free trial?",
      category: "pricing",
      context: "product",
      active: true,
    },
  ]);
  
  // Define follow-up form
  const configForm = useForm<z.infer<typeof followUpConfigSchema>>({
    resolver: zodResolver(followUpConfigSchema),
    defaultValues: {
      enableFollowUp: true,
      suggestionsCount: "3",
      suggestionsStyle: "buttons",
      buttonStyle: "rounded",
      customPrompt: "",
      contexts: ["product", "service", "pricing"],
    },
  });

  // Define suggestion form
  const suggestionForm = useForm<z.infer<typeof suggestionSchema>>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      text: "",
      category: "general",
      context: "all",
    },
  });

  const onConfigSubmit = (values: z.infer<typeof followUpConfigSchema>) => {
    // In a real implementation, this would call an API to save the follow-up settings
    console.log("Follow-up settings:", values);
    
    toast({
      title: "Follow-up settings saved",
      description: "Your AI follow-up configuration has been updated.",
    });
  };

  const onSuggestionSubmit = (values: z.infer<typeof suggestionSchema>) => {
    // Add new suggestion
    const newSuggestionItem: Suggestion = {
      id: Date.now().toString(),
      text: values.text,
      category: values.category,
      context: values.context,
      active: true,
    };
    
    setSuggestions((prev) => [...prev, newSuggestionItem]);
    suggestionForm.reset({
      text: "",
      category: "general",
      context: "all",
    });
    
    toast({
      title: "Suggestion added",
      description: "Your follow-up suggestion has been added to the list.",
    });
  };

  const toggleSuggestionStatus = (id: string) => {
    setSuggestions((prev) => 
      prev.map((suggestion) => 
        suggestion.id === id 
          ? { ...suggestion, active: !suggestion.active } 
          : suggestion
      )
    );
  };

  const deleteSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((suggestion) => suggestion.id !== id));
    toast({
      title: "Suggestion deleted",
      description: "The follow-up suggestion has been removed.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Follow-Up Engine</CardTitle>
          <CardDescription>
            Configure how your AI assistant suggests follow-up questions to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Configuration</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions Library</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6 pt-6">
              <Form {...configForm}>
                <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-6">
                  <FormField
                    control={configForm.control}
                    name="enableFollowUp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Follow-Up Suggestions
                          </FormLabel>
                          <FormDescription>
                            Show suggested follow-up questions after AI responses.
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
                    control={configForm.control}
                    name="suggestionsCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Suggestions</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select count" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 suggestion</SelectItem>
                            <SelectItem value="2">2 suggestions</SelectItem>
                            <SelectItem value="3">3 suggestions</SelectItem>
                            <SelectItem value="4">4 suggestions</SelectItem>
                            <SelectItem value="5">5 suggestions</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Maximum number of follow-up suggestions to show.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={configForm.control}
                      name="suggestionsStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suggestions Style</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buttons">Buttons</SelectItem>
                              <SelectItem value="chips">Chips</SelectItem>
                              <SelectItem value="links">Links</SelectItem>
                              <SelectItem value="text">Plain Text</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={configForm.control}
                      name="buttonStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Style</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rounded">Rounded</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                              <SelectItem value="outline">Outline</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={configForm.control}
                    name="customPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter specific instructions for generating follow-up questions..."
                            className="h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide guidance to the AI on how to generate contextual follow-up questions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => configForm.reset()}
                    >
                      Reset
                    </Button>
                    <Button type="submit">
                      Save Configuration
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="suggestions" className="pt-6">
              <div className="space-y-6">
                <Form {...suggestionForm}>
                  <form onSubmit={suggestionForm.handleSubmit(onSuggestionSubmit)} className="space-y-4 border rounded-md p-4">
                    <h3 className="font-medium">Add New Suggestion</h3>
                    
                    <FormField
                      control={suggestionForm.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suggestion Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter suggestion text..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={suggestionForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="pricing">Pricing</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                                <SelectItem value="feature">Feature</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={suggestionForm.control}
                        name="context"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Context</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select context" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Contexts</SelectItem>
                                <SelectItem value="product">Product Discussion</SelectItem>
                                <SelectItem value="service">Service Discussion</SelectItem>
                                <SelectItem value="pricing">Pricing Discussion</SelectItem>
                                <SelectItem value="support">Support Discussion</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Suggestion
                      </Button>
                    </div>
                  </form>
                </Form>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Active</TableHead>
                        <TableHead>Suggestion Text</TableHead>
                        <TableHead className="w-[120px]">Category</TableHead>
                        <TableHead className="w-[150px]">Context</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suggestions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No suggestions added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        suggestions.map((suggestion) => (
                          <TableRow key={suggestion.id}>
                            <TableCell>
                              <Checkbox
                                checked={suggestion.active}
                                onCheckedChange={() => toggleSuggestionStatus(suggestion.id)}
                              />
                            </TableCell>
                            <TableCell>{suggestion.text}</TableCell>
                            <TableCell className="capitalize">{suggestion.category}</TableCell>
                            <TableCell className="capitalize">{suggestion.context}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteSuggestion(suggestion.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>
            See how your follow-up suggestions will appear to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 bg-muted/50 space-y-3">
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Thank you for your question. Here's information about our product features. Is there anything else you'd like to know?
                </p>
              </div>
            </div>
            
            {configForm.watch("enableFollowUp") && (
              <div className="ml-10 flex flex-wrap gap-2 pt-1">
                {suggestions
                  .filter((s) => s.active)
                  .slice(0, parseInt(configForm.watch("suggestionsCount")))
                  .map((suggestion) => (
                    <Button 
                      key={suggestion.id} 
                      variant={configForm.watch("suggestionsStyle") === "outline" ? "outline" : "secondary"} 
                      size="sm"
                      className={
                        configForm.watch("buttonStyle") === "rounded" ? "rounded-full" :
                        configForm.watch("buttonStyle") === "square" ? "rounded-none" :
                        configForm.watch("buttonStyle") === "minimal" ? "bg-transparent hover:bg-secondary/80" :
                        ""
                      }
                    >
                      {suggestion.text}
                    </Button>
                  ))
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
