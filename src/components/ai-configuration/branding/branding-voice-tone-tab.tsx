
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { BrandingFormSchema } from "./branding-schema";
import { z } from "zod";

type BrandingVoiceToneTabProps = {
  form: UseFormReturn<z.infer<typeof BrandingFormSchema>>;
};

export function BrandingVoiceToneTab({ form }: BrandingVoiceToneTabProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="brandName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter your brand name" {...field} />
            </FormControl>
            <FormDescription>
              This is how your AI assistant will refer to your company.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="brandVoice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Voice</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              The primary voice characteristic of your AI.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="responseTone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Response Tone</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="helpful">Helpful</SelectItem>
                <SelectItem value="informative">Informative</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="engaging">Engaging</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              How your AI should sound when responding to users.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="formalityLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Formality Level</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select formality level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="veryFormal">Very Formal</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              The level of formality in AI communications.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
