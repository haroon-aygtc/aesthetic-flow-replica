import { z } from "zod";

export const modelFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less")
    .refine((val) => /^[\w\s\-_.]+$/i.test(val), {
      message:
        "Name can only contain letters, numbers, spaces, hyphens, underscores, and periods",
    }),
  provider: z.string().min(1, "Provider is required"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  api_key: z
    .string()
    .refine((val) => !val || val.trim().length > 0, {
      message: "API key cannot be empty if provided",
    })
    .optional(),
  is_default: z.boolean().default(false),
  active: z.boolean().default(true),
  fallback_model_id: z.number().nullable().optional(),
  confidence_threshold: z
    .number()
    .min(0, "Confidence threshold must be at least 0")
    .max(1, "Confidence threshold must not exceed 1")
    .default(0.7),
  settings: z.object({
    model_name: z.string().optional(),
    temperature: z
      .number()
      .min(0, "Temperature must be at least 0")
      .max(1, "Temperature must not exceed 1")
      .default(0.7),
    max_tokens: z
      .number()
      .int("Max tokens must be a whole number")
      .min(1, "Max tokens must be at least 1")
      .max(8000, "Max tokens must not exceed 8000")
      .default(2048)
      .refine((val) => Number.isInteger(val) && val >= 1 && val <= 8000, {
        message: "Max tokens must be a whole number between 1 and 8000",
      }),
    top_p: z
      .number()
      .min(0, "Top P must be at least 0")
      .max(1, "Top P must not exceed 1")
      .default(1.0),
    frequency_penalty: z
      .number()
      .min(0, "Frequency penalty must be at least 0")
      .max(2, "Frequency penalty must not exceed 2")
      .default(0.0),
    presence_penalty: z
      .number()
      .min(0, "Presence penalty must be at least 0")
      .max(2, "Presence penalty must not exceed 2")
      .default(0.0),
  }),
});

export type ModelFormValues = z.infer<typeof modelFormSchema>;
