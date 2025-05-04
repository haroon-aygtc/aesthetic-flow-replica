
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { ModelActivationRule, ModelActivationRuleFormValues } from "@/types/model-activation-rules";
import { formSchema } from "../schemas/rule-form-schema";

interface UseRuleFormProps {
  modelId: number;
  rule: ModelActivationRule | null;
  onSave: (rule: ModelActivationRule, isNew: boolean) => void;
}

export function useRuleForm({ modelId, rule, onSave }: UseRuleFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [tenants, setTenants] = useState<Array<{ id: number; name: string }>>([]);
  const isEditing = !!rule;
  const { toast } = useToast();

  const form = useForm<ModelActivationRuleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rule?.name || "",
      query_type: rule?.query_type || null,
      use_case: rule?.use_case || null,
      tenant_id: rule?.tenant_id ? String(rule.tenant_id) : null,
      priority: String(rule?.priority || 0),
      active: rule?.active ?? true,
      conditions: rule?.conditions?.map(c => ({
        field: c.field,
        operator: c.operator,
        value: String(c.value), // Ensure value is a string
      })) || [],
    }
  });

  useEffect(() => {
    // Load tenants for the dropdown
    const loadTenants = async () => {
      try {
        // This would typically fetch from an API
        // For now we'll use mock data
        setTenants([
          { id: 1, name: "Acme Corp" },
          { id: 2, name: "Wayne Enterprises" },
          { id: 3, name: "Stark Industries" }
        ]);
      } catch (error) {
        console.error("Error loading tenants:", error);
      }
    };
    
    loadTenants();
  }, []);

  const handleSubmit = async (values: ModelActivationRuleFormValues) => {
    setIsSaving(true);
    
    try {
      const endpoint = isEditing
        ? `/api/ai-models/${modelId}/rules/${rule!.id}`
        : `/api/ai-models/${modelId}/rules`;
        
      const method = isEditing ? "PUT" : "POST";
      
      // Convert form values to API format
      const apiData = {
        ...values,
        model_id: modelId,
        tenant_id: values.tenant_id ? Number(values.tenant_id) : null,
        priority: Number(values.priority)
      };
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save rule");
      }

      const savedRule = await response.json();
      
      toast({
        title: isEditing ? "Rule Updated" : "Rule Created",
        description: `"${values.name}" has been ${isEditing ? "updated" : "created"} successfully.`
      });
      
      onSave(savedRule, !isEditing);
    } catch (error) {
      console.error("Error saving rule:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save rule",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    isSaving,
    tenants,
    isEditing,
    handleSubmit
  };
}
