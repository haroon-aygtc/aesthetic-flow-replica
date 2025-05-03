
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ArrowUpDown, Trash2, Edit } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ModelActivationRuleForm } from "./model-activation-rule-form";
import { AIModelData } from "@/utils/ai-model-service";
import { ModelActivationRule } from "@/types/model-activation-rules";

interface ModelActivationRulesProps {
  selectedModel: AIModelData | null;
  onRuleUpdate: () => void;
}

export function ModelActivationRules({ selectedModel, onRuleUpdate }: ModelActivationRulesProps) {
  const [rules, setRules] = useState<ModelActivationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<ModelActivationRule | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedModel?.id) {
      loadRules(selectedModel.id);
    } else {
      setRules([]);
    }
  }, [selectedModel]);

  const loadRules = async (modelId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ai-models/${modelId}/rules`);
      if (!response.ok) {
        throw new Error("Failed to load rules");
      }
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error("Error loading rules:", error);
      toast({
        title: "Error",
        description: "Failed to load model activation rules",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (rule: ModelActivationRule) => {
    try {
      const response = await fetch(`/api/ai-models/${selectedModel?.id}/rules/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...rule,
          active: !rule.active
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update rule status");
      }

      setRules(prevRules => prevRules.map(r => 
        r.id === rule.id ? { ...r, active: !r.active } : r
      ));

      toast({
        title: rule.active ? "Rule Deactivated" : "Rule Activated",
        description: `"${rule.name}" has been ${rule.active ? "deactivated" : "activated"}.`
      });
    } catch (error) {
      console.error("Error toggling rule activation:", error);
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteRuleId || !selectedModel?.id) return;
    
    try {
      const response = await fetch(`/api/ai-models/${selectedModel.id}/rules/${deleteRuleId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete rule");
      }

      setRules(prevRules => prevRules.filter(r => r.id !== deleteRuleId));
      setDeleteRuleId(null);
      
      toast({
        title: "Rule Deleted",
        description: "The activation rule has been deleted successfully."
      });

      // Notify parent component of the update
      onRuleUpdate();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive"
      });
    }
  };

  const handleSaveRule = (rule: ModelActivationRule, isNew: boolean) => {
    if (isNew) {
      setRules(prevRules => [...prevRules, rule]);
    } else {
      setRules(prevRules => 
        prevRules.map(r => r.id === rule.id ? rule : r)
      );
    }
    
    setIsCreating(false);
    setEditingRule(null);
    
    // Notify parent component of the update
    onRuleUpdate();
  };

  if (!selectedModel) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Model Activation Rules
            </CardTitle>
            <CardDescription>
              Define when this model should be automatically selected based on context
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" /> Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No activation rules configured</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create First Rule
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {rule.query_type && (
                        <Badge variant="outline" className="bg-primary/10">
                          Query: {rule.query_type}
                        </Badge>
                      )}
                      {rule.use_case && (
                        <Badge variant="outline" className="bg-primary/10">
                          Use case: {rule.use_case}
                        </Badge>
                      )}
                      {rule.tenant_id && (
                        <Badge variant="outline" className="bg-primary/10">
                          Tenant: {rule.tenant_id}
                        </Badge>
                      )}
                      {rule.conditions && rule.conditions.length > 0 && (
                        <Badge variant="outline" className="bg-secondary/50">
                          +{rule.conditions.length} conditions
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <ArrowUpDown className="h-3 w-3 mr-1" /> {rule.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.active}
                      onCheckedChange={() => handleToggleActive(rule)}
                      aria-label={`Toggle rule ${rule.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive" 
                        onClick={() => setDeleteRuleId(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Create/Edit Rule Dialog */}
      {(isCreating || editingRule) && (
        <ModelActivationRuleForm
          modelId={selectedModel.id!}
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => {
            setIsCreating(false);
            setEditingRule(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteRuleId !== null} onOpenChange={() => setDeleteRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
