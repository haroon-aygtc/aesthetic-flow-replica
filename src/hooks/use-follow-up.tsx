
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  followUpService, 
  FollowUpSettings, 
  FollowUpStats 
} from "@/utils/follow-up-service";
import { Suggestion } from "@/components/ai-configuration/follow-up/follow-up-schema";

interface UseFollowUpOptions {
  widgetId: number;
  initialSettings?: Partial<FollowUpSettings>;
}

export function useFollowUp({ widgetId, initialSettings }: UseFollowUpOptions) {
  const queryClient = useQueryClient();
  
  // Query for follow-up settings
  const { 
    data: settings, 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useQuery({
    queryKey: ['followup-settings', widgetId],
    queryFn: () => followUpService.getFollowUpSettings(widgetId),
    initialData: initialSettings ? {
      widgetId,
      enabled: true,
      position: "end",
      suggestionsCount: 3,
      suggestionsStyle: "buttons",
      buttonStyle: "rounded",
      contexts: ["all"],
      ...initialSettings
    } : undefined
  });
  
  // Query for suggestions
  const { 
    data: suggestions = [], 
    isLoading: isLoadingSuggestions,
    error: suggestionsError 
  } = useQuery({
    queryKey: ['followup-suggestions', widgetId],
    queryFn: () => followUpService.getSuggestions(widgetId)
  });
  
  // Query for analytics
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    error: statsError 
  } = useQuery({
    queryKey: ['followup-stats', widgetId],
    queryFn: () => followUpService.getFollowUpStats(widgetId)
  });
  
  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: FollowUpSettings) => followUpService.updateFollowUpSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-settings', widgetId] });
    }
  });
  
  // Mutation for adding suggestions
  const addSuggestionMutation = useMutation({
    mutationFn: (newSuggestion: Omit<Suggestion, 'id'>) => followUpService.addSuggestion(widgetId, newSuggestion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-suggestions', widgetId] });
    }
  });
  
  // Mutation for updating suggestions
  const updateSuggestionMutation = useMutation({
    mutationFn: ({ suggestionId, suggestion }: { suggestionId: string, suggestion: Partial<Suggestion> }) => 
      followUpService.updateSuggestion(widgetId, suggestionId, suggestion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-suggestions', widgetId] });
    }
  });
  
  // Mutation for deleting suggestions
  const deleteSuggestionMutation = useMutation({
    mutationFn: (suggestionId: string) => followUpService.deleteSuggestion(widgetId, suggestionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-suggestions', widgetId] });
    }
  });
  
  // Helper function to toggle suggestion status
  const toggleSuggestionStatus = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      updateSuggestionMutation.mutate({
        suggestionId,
        suggestion: { active: !suggestion.active }
      });
    }
  };
  
  return {
    // Data
    settings,
    suggestions,
    stats,
    
    // Loading states
    isLoading: isLoadingSettings || isLoadingSuggestions || isLoadingStats,
    isLoadingSettings,
    isLoadingSuggestions,
    isLoadingStats,
    
    // Error states
    hasError: !!settingsError || !!suggestionsError || !!statsError,
    settingsError,
    suggestionsError,
    statsError,
    
    // Mutations
    updateSettings: (newSettings: FollowUpSettings) => updateSettingsMutation.mutate(newSettings),
    addSuggestion: (newSuggestion: Omit<Suggestion, 'id'>) => addSuggestionMutation.mutate(newSuggestion),
    updateSuggestion: (suggestionId: string, suggestion: Partial<Suggestion>) => 
      updateSuggestionMutation.mutate({ suggestionId, suggestion }),
    deleteSuggestion: (suggestionId: string) => deleteSuggestionMutation.mutate(suggestionId),
    toggleSuggestionStatus,
    
    // Mutation states
    isMutating: updateSettingsMutation.isPending || 
                addSuggestionMutation.isPending || 
                updateSuggestionMutation.isPending || 
                deleteSuggestionMutation.isPending
  };
}
