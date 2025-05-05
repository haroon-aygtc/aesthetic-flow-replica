
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Link, MessageSquare, Circle, HelpCircle, Square } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Suggestion, suggestionSchema, SuggestionValues, suggestionFormatOptions } from "./follow-up-schema";

interface FollowUpSuggestionsTabProps {
  suggestions: Suggestion[];
  onAddSuggestion: (suggestion: Omit<Suggestion, 'id' | 'widget_id'>) => void;
  onUpdateSuggestion: (suggestionId: number, suggestion: Partial<Suggestion>) => void;
  onDeleteSuggestion: (suggestionId: number) => void;
  onToggleStatus: (suggestionId: number) => void;
}

export function FollowUpSuggestionsTab({
  suggestions,
  onAddSuggestion,
  onUpdateSuggestion,
  onDeleteSuggestion,
  onToggleStatus
}: FollowUpSuggestionsTabProps) {
  const suggestionForm = useForm<SuggestionValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      text: "",
      category: "general",
      context: "all",
      format: "button",
      url: "",
      tooltipText: "",
    },
  });

  const watchFormat = suggestionForm.watch("format");

  const onSuggestionSubmit = (values: SuggestionValues) => {
    // Create new suggestion object
    const newSuggestion = {
      text: values.text,
      category: values.category,
      context: values.context,
      position: "end", // Default position
      format: values.format,
      url: values.url || undefined,
      tooltip_text: values.tooltipText || undefined,
      active: true,
    };

    // Call API to add suggestion
    onAddSuggestion(newSuggestion);

    // Reset form
    suggestionForm.reset({
      text: "",
      category: "general",
      context: "all",
      format: "button",
      url: "",
      tooltipText: "",
    });
  };

  const handleToggleStatus = (id: number) => {
    // Call the API to toggle the suggestion status
    onToggleStatus(id);
  };

  const handleDeleteSuggestion = (id: number) => {
    // Call the API to delete the suggestion
    onDeleteSuggestion(id);
  };

  const getFormatIcon = (format: string | undefined) => {
    switch (format) {
      case "link": return <Link className="h-4 w-4" />;
      case "bubble": return <Circle className="h-4 w-4" />;
      case "tooltip": return <HelpCircle className="h-4 w-4" />;
      case "card": return <Square className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Form {...suggestionForm}>
        <form onSubmit={suggestionForm.handleSubmit(onSuggestionSubmit)} className="space-y-4 border rounded-md p-4">
          <h3 className="font-medium">Add New Suggestion</h3>

          <FormField
            control={suggestionForm.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suggestion Text</FormLabel>
                <FormControl>
                  <Input placeholder="Enter suggestion text..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={suggestionForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={suggestionForm.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Context</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contexts</SelectItem>
                      <SelectItem value="product">Product Discussion</SelectItem>
                      <SelectItem value="service">Service Discussion</SelectItem>
                      <SelectItem value="pricing">Pricing Discussion</SelectItem>
                      <SelectItem value="support">Support Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={suggestionForm.control}
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Format</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {suggestionFormatOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  How this follow-up suggestion should be displayed to users
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {(watchFormat === "link" || watchFormat === "card") && (
            <FormField
              control={suggestionForm.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    The link destination for this follow-up
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchFormat === "tooltip" && (
            <FormField
              control={suggestionForm.control}
              name="tooltipText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tooltip Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional information to show on hover" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end">
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add Suggestion
            </Button>
          </div>
        </form>
      </Form>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Active</TableHead>
              <TableHead>Suggestion Text</TableHead>
              <TableHead className="w-[90px]">Format</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[150px]">Context</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No suggestions added yet
                </TableCell>
              </TableRow>
            ) : (
              suggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell>
                    <Checkbox
                      checked={suggestion.active}
                      onCheckedChange={() => handleToggleStatus(Number(suggestion.id))}
                    />
                  </TableCell>
                  <TableCell>{suggestion.text}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getFormatIcon(suggestion.format)}
                      <span className="capitalize text-xs">{suggestion.format || "button"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{suggestion.category}</TableCell>
                  <TableCell className="capitalize">{suggestion.context}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSuggestion(Number(suggestion.id))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
