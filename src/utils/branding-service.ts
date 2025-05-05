// Import the API service and toast utility
import api from "./api";
import { toast } from "@/hooks/use-toast";

export interface BrandingSettings {
  widgetId: number;
  brandName: string;
  brandVoice: string;
  responseTone: string;
  formalityLevel: string;
  personalityTraits: string[];
  customPrompt?: string;
  useBrandImages: boolean;
  businessType: string;
  targetAudience: string;
}

export const brandingService = {
  // Get branding settings for a widget
  getBrandingSettings: async (widgetId: number): Promise<BrandingSettings> => {
    try {
      const response = await api.get(`/widgets/${widgetId}/branding`);
      return response.data;
    } catch (error) {
      console.error("Error fetching branding settings:", error);
      toast({
        title: "Error",
        description: "Failed to load branding settings",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update branding settings for a widget
  updateBrandingSettings: async (settings: BrandingSettings): Promise<BrandingSettings> => {
    try {
      const response = await api.put(`/widgets/${settings.widgetId}/branding`, settings);
      toast({
        title: "Settings updated",
        description: "Branding settings have been saved",
      });
      return response.data;
    } catch (error) {
      console.error("Error updating branding settings:", error);
      toast({
        title: "Error",
        description: "Failed to save branding settings",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Generate branding preview message
  generateBrandingPreview: async (widgetId: number, prompt: string): Promise<string> => {
    try {
      const response = await api.post(`/widgets/${widgetId}/branding/preview`, { prompt });
      return response.data.message;
    } catch (error) {
      console.error("Error generating branding preview:", error);
      toast({
        title: "Error",
        description: "Failed to generate branding preview",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get branding templates
  getBrandingTemplates: async (): Promise<any[]> => {
    try {
      const response = await api.get(`branding-templates`);
      return response.data;
    } catch (error) {
      console.error("Error fetching branding templates:", error);
      toast({
        title: "Error",
        description: "Failed to load branding templates",
        variant: "destructive",
      });
      throw error;
    }
  }
};

export default brandingService;
