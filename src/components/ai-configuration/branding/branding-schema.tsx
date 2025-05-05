
import { z } from "zod";

// Define the branding settings validation schema
export const BrandingFormSchema = z.object({
  brandName: z.string().min(2, {
    message: "Brand name must be at least 2 characters.",
  }),
  brandVoice: z.string().min(1, {
    message: "Please select a brand voice.",
  }),
  responseTone: z.string().min(1, {
    message: "Please select a response tone.",
  }),
  formalityLevel: z.string().min(1, {
    message: "Please select a formality level.",
  }),
  personalityTraits: z.array(z.string()).min(1, {
    message: "Select at least one personality trait.",
  }),
  customPrompt: z.string().optional(),
  useBrandImages: z.boolean().default(false),
  businessType: z.string().min(1, {
    message: "Please select your business type."
  }),
  targetAudience: z.string().min(1, {
    message: "Please select your target audience."
  }),
});

export type BrandingFormValues = z.infer<typeof BrandingFormSchema>;
