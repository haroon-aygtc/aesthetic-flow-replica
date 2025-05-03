import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface RuleCondition {
  field: string;
  operator: string;
  value: string | number;
}

interface ModelActivationRule {
  id: number;
  model_id: number;
  name: string;
  query_type: string | null;
  use_case: string | null;
  tenant_id: number | null;
  active: boolean;
  priority: number;
  conditions: RuleCondition[];
}

interface ModelActivationRuleFormProps {
  modelId: number;
  rule: ModelActivationRule | null;
  onSave: (rule: ModelActivationRule, isNew: boolean) => void;
  onCancel: () => void;
}

// Define query types and operators for the form
const queryTypes = [
  { value: "general", label: "General" },
  { value: "factual", label: "Factual" },
  { value: "creative", label: "Creative" },
  { value: "technical", label: "Technical" },
];

const useCases = [
  { value: "customer_support", label: "Customer Support" },
  { value: "content_generation", label: "Content Generation" },
  { value: "data_analysis", label: "Data Analysis" },
  { value: "document_search", label: "Document Search" },
];

const conditionOperators = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
];

// Common fields that can be used for conditions
const commonFields = [
  { value: "user_id", label: "User ID" },
  { value: "user_role", label: "User Role" },
  { value: "message_length", label: "Message Length" },
  { value: "topic", label: "Message Topic" },
  { value: "language", label: "Language" },
  { value: "complexity", label: "Complexity" },
];

// Schema for the form validation
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  query_type: z.string().nullable(),
  use_case: z.string().nullable(),
  tenant_id: z.string().nullable().transform(val => val ? Number(val) : null),
  priority: z.string().transform(val => Number(val)),
  active: z.boolean(),
  conditions: z.array(
    z.object({
      field: z.string().min(1, "Field is required"),
      operator: z.string().min(1, "Operator is required"),
      value: z.string().min(1, "Value is required"),
    })
  ),
});

// Define the type for form values
type FormValues = z.infer<typeof formSchema>;

export function ModelActivationRuleForm({
  modelId,
  rule,
  onSave,
  onCancel,
}: ModelActivationRuleFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [tenants, setTenants] = useState<Array<{ id: number; name: string }>>([]);
  const isEditing = !!rule;
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rule?.name || "",
      query_type: rule?.query_type || null,
      use_case: rule?.use_case || null,
      tenant_id: rule?.tenant_id ? String(rule.tenant_id) : null,
      priority: String(rule?.priority || 0),
      active: rule?.active ?? true,
      conditions: rule?.conditions || [],
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

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    
    try {
      const endpoint = isEditing
        ? `/api/ai-models/${modelId}/rules/${rule.id}`
        : `/api/ai-models/${modelId}/rules`;
        
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          model_id: modelId,
        })
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

  const addCondition = () => {
    const currentConditions = form.getValues().conditions || [];
    form.setValue("conditions", [
      ...currentConditions,
      { field: "", operator: "equals", value: "" }
    ]);
  };

  const removeCondition = (index: number) => {
    const currentConditions = form.getValues().conditions;
    form.setValue("conditions", currentConditions.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Activation Rule" : "Create Activation Rule"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter a name for this rule" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="query_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Query Type</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value || ""} 
                        onValueChange={(value) => field.onChange(value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any query type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any query type</SelectItem>
                          {queryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="use_case"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Case</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value || ""} 
                        onValueChange={(value) => field.onChange(value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any use case" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any use case</SelectItem>
                          {useCases.map((useCase) => (
                            <SelectItem key={useCase.value} value={useCase.value}>{useCase.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tenant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value || ""} 
                        onValueChange={(value) => field.onChange(value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any tenant</SelectItem>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id.toString()}>{tenant.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Set whether this rule should be active or disabled
                    </p>
                  </div>
                  <FormControl>
                    <div>
                      <Label htmlFor="rule-active" className="sr-only">Active</Label>
                      <Input
                        id="rule-active"
                        type="checkbox" 
                        className="toggle"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base">Additional Conditions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-1" /> Add Condition
                </Button>
              </div>
              
              {form.watch("conditions").length === 0 && (
                <Alert variant="default" className="bg-muted/50 mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No additional conditions specified. This rule will match based on the general criteria above.
                  </AlertDescription>
                </Alert>
              )}
              
              {form.watch("conditions").map((condition, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-center mb-2">
                  <Select
                    value={condition.field}
                    onValueChange={(value) => {
                      const newConditions = [...form.getValues().conditions];
                      newConditions[index].field = value;
                      form.setValue("conditions", newConditions);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonFields.map((field) => (
                        <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => {
                      const newConditions = [...form.getValues().conditions];
                      newConditions[index].operator = value;
                      form.setValue("conditions", newConditions);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => {
                      const newConditions = [...form.getValues().conditions];
                      newConditions[index].value = e.target.value;
                      form.setValue("conditions", newConditions);
                    }}
                  />
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive" 
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Spinner className="mr-2" size="sm" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
