
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
  position: z.string().default("end"),
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
  position: z.string().default("end"),
  format: z.string().default("button"),
  url: z.string().optional(),
  tooltipText: z.string().optional(), // This will be mapped to tooltip_text in the API
});

export type SuggestionValues = z.infer<typeof suggestionSchema>;

export interface Suggestion {
  id: number;
  widget_id: number;
  text: string;
  category: string;
  context: string;
  position: string;
  format: string;
  url?: string;
  tooltip_text?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Format options for follow-up answers
export const suggestionFormatOptions = [
  { value: "button", label: "Button" },
  { value: "link", label: "Link" },
  { value: "bubble", label: "Bubble" },
  { value: "tooltip", label: "Tooltip" },
  { value: "card", label: "Card" },
];

// Position options for follow-up answers
export const suggestionPositionOptions = [
  { value: "start", label: "Start (Before Response)" },
  { value: "inline", label: "Inline (Within Response)" },
  { value: "end", label: "End (After Response)" },
];
