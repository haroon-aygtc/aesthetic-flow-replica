
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Check, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Define the branding settings validation schema
const brandingSchema = z.object({
  brandName: z.string().min(2, {
    message: "Brand name must be at least 2 characters.",
  }),
  brandVoice: z.string().min(1, {
    message: "Please select a brand voice.",
  }),
  responseTone: z.string().min(1, {
    message: "Please select a response tone.",
  }),
  formalityLevel: z.string().min(1, {
    message: "Please select a formality level.",
  }),
  personalityTraits: z.array(z.string()).min(1, {
    message: "Select at least one personality trait.",
  }),
  customPrompt: z.string().optional(),
  useBrandImages: z.boolean().default(false),
  businessType: z.string().min(1, {
    message: "Please select your business type."
  }),
  targetAudience: z.string().min(1, {
    message: "Please select your target audience."
  }),
});

export function BrandingEngine() {
  const [activeTab, setActiveTab] = useState("voiceTone");
  
  // Define branding form
  const form = useForm<z.infer<typeof brandingSchema>>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      brandName: "",
      brandVoice: "friendly",
      responseTone: "helpful",
      formalityLevel: "casual",
      personalityTraits: ["trustworthy"],
      customPrompt: "",
      useBrandImages: false,
      businessType: "retail",
      targetAudience: "general",
    },
  });

  const onSubmit = (values: z.infer<typeof brandingSchema>) => {
    // In a real implementation, this would call an API to save the branding settings
    console.log("Branding settings:", values);
    
    toast({
      title: "Branding settings saved",
      description: "Your AI branding configuration has been updated.",
    });
  };

  const personalityOptions = [
    { value: "trustworthy", label: "Trustworthy" },
    { value: "innovative", label: "Innovative" },
    { value: "authoritative", label: "Authoritative" },
    { value: "caring", label: "Caring" },
    { value: "energetic", label: "Energetic" },
    { value: "sophisticated", label: "Sophisticated" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Branding Engine</CardTitle>
          <CardDescription>
            Customize how your AI assistant represents your brand and communicates with users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="voiceTone" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="voiceTone">Voice & Tone</TabsTrigger>
              <TabsTrigger value="brandPersonality">Brand Personality</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
                <TabsContent value="voiceTone" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your brand name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is how your AI assistant will refer to your company.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brandVoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Voice</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select voice" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The primary voice characteristic of your AI.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="responseTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Response Tone</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="helpful">Helpful</SelectItem>
                            <SelectItem value="informative">Informative</SelectItem>
                            <SelectItem value="empathetic">Empathetic</SelectItem>
                            <SelectItem value="direct">Direct</SelectItem>
                            <SelectItem value="engaging">Engaging</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How your AI should sound when responding to users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="formalityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formality Level</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select formality level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="veryFormal">Very Formal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The level of formality in AI communications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="brandPersonality" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                            <SelectItem value="youngAdults">Young Adults</SelectItem>
                            <SelectItem value="seniors">Seniors</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Brand Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter specific instructions about how your AI should represent your brand..."
                            className="h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          These instructions will be added to your AI's system message.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="useBrandImages"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Use Brand Images
                          </FormLabel>
                          <FormDescription>
                            Allow AI to use your uploaded brand images in responses.
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
                </TabsContent>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.reset()}
                  >
                    Reset
                  </Button>
                  <Button type="submit">
                    Save Brand Settings
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand Preview</CardTitle>
          <CardDescription>
            See how your AI assistant's personality will appear to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-md p-4 border">
            <div className="flex gap-2 items-center mb-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              <span className="text-xs">AI Assistant Sample Response</span>
            </div>
            <p className="text-sm">
              Hello! I'm your assistant from {form.watch("brandName") || "[Your Brand]"}. I'm here to help you with any questions you might have about our products and services. Please let me know how I can assist you today!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
