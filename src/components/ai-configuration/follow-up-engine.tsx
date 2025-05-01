
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  Plus, 
  Trash2,
  MoveUp,
  MoveDown,
  Play,
  Save
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FollowUpSuggestion {
  id: string;
  text: string;
  condition: string;
  order: number;
  active: boolean;
}

export function FollowUpEngine() {
  const { toast } = useToast();
  
  const [followUps, setFollowUps] = useState<FollowUpSuggestion[]>([
    {
      id: "follow-1",
      text: "Would you like to know more about our pricing options?",
      condition: "mentions-product",
      order: 1,
      active: true
    },
    {
      id: "follow-2",
      text: "Do you have any other questions about our service?",
      condition: "end-of-explanation",
      order: 2,
      active: true
    },
    {
      id: "follow-3",
      text: "Would you like to schedule a demo with one of our specialists?",
      condition: "mentions-features",
      order: 3,
      active: true
    },
    {
      id: "follow-4",
      text: "Can I help you with anything else today?",
      condition: "always",
      order: 4,
      active: true
    }
  ]);
  
  const [currentFollowUp, setCurrentFollowUp] = useState<FollowUpSuggestion | null>(null);
  const [followUpText, setFollowUpText] = useState("");
  const [followUpCondition, setFollowUpCondition] = useState("always");
  const [placementOption, setPlacementOption] = useState("end");
  const [limitSuggestions, setLimitSuggestions] = useState<number[]>([2]);
  const [testResponse, setTestResponse] = useState("");
  
  const conditions = [
    { value: "always", label: "Always Show" },
    { value: "mentions-product", label: "When User Mentions Product" },
    { value: "mentions-price", label: "When User Mentions Price" },
    { value: "mentions-features", label: "When User Mentions Features" },
    { value: "new-conversation", label: "Start of Conversation" },
    { value: "end-of-explanation", label: "After Explanation" },
    { value: "question-answered", label: "After Question Answered" }
  ];

  const handleCreateFollowUp = () => {
    if (followUpText.trim()) {
      const newFollowUp: FollowUpSuggestion = {
        id: `follow-${Date.now()}`,
        text: followUpText,
        condition: followUpCondition,
        order: followUps.length + 1,
        active: true
      };
      
      setFollowUps([...followUps, newFollowUp]);
      setFollowUpText("");
      
      toast({
        title: "Follow-Up Created",
        description: "Your new follow-up suggestion has been added."
      });
    }
  };

  const handleUpdateFollowUp = () => {
    if (currentFollowUp && followUpText.trim()) {
      const updatedFollowUps = followUps.map(item => 
        item.id === currentFollowUp.id ? 
          { ...item, text: followUpText, condition: followUpCondition } : 
          item
      );
      
      setFollowUps(updatedFollowUps);
      setCurrentFollowUp(null);
      setFollowUpText("");
      setFollowUpCondition("always");
      
      toast({
        title: "Follow-Up Updated",
        description: "The follow-up suggestion has been updated."
      });
    }
  };

  const handleEditFollowUp = (followUp: FollowUpSuggestion) => {
    setCurrentFollowUp(followUp);
    setFollowUpText(followUp.text);
    setFollowUpCondition(followUp.condition);
  };

  const handleDeleteFollowUp = (id: string) => {
    setFollowUps(followUps.filter(item => item.id !== id));
    if (currentFollowUp?.id === id) {
      setCurrentFollowUp(null);
      setFollowUpText("");
      setFollowUpCondition("always");
    }
    
    toast({
      title: "Follow-Up Deleted",
      description: "The follow-up suggestion has been removed."
    });
  };

  const handleMoveFollowUp = (id: string, direction: "up" | "down") => {
    const index = followUps.findIndex(item => item.id === id);
    if ((direction === "up" && index === 0) || 
        (direction === "down" && index === followUps.length - 1)) {
      return;
    }
    
    const newFollowUps = [...followUps];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap items
    [newFollowUps[index], newFollowUps[swapIndex]] = [newFollowUps[swapIndex], newFollowUps[index]];
    
    // Update order property
    const updatedFollowUps = newFollowUps.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));
    
    setFollowUps(updatedFollowUps);
  };

  const handleToggleActive = (id: string, active: boolean) => {
    const updatedFollowUps = followUps.map(item => 
      item.id === id ? { ...item, active } : item
    );
    setFollowUps(updatedFollowUps);
  };

  const handleTestFollowUps = () => {
    // This would call the AI API in a real implementation
    const activeFollowUps = followUps
      .filter(item => item.active)
      .sort((a, b) => a.order - b.order)
      .slice(0, limitSuggestions[0]);
      
    const followUpTexts = activeFollowUps.map(item => `- ${item.text}`).join('\n');
    
    let simulatedResponse = 'This is a sample AI response that would include relevant information based on the user\'s query.';
    
    if (placementOption === 'inline') {
      simulatedResponse += `\n\nHere are some follow-up questions you might consider:\n${followUpTexts}`;
    } else if (placementOption === 'end') {
      simulatedResponse += `\n\n${followUpTexts}`;
    }
    
    setTestResponse(simulatedResponse);
    
    toast({
      title: "Test Generated",
      description: "A sample response with follow-ups has been generated."
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your follow-up engine settings have been saved and will be applied to all AI responses."
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-7 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Follow-Up Suggestions
              </CardTitle>
            </div>
            <CardDescription>
              Create and manage follow-up questions for your AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <div className="grid grid-cols-8 p-3 border-b bg-muted/40 font-medium text-sm">
                <div className="col-span-3">Suggestion</div>
                <div className="col-span-2">Condition</div>
                <div className="col-span-1 text-center">Active</div>
                <div className="col-span-1 text-center">Order</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>
              
              <div className="divide-y">
                {followUps.length > 0 ? (
                  followUps.map((followUp) => (
                    <div key={followUp.id} className="grid grid-cols-8 p-3 items-center text-sm">
                      <div className="col-span-3 text-sm">{followUp.text}</div>
                      <div className="col-span-2 text-xs">
                        {conditions.find(c => c.value === followUp.condition)?.label || followUp.condition}
                      </div>
                      <div className="col-span-1 text-center">
                        <Checkbox 
                          checked={followUp.active} 
                          onCheckedChange={(checked) => 
                            handleToggleActive(followUp.id, checked === true)
                          }
                        />
                      </div>
                      <div className="col-span-1 flex justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMoveFollowUp(followUp.id, "up")}
                          disabled={followUp.order === 1}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMoveFollowUp(followUp.id, "down")}
                          disabled={followUp.order === followUps.length}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="col-span-1 flex justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEditFollowUp(followUp)}
                        >
                          <Bell className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteFollowUp(followUp.id)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No follow-up suggestions found. Create some to get started.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {currentFollowUp ? "Edit Follow-Up Suggestion" : "Create New Follow-Up"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="follow-up-text">Suggestion Text</Label>
                <Input
                  id="follow-up-text"
                  placeholder="Enter a follow-up question or suggestion"
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="condition">Display Condition</Label>
                <Select 
                  id="condition" 
                  value={followUpCondition}
                  onValueChange={setFollowUpCondition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="When to show this suggestion" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Define when this follow-up suggestion should be presented to users
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex space-x-2 w-full">
              {currentFollowUp ? (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setCurrentFollowUp(null);
                      setFollowUpText("");
                      setFollowUpCondition("always");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleUpdateFollowUp}
                    disabled={!followUpText.trim()}
                  >
                    Update Follow-Up
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full"
                  onClick={handleCreateFollowUp}
                  disabled={!followUpText.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Follow-Up
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="md:col-span-5 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Follow-Up Settings
            </CardTitle>
            <CardDescription>
              Configure how follow-up suggestions work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="placement">Placement Option</Label>
                <RadioGroup 
                  id="placement" 
                  value={placementOption}
                  onValueChange={setPlacementOption}
                  className="grid gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="end" id="end" />
                    <Label htmlFor="end" className="font-normal">End of response</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inline" id="inline" />
                    <Label htmlFor="inline" className="font-normal">Inline with clear header</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dynamic" id="dynamic" />
                    <Label htmlFor="dynamic" className="font-normal">Dynamic (context-dependent)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit-suggestions">
                  Maximum suggestions shown: {limitSuggestions[0]}
                </Label>
                <Select 
                  id="limit-suggestions"
                  value={limitSuggestions[0].toString()}
                  onValueChange={(value) => setLimitSuggestions([parseInt(value)])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maximum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 suggestion</SelectItem>
                    <SelectItem value="2">2 suggestions</SelectItem>
                    <SelectItem value="3">3 suggestions</SelectItem>
                    <SelectItem value="4">4 suggestions</SelectItem>
                    <SelectItem value="5">5 suggestions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="respect-branding" defaultChecked />
                  <div className="grid gap-1.5">
                    <Label htmlFor="respect-branding" className="font-medium">
                      Match brand voice
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Apply brand voice settings to follow-up suggestions
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="clickable-suggestions" defaultChecked />
                  <div className="grid gap-1.5">
                    <Label htmlFor="clickable-suggestions" className="font-medium">
                      Make suggestions clickable
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Allow users to click suggestions to submit them
                    </p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" onClick={handleSaveSettings}>
                <Save className="h-4 w-4 mr-2" /> Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-4 w-4" />
              Test Follow-Ups
            </CardTitle>
            <CardDescription>
              Preview how follow-up suggestions will appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full" 
                onClick={handleTestFollowUps}
              >
                <Play className="h-4 w-4 mr-2" /> Generate Preview
              </Button>
              
              {testResponse && (
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="whitespace-pre-wrap">
                    {testResponse}
                  </div>
                </div>
              )}
              
              <div className="space-y-2 text-muted-foreground text-sm">
                <p>Active suggestions: {followUps.filter(f => f.active).length}</p>
                <p>Maximum shown: {limitSuggestions[0]}</p>
                <p>Placement: {placementOption === "end" ? "End of response" : placementOption === "inline" ? "Inline with header" : "Dynamic"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
