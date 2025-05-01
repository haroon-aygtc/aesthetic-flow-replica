
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Star, 
  RefreshCcw,
  Play,
  Save
} from "lucide-react";

export function BrandingEngine() {
  const { toast } = useToast();
  
  const [brandSettings, setBrandSettings] = useState({
    tone: "professional",
    formality: [3], // 1-5 scale
    personality: "balanced",
    industryKnowledge: "technology",
    companySizePresentation: "enterprise",
    audienceLevel: "intermediate",
    brandValues: ["innovation", "quality", "reliability"]
  });
  
  const [previewPrompt, setPreviewPrompt] = useState("Tell me about your company's product offerings.");
  const [previewResponse, setPreviewResponse] = useState("");
  
  const availableBrandValues = [
    "innovation", "quality", "reliability", "sustainability", 
    "inclusivity", "affordability", "luxury", "simplicity", 
    "creativity", "tradition", "excellence", "customer-focus"
  ];

  const handleBrandValueToggle = (value: string) => {
    setBrandSettings(prev => {
      const currentValues = [...prev.brandValues];
      if (currentValues.includes(value)) {
        return { ...prev, brandValues: currentValues.filter(v => v !== value) };
      } else {
        if (currentValues.length < 5) { // Limit to 5 values
          return { ...prev, brandValues: [...currentValues, value] };
        }
        return prev;
      }
    });
  };

  const handleSettingChange = (setting: string, value: any) => {
    setBrandSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleGeneratePreview = () => {
    // This would call the AI API in a real implementation
    const toneMap: Record<string, string> = {
      friendly: "warm and conversational",
      professional: "polished and businesslike",
      technical: "detailed and precise",
      casual: "relaxed and approachable",
      formal: "sophisticated and refined"
    };
    
    const personalityMap: Record<string, string> = {
      helpful: "helpful and supportive",
      authoritative: "confident and decisive",
      balanced: "balanced and measured",
      enthusiastic: "energetic and positive"
    };
    
    // Generate a simulated response based on settings
    const simulatedResponse = `[${toneMap[brandSettings.tone]}, formality level ${brandSettings.formality[0]}/5]\n\nThank you for your interest in our company! Our product offerings are designed with ${brandSettings.brandValues.join(", ")} in mind.\n\nWe specialize in ${brandSettings.industryKnowledge} solutions targeted for ${brandSettings.companySizePresentation} clients with ${brandSettings.audienceLevel}-level expertise. Our approach is ${personalityMap[brandSettings.personality]}.\n\nWould you like more specific information about any particular product line?`;
    
    setPreviewResponse(simulatedResponse);
    
    toast({
      title: "Preview Generated",
      description: "A preview response has been generated based on your brand settings."
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Brand Settings Saved",
      description: "Your brand voice settings have been saved and will be applied to all AI responses."
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Star className="h-5 w-5" />
              Brand Voice
            </CardTitle>
            <CardDescription>
              Define how your AI should represent your brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tone">Communication Tone</Label>
                <Select 
                  id="tone" 
                  value={brandSettings.tone}
                  onValueChange={(value) => handleSettingChange("tone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly &amp; Conversational</SelectItem>
                    <SelectItem value="professional">Professional &amp; Business-like</SelectItem>
                    <SelectItem value="technical">Technical &amp; Detailed</SelectItem>
                    <SelectItem value="casual">Casual &amp; Relaxed</SelectItem>
                    <SelectItem value="formal">Formal &amp; Sophisticated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="formality">
                    Formality Level: {brandSettings.formality[0]}
                  </Label>
                </div>
                <Slider
                  id="formality"
                  min={1}
                  max={5}
                  step={1}
                  value={brandSettings.formality}
                  onValueChange={(value) => handleSettingChange("formality", value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Casual</span>
                  <span>Neutral</span>
                  <span>Formal</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personality">Personality Type</Label>
                <Select 
                  id="personality" 
                  value={brandSettings.personality}
                  onValueChange={(value) => handleSettingChange("personality", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a personality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helpful">Helpful &amp; Supportive</SelectItem>
                    <SelectItem value="authoritative">Authoritative &amp; Confident</SelectItem>
                    <SelectItem value="balanced">Balanced &amp; Measured</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic &amp; Energetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry-knowledge">Industry Knowledge</Label>
                <Select 
                  id="industry-knowledge" 
                  value={brandSettings.industryKnowledge}
                  onValueChange={(value) => handleSettingChange("industryKnowledge", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology &amp; Software</SelectItem>
                    <SelectItem value="finance">Finance &amp; Banking</SelectItem>
                    <SelectItem value="healthcare">Healthcare &amp; Medical</SelectItem>
                    <SelectItem value="education">Education &amp; E-learning</SelectItem>
                    <SelectItem value="retail">Retail &amp; E-commerce</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing &amp; Industrial</SelectItem>
                    <SelectItem value="service">Professional Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Presentation</Label>
                  <Select 
                    id="company-size" 
                    value={brandSettings.companySizePresentation}
                    onValueChange={(value) => handleSettingChange("companySizePresentation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Innovative Startup</SelectItem>
                      <SelectItem value="small">Small Business</SelectItem>
                      <SelectItem value="midsize">Mid-sized Company</SelectItem>
                      <SelectItem value="enterprise">Enterprise Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="audience-level">Audience Knowledge</Label>
                  <Select 
                    id="audience-level" 
                    value={brandSettings.audienceLevel}
                    onValueChange={(value) => handleSettingChange("audienceLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Brand Values (Select up to 5)</CardTitle>
            <CardDescription>
              Choose values that should be reflected in communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableBrandValues.map(value => (
                <Button
                  key={value}
                  variant={brandSettings.brandValues.includes(value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBrandValueToggle(value)}
                  className="capitalize"
                >
                  {value}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" /> Save Brand Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Star className="h-5 w-5" />
            Brand Voice Preview
          </CardTitle>
          <CardDescription>
            Test how your AI will respond with current brand settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="preview-prompt">Enter a sample user message</Label>
              <Input
                id="preview-prompt"
                placeholder="e.g., Tell me about your company"
                value={previewPrompt}
                onChange={(e) => setPreviewPrompt(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleGeneratePreview}
              disabled={!previewPrompt}
            >
              <Play className="h-4 w-4 mr-2" /> Generate Preview
            </Button>
            
            {previewResponse && (
              <div className="space-y-2">
                <Label>AI Response Preview</Label>
                <div className="border rounded-md p-4 bg-muted/30 whitespace-pre-wrap">
                  {previewResponse}
                </div>
              </div>
            )}
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Current Brand Profile</h3>
              <ul className="space-y-1 text-sm">
                <li><span className="font-medium">Tone:</span> {brandSettings.tone.charAt(0).toUpperCase() + brandSettings.tone.slice(1)}</li>
                <li><span className="font-medium">Formality:</span> Level {brandSettings.formality[0]} out of 5</li>
                <li><span className="font-medium">Personality:</span> {brandSettings.personality.charAt(0).toUpperCase() + brandSettings.personality.slice(1)}</li>
                <li><span className="font-medium">Industry:</span> {brandSettings.industryKnowledge.charAt(0).toUpperCase() + brandSettings.industryKnowledge.slice(1)}</li>
                <li><span className="font-medium">Company Presentation:</span> {brandSettings.companySizePresentation.charAt(0).toUpperCase() + brandSettings.companySizePresentation.slice(1)}</li>
                <li><span className="font-medium">Values:</span> {brandSettings.brandValues.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(", ")}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
