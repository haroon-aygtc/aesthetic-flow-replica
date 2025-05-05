// Import the API service and toast utility
import api from "./api";
import { Suggestion } from "@/components/ai-configuration/follow-up/follow-up-schema";
import { toast } from "@/hooks/use-toast";

export interface FollowUpSettings {
  widgetId: number;
  enabled: boolean;
  position: string;
  suggestionsCount: number;
  suggestionsStyle: string;
  buttonStyle: string;
  contexts: string[];
  customPrompt?: string;
}

export interface FollowUpStats {
  engagementRate: number;
  clickThroughRate: number;
  conversionRate: number;
  topPerforming: Array<{
    text: string;
    engagementRate: number;
    change: number;
  }>;
  trendsData: Array<{
    date: string;
    engagements: number;
    clicks: number;
    conversions: number;
  }>;
}

export const followUpService = {
  // Get follow-up settings for a widget
  getFollowUpSettings: async (widgetId: number): Promise<FollowUpSettings> => {
    try {
      const response = await api.get(`widgets/${widgetId}/follow-up`);
      return response.data;
    } catch (error) {
      console.error("Error fetching follow-up settings:", error);
      toast({
        title: "Error",
        description: "Failed to load follow-up settings",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update follow-up settings for a widget
  updateFollowUpSettings: async (settings: FollowUpSettings): Promise<FollowUpSettings> => {
    try {
      console.log("Sending settings to API:", settings);
      const response = await api.put(`widgets/${settings.widgetId}/follow-up`, settings);
      console.log("API response:", response.data);
      toast({
        title: "Settings updated",
        description: "Follow-up settings have been saved",
      });
      return response.data;
    } catch (error) {
      console.error("Error updating follow-up settings:", error);
      toast({
        title: "Error",
        description: "Failed to save follow-up settings",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get suggestions for a widget
  getSuggestions: async (widgetId: number): Promise<Suggestion[]> => {
    try {
      const response = await api.get(`/widgets/${widgetId}/suggestions`);
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to load follow-up suggestions",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Add a suggestion
  addSuggestion: async (widgetId: number, suggestion: Omit<Suggestion, 'id'>): Promise<Suggestion> => {
    try {
      // Make sure we're using the correct widgetId from the parameter
      const suggestionData = {
        ...suggestion,
        widget_id: widgetId // Ensure widget_id matches the parameter
      };

      console.log("Sending suggestion to API:", suggestionData);
      const response = await api.post(`/widgets/${widgetId}/suggestions`, suggestionData);
      console.log("API response:", response.data);
      toast({
        title: "Suggestion added",
        description: "New follow-up suggestion has been added",
      });
      return response.data;
    } catch (error) {
      console.error("Error adding suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to add follow-up suggestion",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Update a suggestion
  updateSuggestion: async (widgetId: number, suggestionId: number, suggestion: Partial<Suggestion>): Promise<Suggestion> => {
    try {
      const response = await api.put(`/widgets/${widgetId}/suggestions/${suggestionId}`, suggestion);
      toast({
        title: "Suggestion updated",
        description: "Follow-up suggestion has been updated",
      });
      return response.data;
    } catch (error) {
      console.error("Error updating suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to update follow-up suggestion",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Delete a suggestion
  deleteSuggestion: async (widgetId: number, suggestionId: number): Promise<void> => {
    try {
      await api.delete(`/widgets/${widgetId}/suggestions/${suggestionId}`);
      toast({
        title: "Suggestion deleted",
        description: "Follow-up suggestion has been removed",
      });
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to delete follow-up suggestion",
        variant: "destructive",
      });
      throw error;
    }
  },

  // Get analytics for follow-ups
  getFollowUpStats: async (widgetId: number, period: string = "30d"): Promise<FollowUpStats> => {
    try {
      const response = await api.get(`/widgets/${widgetId}/follow-up/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching follow-up stats:", error);
      toast({
        title: "Error",
        description: "Failed to load follow-up analytics",
        variant: "destructive",
      });
      throw error;
    }
  },
};

export default followUpService;
