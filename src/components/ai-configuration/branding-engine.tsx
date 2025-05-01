
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { BrandingFormSchema } from "./branding/branding-schema";
import { BrandingVoiceToneTab } from "./branding/branding-voice-tone-tab";
import { BrandingPersonalityTab } from "./branding/branding-personality-tab";
import { BrandingPreview } from "./branding/branding-preview";
import { z } from "zod";

export function BrandingEngine() {
  const [activeTab, setActiveTab] = useState("voiceTone");
  
  // Define branding form
  const form = useForm<z.infer<typeof BrandingFormSchema>>({
    resolver: zodResolver(BrandingFormSchema),
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

  const onSubmit = (values: z.infer<typeof BrandingFormSchema>) => {
    // In a real implementation, this would call an API to save the branding settings
    console.log("Branding settings:", values);
    
    toast({
      title: "Branding settings saved",
      description: "Your AI branding configuration has been updated.",
    });
  };

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
                <TabsContent value="voiceTone">
                  <BrandingVoiceToneTab form={form} />
                </TabsContent>
                
                <TabsContent value="brandPersonality">
                  <BrandingPersonalityTab form={form} />
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
      
      <BrandingPreview watch={form.watch} />
    </div>
  );
}
