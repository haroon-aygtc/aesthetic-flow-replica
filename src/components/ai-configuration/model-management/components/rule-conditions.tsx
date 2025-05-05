
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { RuleCondition, ModelActivationRuleFormValues } from "@/types/model-activation-rules";
import { commonFields, conditionOperators } from "../constants/rule-form-constants";

interface RuleConditionsProps {
  form: UseFormReturn<ModelActivationRuleFormValues>;
}

export function RuleConditions({ form }: RuleConditionsProps) {
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
  );
}
