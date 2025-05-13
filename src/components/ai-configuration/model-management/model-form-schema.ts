import { z } from "zod";

export const modelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  description: z.string().optional(),
  api_key: z.string().optional(),
  is_default: z.boolean().default(false),
  active: z.boolean().default(true),
  fallback_model_id: z.number().nullable().optional(),
  confidence_threshold: z.number().min(0).max(1).default(0.7),
  settings: z.object({
    model_name: z.string().optional(),
    temperature: z.number().min(0).max(1).default(0.7),
    max_tokens: z.number().min(1).default(2048),
    top_p: z.number().min(0).max(1).default(1.0),
    frequency_penalty: z.number().min(0).max(2).default(0.0),
    presence_penalty: z.number().min(0).max(2).default(0.0),
  }),
});

export type ModelFormValues = z.infer<typeof modelFormSchema>;
