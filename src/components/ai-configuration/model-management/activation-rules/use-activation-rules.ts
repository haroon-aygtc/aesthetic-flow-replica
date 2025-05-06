
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModelActivationRule } from "@/types/model-activation-rules";
import { AIModelData } from "@/utils/ai-model-service";

export function useActivationRules(selectedModel: AIModelData, onRuleUpdate: () => void) {
  const [rules, setRules] = useState<ModelActivationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<ModelActivationRule | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedModel?.id) {
      loadRules(selectedModel.id);
    }
  }, [selectedModel]);

  const loadRules = async (modelId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ai-models/${modelId}/rules`);
      if (!response.ok) {
        throw new Error("Failed to load rules");
      }
      const responseData = await response.json();

      // Check if the response has a data property that is an array
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        setRules(responseData.data);
      }
      // Check if the response itself is an array
      else if (Array.isArray(responseData)) {
        setRules(responseData);
      }
      // If neither, log an error and set an empty array
      else {
        console.error("Unexpected response format:", responseData);
        setRules([]);
      }
    } catch (error) {
      console.error("Error loading rules:", error);
      toast({
        title: "Error",
        description: "Failed to load model activation rules",
        variant: "destructive"
      });
      // Ensure rules is always an array
      setRules([]);
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

  return {
    rules,
    isLoading,
    isCreating,
    setIsCreating,
    editingRule,
    setEditingRule,
    deleteRuleId,
    setDeleteRuleId,
    handleToggleActive,
    handleDelete,
    handleSaveRule
  };
}
