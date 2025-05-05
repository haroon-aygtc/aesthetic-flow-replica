
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { ModelActivationRule } from "@/types/model-activation-rules";
import { queryTypes, useCases } from "./constants/rule-form-constants";
import { useRuleForm } from "./hooks/use-rule-form";
import { RuleConditions } from "./components/rule-conditions";

interface ModelActivationRuleFormProps {
  modelId: number;
  rule: ModelActivationRule | null;
  onSave: (rule: ModelActivationRule, isNew: boolean) => void;
  onCancel: () => void;
}

export function ModelActivationRuleForm({
  modelId,
  rule,
  onSave,
  onCancel,
}: ModelActivationRuleFormProps) {
  const { form, isSaving, tenants, isEditing, handleSubmit } = useRuleForm({
    modelId,
    rule,
    onSave,
  });

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
            
            <RuleConditions form={form} />

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
