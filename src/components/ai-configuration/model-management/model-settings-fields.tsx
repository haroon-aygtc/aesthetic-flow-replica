
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getModelOptions } from "./model-provider-options";

export const ModelSettingsFields: React.FC = () => {
  const form = useFormContext();
  const selectedProvider = useWatch({
    control: form.control,
    name: "provider",
  });
  
  const modelOptions = getModelOptions(selectedProvider);
  
  if (!selectedProvider) {
    return null;
  }
  
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="font-medium">Model Settings</h3>
      
      {/* Model name selection */}
      <FormField
        control={form.control}
        name="settings.model_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {modelOptions.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
