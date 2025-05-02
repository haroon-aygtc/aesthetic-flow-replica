
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { followUpConfigSchema, FollowUpConfigValues } from "./follow-up-schema";
import { toast } from "@/hooks/use-toast";

interface FollowUpSettingsTabProps {
  defaultValues: FollowUpConfigValues;
}

export function FollowUpSettingsTab({ defaultValues }: FollowUpSettingsTabProps) {
  const configForm = useForm<FollowUpConfigValues>({
    resolver: zodResolver(followUpConfigSchema),
    defaultValues,
  });

  const onConfigSubmit = (values: FollowUpConfigValues) => {
    // In a real implementation, this would call an API to save the follow-up settings
    console.log("Follow-up settings:", values);
    
    toast({
      title: "Follow-up settings saved",
      description: "Your AI follow-up configuration has been updated.",
    });
  };

  return (
    <Form {...configForm}>
      <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-6">
        <FormField
          control={configForm.control}
          name="enableFollowUp"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Enable Follow-Up Suggestions
                </FormLabel>
                <FormDescription>
                  Show suggested follow-up questions after AI responses.
                </FormDescription>
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
        
        <FormField
          control={configForm.control}
          name="suggestionsCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Suggestions</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 suggestion</SelectItem>
                  <SelectItem value="2">2 suggestions</SelectItem>
                  <SelectItem value="3">3 suggestions</SelectItem>
                  <SelectItem value="4">4 suggestions</SelectItem>
                  <SelectItem value="5">5 suggestions</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Maximum number of follow-up suggestions to show.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={configForm.control}
            name="suggestionsStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suggestions Style</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buttons">Buttons</SelectItem>
                    <SelectItem value="chips">Chips</SelectItem>
                    <SelectItem value="links">Links</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={configForm.control}
            name="buttonStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Style</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={configForm.control}
          name="customPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Instructions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter specific instructions for generating follow-up questions..."
                  className="h-24"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide guidance to the AI on how to generate contextual follow-up questions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => configForm.reset()}
          >
            Reset
          </Button>
          <Button type="submit">
            Save Configuration
          </Button>
        </div>
      </form>
    </Form>
  );
}
