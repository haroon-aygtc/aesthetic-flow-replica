
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { knowledgeBaseService, QAPair } from "@/utils/knowledge-base-service";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  MoreVertical,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";

interface KnowledgeQAPairsProps {
  qaPairs: QAPair[];
  onQAPairsChange: (qaPairs: QAPair[]) => void;
}

export function KnowledgeQAPairs({ qaPairs, onQAPairsChange }: KnowledgeQAPairsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedPairId, setExpandedPairId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPair, setEditingPair] = useState<QAPair | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = ["all", ...Array.from(new Set(qaPairs.map(pair => pair.category)))];

  const filteredPairs = qaPairs.filter(pair => {
    const matchesSearch = 
      pair.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pair.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || pair.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeletePair = async (id: string) => {
    try {
      await knowledgeBaseService.deleteQAPair(id);
      onQAPairsChange(qaPairs.filter(pair => pair.id !== id));
      toast({
        title: "Q&A pair deleted",
        description: "The Q&A pair has been removed successfully"
      });
    } catch (error) {
      console.error("Error deleting Q&A pair:", error);
      toast({
        title: "Error deleting Q&A pair",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleEditPair = (pair: QAPair) => {
    setEditingPair({ ...pair });
    setIsEditing(true);
  };

  const handleCreateNewPair = () => {
    setEditingPair({
      id: "",
      question: "",
      answer: "",
      category: "General",
      created_at: new Date().toISOString(),
    });
    setIsEditing(true);
  };

  const handleSavePair = async () => {
    if (!editingPair || !editingPair.question || !editingPair.answer) {
      toast({
        title: "Validation error",
        description: "Question and answer fields are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let result;
      if (editingPair.id) {
        // Update existing pair
        result = await knowledgeBaseService.updateQAPair(editingPair.id, {
          question: editingPair.question,
          answer: editingPair.answer,
          category: editingPair.category,
        });
        
        onQAPairsChange(
          qaPairs.map(pair => (pair.id === editingPair.id ? result.data : pair))
        );
        
        toast({
          title: "Q&A pair updated",
          description: "Your changes have been saved successfully"
        });
      } else {
        // Create new pair
        result = await knowledgeBaseService.createQAPair({
          question: editingPair.question,
          answer: editingPair.answer,
          category: editingPair.category,
        });
        
        onQAPairsChange([result.data, ...qaPairs]);
        
        toast({
          title: "Q&A pair created",
          description: "New Q&A pair has been added successfully"
        });
      }
      
      setIsEditing(false);
      setEditingPair(null);
    } catch (error) {
      console.error("Error saving Q&A pair:", error);
      toast({
        title: "Error saving Q&A pair",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <Input
          placeholder="Search Q&A pairs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <Button onClick={handleCreateNewPair} disabled={isEditing}>
          <Plus className="h-4 w-4 mr-2" />
          New Pair
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <Badge 
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category === "all" ? "All" : category}
          </Badge>
        ))}
      </div>

      {isEditing && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <Input
                value={editingPair?.question || ""}
                onChange={(e) => setEditingPair(prev => prev ? { ...prev, question: e.target.value } : null)}
                placeholder="Enter the question..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={editingPair?.answer || ""}
                onChange={(e) => setEditingPair(prev => prev ? { ...prev, answer: e.target.value } : null)}
                placeholder="Enter the answer..."
                className="min-h-[150px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                value={editingPair?.category || ""}
                onChange={(e) => setEditingPair(prev => prev ? { ...prev, category: e.target.value } : null)}
                placeholder="Category (e.g., General, Support, etc.)"
              />
              <p className="text-xs text-muted-foreground">
                Categories help organize your Q&A pairs. Use existing categories or create new ones.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditingPair(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePair} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredPairs.length > 0 ? (
          filteredPairs.map((pair) => (
            <Card key={pair.id} className="overflow-hidden">
              <div className={cn(
                "p-4 cursor-pointer bg-muted/30",
                expandedPairId === pair.id ? "border-b" : ""
              )}
              onClick={() => setExpandedPairId(expandedPairId === pair.id ? null : pair.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">{pair.question}</h3>
                      <div className="flex items-center mt-1">
                        <Badge className="mr-2" variant="outline">
                          {pair.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created: {new Date(pair.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditPair(pair);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePair(pair.id);
                        }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {expandedPairId === pair.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedPairId === pair.id && (
                <CardContent className="p-4 pt-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {pair.answer}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground border rounded-lg">
            {searchQuery || selectedCategory !== "all"
              ? "No Q&A pairs match your search criteria."
              : "No Q&A pairs found. Create some Q&A pairs to get started."}
          </div>
        )}
      </div>
    </div>
  );
}
