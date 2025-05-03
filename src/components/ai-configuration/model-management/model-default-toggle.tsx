
import React from "react";
import { useFormContext } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export const ModelDefaultToggle: React.FC = () => {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name="is_default"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Set as Default Model
            </FormLabel>
            <div className="text-sm text-muted-foreground">
              This model will be used when no specific model is selected
            </div>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
