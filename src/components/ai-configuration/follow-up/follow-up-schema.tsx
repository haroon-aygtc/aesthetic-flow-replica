
import { z } from "zod";

// Define the follow-up settings validation schema
export const followUpConfigSchema = z.object({
  enableFollowUp: z.boolean().default(true),
  suggestionsCount: z.string().min(1, {
    message: "Please select the number of suggestions.",
  }),
  suggestionsStyle: z.string().min(1, {
    message: "Please select a suggestion style.",
  }),
  buttonStyle: z.string().min(1, {
    message: "Please select a button style.",
  }),
  customPrompt: z.string().optional(),
  contexts: z.array(z.string()),
});

export type FollowUpConfigValues = z.infer<typeof followUpConfigSchema>;

// Define the suggestion schema
export const suggestionSchema = z.object({
  text: z.string().min(3, {
    message: "Suggestion text must be at least 3 characters."
  }),
  category: z.string().min(1, {
    message: "Please select a category."
  }),
  context: z.string().min(1, {
    message: "Please select a context."
  }),
});

export type SuggestionValues = z.infer<typeof suggestionSchema>;

export interface Suggestion {
  id: string;
  text: string;
  category: string;
  context: string;
  active: boolean;
}
