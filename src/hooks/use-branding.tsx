
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import api from "@/utils/api";
import { z } from "zod";
import { BrandingFormSchema } from "@/components/ai-configuration/branding/branding-schema";

export type BrandingSettings = z.infer<typeof BrandingFormSchema>;

export function useBranding({ widgetId }: { widgetId: number }) {
  const queryClient = useQueryClient();

  // Query for branding settings
  const {
    data: brandingSettings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['branding-settings', widgetId],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/widgets/${widgetId}/branding`);
        return response.data;
      } catch (error) {
        console.error("Error fetching branding settings:", error);
        throw error;
      }
    },
    // If API isn't yet implemented, you can return default values
    placeholderData: {
      brandName: "YourBrand",
      brandVoice: "friendly",
      responseTone: "helpful",
      formalityLevel: "casual",
      personalityTraits: ["trustworthy"],
      customPrompt: "",
      useBrandImages: false,
      businessType: "retail",
      targetAudience: "general",
    }
  });

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: BrandingSettings) => {
      const response = await api.put(`/api/widgets/${widgetId}/branding`, newSettings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding-settings', widgetId] });
      toast({
        title: "Branding updated",
        description: "Your AI assistant's branding has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating branding",
        description: error.message || "Failed to update branding settings.",
        variant: "destructive",
      });
    }
  });

  return {
    brandingSettings,
    isLoading,
    error,
    updateBranding: (settings: BrandingSettings) => updateSettingsMutation.mutate(settings),
    isUpdating: updateSettingsMutation.isPending
  };
}
