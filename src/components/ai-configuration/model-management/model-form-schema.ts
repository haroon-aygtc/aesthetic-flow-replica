
import * as z from "zod";

// Define form schema with Zod
export const modelFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  provider: z.string().min(1, { message: "Provider is required." }),
  description: z.string().optional(),
  api_key: z.string().optional(),
  is_default: z.boolean().optional(),
  settings: z.object({
    model_name: z.string().optional(),
    temperature: z.number().min(0).max(1).optional(),
    max_tokens: z.number().min(1).optional(),
  }).optional(),
});

export type ModelFormValues = z.infer<typeof modelFormSchema>;
