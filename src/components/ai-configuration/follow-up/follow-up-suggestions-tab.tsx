
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Suggestion, suggestionSchema, SuggestionValues } from "./follow-up-schema";

interface FollowUpSuggestionsTabProps {
  suggestions: Suggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>;
}

export function FollowUpSuggestionsTab({ suggestions, setSuggestions }: FollowUpSuggestionsTabProps) {
  const suggestionForm = useForm<SuggestionValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      text: "",
      category: "general",
      context: "all",
    },
  });

  const onSuggestionSubmit = (values: SuggestionValues) => {
    // Add new suggestion
    const newSuggestionItem: Suggestion = {
      id: Date.now().toString(),
      text: values.text,
      category: values.category,
      context: values.context,
      active: true,
    };
    
    setSuggestions((prev) => [...prev, newSuggestionItem]);
    suggestionForm.reset({
      text: "",
      category: "general",
      context: "all",
    });
    
    toast({
      title: "Suggestion added",
      description: "Your follow-up suggestion has been added to the list.",
    });
  };

  const toggleSuggestionStatus = (id: string) => {
    setSuggestions((prev) => 
      prev.map((suggestion) => 
        suggestion.id === id 
          ? { ...suggestion, active: !suggestion.active } 
          : suggestion
      )
    );
  };

  const deleteSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((suggestion) => suggestion.id !== id));
    toast({
      title: "Suggestion deleted",
      description: "The follow-up suggestion has been removed.",
    });
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
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[150px]">Context</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No suggestions added yet
                </TableCell>
              </TableRow>
            ) : (
              suggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell>
                    <Checkbox
                      checked={suggestion.active}
                      onCheckedChange={() => toggleSuggestionStatus(suggestion.id)}
                    />
                  </TableCell>
                  <TableCell>{suggestion.text}</TableCell>
                  <TableCell className="capitalize">{suggestion.category}</TableCell>
                  <TableCell className="capitalize">{suggestion.context}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteSuggestion(suggestion.id)}
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
