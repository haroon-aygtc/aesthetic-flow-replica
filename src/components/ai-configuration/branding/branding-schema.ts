
import * as z from "zod";

export const BrandingFormSchema = z.object({
  brandName: z.string().min(1, "Brand name is required").max(100),
  brandVoice: z.enum(["friendly", "professional", "casual", "formal", "technical"]),
  responseTone: z.enum(["helpful", "informative", "persuasive", "empathetic", "precise"]),
  formalityLevel: z.enum(["formal", "neutral", "casual"]),
  personalityTraits: z.array(z.string()).min(1, "Select at least one personality trait"),
  customPrompt: z.string().optional(),
  useBrandImages: z.boolean().default(false),
  businessType: z.string().min(1, "Business type is required"),
  targetAudience: z.string().min(1, "Target audience is required"),
});

export type BrandingFormValues = z.infer<typeof BrandingFormSchema>;

export const personalityTraitOptions = [
  { value: "trustworthy", label: "Trustworthy" },
  { value: "innovative", label: "Innovative" },
  { value: "authoritative", label: "Authoritative" },
  { value: "approachable", label: "Approachable" },
  { value: "supportive", label: "Supportive" },
  { value: "knowledgeable", label: "Knowledgeable" },
  { value: "empathetic", label: "Empathetic" },
  { value: "witty", label: "Witty" },
  { value: "creative", label: "Creative" },
  { value: "analytical", label: "Analytical" },
  { value: "detail-oriented", label: "Detail-oriented" },
  { value: "enthusiastic", label: "Enthusiastic" }
];

export const businessTypeOptions = [
  { value: "retail", label: "Retail" },
  { value: "saas", label: "SaaS" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "hospitality", label: "Hospitality" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "professional-services", label: "Professional Services" },
  { value: "non-profit", label: "Non-Profit" },
  { value: "other", label: "Other" }
];

export const targetAudienceOptions = [
  { value: "general", label: "General" },
  { value: "enterprise", label: "Enterprise Businesses" },
  { value: "small-business", label: "Small Businesses" },
  { value: "technical", label: "Technical Experts" },
  { value: "students", label: "Students" },
  { value: "seniors", label: "Seniors" },
  { value: "parents", label: "Parents" },
  { value: "professionals", label: "Professionals" },
  { value: "researchers", label: "Researchers" }
];
