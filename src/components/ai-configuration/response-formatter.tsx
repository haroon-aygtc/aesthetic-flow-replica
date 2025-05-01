
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { 
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  RefreshCcw,
  Save,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";

// Import the marked utility
import { marked } from "./utils/marked";

export function ResponseFormatter() {
  const { toast } = useToast();
  
  const [previewText, setPreviewText] = useState(
    "# AI Response Example\n\nThis is an example of how your AI responses will be formatted. The formatting rules you select will apply to all AI responses.\n\n## Key Points\n\n- Formatting can include **bold text** and *italics*\n- Lists and headings help organize information\n- Code blocks for technical content\n\n```javascript\nconst greeting = 'Hello, world!';\nconsole.log(greeting);\n```\n\nThe tone and style of responses can be customized to match your brand voice."
  );
  
  const [formattingOptions, setFormattingOptions] = useState({
    headings: true,
    bold: true,
    italic: true,
    lists: true,
    codeBlocks: true,
    alignment: "left",
    paragraphSpacing: 1.5,
    maxParagraphLength: 4
  });
  
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  const presets = [
    { id: "minimal", name: "Minimal", description: "Clean, simple formatting with minimal styling" },
    { id: "technical", name: "Technical", description: "Optimized for code and technical content" },
    { id: "business", name: "Business", description: "Professional formatting for business communication" },
    { id: "creative", name: "Creative", description: "Enhanced styling for creative content" }
  ];

  const handleOptionChange = (option: string, value: any) => {
    setFormattingOptions({ ...formattingOptions, [option]: value });
    // In a real implementation, this would regenerate the preview
    setActivePreset(null); // Clear active preset when custom changes are made
  };

  const handleApplyPreset = (presetId: string) => {
    let newOptions;
    
    switch(presetId) {
      case "minimal":
        newOptions = {
          headings: true,
          bold: false,
          italic: false,
          lists: true,
          codeBlocks: false,
          alignment: "left",
          paragraphSpacing: 1,
          maxParagraphLength: 6
        };
        break;
      case "technical":
        newOptions = {
          headings: true,
          bold: true,
          italic: true,
          lists: true,
          codeBlocks: true,
          alignment: "left",
          paragraphSpacing: 1.8,
          maxParagraphLength: 3
        };
        break;
      case "business":
        newOptions = {
          headings: true,
          bold: true,
          italic: false,
          lists: true,
          codeBlocks: false,
          alignment: "left",
          paragraphSpacing: 1.5,
          maxParagraphLength: 4
        };
        break;
      case "creative":
        newOptions = {
          headings: true,
          bold: true,
          italic: true,
          lists: true,
          codeBlocks: true,
          alignment: "center",
          paragraphSpacing: 2,
          maxParagraphLength: 2
        };
        break;
      default:
        return;
    }
    
    setFormattingOptions(newOptions);
    setActivePreset(presetId);
    
    toast({
      title: "Preset Applied",
      description: `The ${presets.find(p => p.id === presetId)?.name} formatting preset has been applied.`
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your formatting settings have been saved and will be applied to all AI responses."
    });
  };

  const handleResetSettings = () => {
    setFormattingOptions({
      headings: true,
      bold: true,
      italic: true,
      lists: true,
      codeBlocks: true,
      alignment: "left",
      paragraphSpacing: 1.5,
      maxParagraphLength: 4
    });
    setActivePreset(null);
    
    toast({
      title: "Settings Reset",
      description: "Formatting settings have been reset to default values."
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Code className="h-5 w-5" />
              Formatting Rules
            </CardTitle>
            <CardDescription>
              Configure how AI responses should be formatted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="text-base">Formatting Elements</Label>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="headings" 
                      checked={formattingOptions.headings}
                      onCheckedChange={(checked) => 
                        handleOptionChange("headings", checked === true)
                      }
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="headings" className="font-medium flex items-center">
                        <Heading2 className="h-4 w-4 mr-2" /> Headings
                      </Label>
                      <p className="text-muted-foreground text-xs">Allow the AI to use headings for sections</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bold" 
                      checked={formattingOptions.bold}
                      onCheckedChange={(checked) => 
                        handleOptionChange("bold", checked === true)
                      }
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="bold" className="font-medium flex items-center">
                        <Bold className="h-4 w-4 mr-2" /> Bold Text
                      </Label>
                      <p className="text-muted-foreground text-xs">Allow emphasis with bold formatting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="italic" 
                      checked={formattingOptions.italic}
                      onCheckedChange={(checked) => 
                        handleOptionChange("italic", checked === true)
                      }
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="italic" className="font-medium flex items-center">
                        <Italic className="h-4 w-4 mr-2" /> Italic Text
                      </Label>
                      <p className="text-muted-foreground text-xs">Allow emphasis with italic formatting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lists" 
                      checked={formattingOptions.lists}
                      onCheckedChange={(checked) => 
                        handleOptionChange("lists", checked === true)
                      }
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="lists" className="font-medium flex items-center">
                        <List className="h-4 w-4 mr-2" /> Lists
                      </Label>
                      <p className="text-muted-foreground text-xs">Format information as bullet and numbered lists</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="codeBlocks" 
                      checked={formattingOptions.codeBlocks}
                      onCheckedChange={(checked) => 
                        handleOptionChange("codeBlocks", checked === true)
                      }
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="codeBlocks" className="font-medium flex items-center">
                        <Code className="h-4 w-4 mr-2" /> Code Blocks
                      </Label>
                      <p className="text-muted-foreground text-xs">Format code snippets in code blocks</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-base" htmlFor="alignment">Text Alignment</Label>
                <RadioGroup 
                  id="alignment" 
                  className="flex space-x-2 mt-2"
                  value={formattingOptions.alignment}
                  onValueChange={(value) => handleOptionChange("alignment", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="align-left" />
                    <Label htmlFor="align-left" className="flex items-center">
                      <AlignLeft className="h-4 w-4 mr-2" /> Left
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="align-center" />
                    <Label htmlFor="align-center" className="flex items-center">
                      <AlignCenter className="h-4 w-4 mr-2" /> Center
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="align-right" />
                    <Label htmlFor="align-right" className="flex items-center">
                      <AlignRight className="h-4 w-4 mr-2" /> Right
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="paragraph-spacing">
                    Paragraph Spacing: {formattingOptions.paragraphSpacing}x
                  </Label>
                </div>
                <Slider
                  id="paragraph-spacing"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[formattingOptions.paragraphSpacing]}
                  onValueChange={(value) => handleOptionChange("paragraphSpacing", value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Compact</span>
                  <span>Balanced</span>
                  <span>Spacious</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-paragraph">
                    Max Paragraph Length: {formattingOptions.maxParagraphLength} sentences
                  </Label>
                </div>
                <Slider
                  id="max-paragraph"
                  min={1}
                  max={8}
                  step={1}
                  value={[formattingOptions.maxParagraphLength]}
                  onValueChange={(value) => handleOptionChange("maxParagraphLength", value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Short</span>
                  <span>Medium</span>
                  <span>Long</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleResetSettings}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" /> Save Settings
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Formatting Presets</CardTitle>
            <CardDescription>
              Apply predefined formatting styles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant={activePreset === preset.id ? "default" : "outline"}
                  className="justify-start font-normal"
                  onClick={() => handleApplyPreset(preset.id)}
                >
                  <div className="text-left">
                    <p className="font-medium">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Code className="h-5 w-5" />
            Format Preview
          </CardTitle>
          <CardDescription>
            See how your AI responses will look with current settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`border rounded-md p-4 prose max-w-none dark:prose-invert prose-headings:mb-2 prose-p:my-1.5 overflow-auto max-h-[600px] text-${formattingOptions.alignment}`}
            style={{ 
              lineHeight: formattingOptions.paragraphSpacing * 1.5
            }}
          >
            <div dangerouslySetInnerHTML={{ 
              __html: marked.parse(previewText) 
            }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This preview shows how your AI responses will be formatted based on current settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
