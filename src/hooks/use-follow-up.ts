import { useState, useEffect } from "react";
import api from "@/utils/api";
import { toast } from "./use-toast";
import { z } from "zod";

// Define schema for follow-up settings
export const followUpSettingsSchema = z.object({
    enabled: z.boolean().default(true),
    position: z.string().default("end"),
    suggestionsCount: z.number().default(3),
    autoGenerate: z.boolean().default(true),
    showAfterQuery: z.boolean().default(true),
    style: z.string().default("button"),
    buttonColor: z.string().optional(),
    textColor: z.string().optional(),
    aiGenerated: z.boolean().default(true),
});

export type FollowUpSettings = z.infer<typeof followUpSettingsSchema>;

// Define schema for a follow-up suggestion
export const followUpSuggestionSchema = z.object({
    id: z.number().optional(),
    text: z.string().min(1, "Suggestion text is required"),
    isActive: z.boolean().default(true),
    categoryId: z.string().optional(),
    priority: z.number().default(0),
    conditions: z.array(z.object({
        field: z.string(),
        operator: z.string(),
        value: z.string()
    })).optional(),
});

export type FollowUpSuggestion = z.infer<typeof followUpSuggestionSchema>;

interface UseFollowUpProps {
    widgetId?: number;
    initialSettings?: Partial<FollowUpSettings>;
}

export function useFollowUp({
    widgetId,
    initialSettings
}: UseFollowUpProps = {}) {
    const [settings, setSettings] = useState<FollowUpSettings>({
        enabled: true,
        position: "end",
        suggestionsCount: 3,
        autoGenerate: true,
        showAfterQuery: true,
        style: "button",
        aiGenerated: true,
        ...initialSettings
    });

    const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [settingsError, setSettingsError] = useState<Error | null>(null);
    const [suggestionsError, setSuggestionsError] = useState<Error | null>(null);

    // Fetch follow-up settings from API
    const fetchSettings = async (id: number) => {
        setIsLoading(true);
        setSettingsError(null);
        setHasError(false);

        try {
            const response = await api.get(`/widgets/${id}/follow-up`);

            if (response.data && response.data.data) {
                setSettings({
                    ...settings,
                    ...response.data.data
                });
            }
        } catch (err: any) {
            setSettingsError(err);
            setHasError(true);
            toast({
                title: "Error",
                description: "Failed to load follow-up settings",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Save follow-up settings to API
    const saveSettings = async (values: FollowUpSettings) => {
        if (!widgetId) return;

        setIsLoading(true);
        setSettingsError(null);

        try {
            const response = await api.put(`/widgets/${widgetId}/follow-up`, values);

            if (response.data && response.data.success) {
                setSettings(values);
                toast({
                    title: "Success",
                    description: "Follow-up settings saved successfully"
                });
                return true;
            }
        } catch (err: any) {
            setSettingsError(err);
            toast({
                title: "Error",
                description: "Failed to save follow-up settings",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch follow-up suggestions from API
    const fetchSuggestions = async (id: number) => {
        setIsLoading(true);
        setSuggestionsError(null);

        try {
            const response = await api.get(`/widgets/${id}/suggestions`);

            if (response.data && response.data.data) {
                setSuggestions(response.data.data);
            }
        } catch (err: any) {
            setSuggestionsError(err);
            toast({
                title: "Error",
                description: "Failed to load follow-up suggestions",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Add a new follow-up suggestion
    const addSuggestion = async (suggestion: Omit<FollowUpSuggestion, 'id'>) => {
        if (!widgetId) return;

        setIsLoading(true);
        setSuggestionsError(null);

        try {
            const response = await api.post(`/widgets/${widgetId}/suggestions`, suggestion);

            if (response.data && response.data.success) {
                const newSuggestion = response.data.data;
                setSuggestions([...suggestions, newSuggestion]);
                toast({
                    title: "Success",
                    description: "Follow-up suggestion added successfully"
                });
                return true;
            }
        } catch (err: any) {
            setSuggestionsError(err);
            toast({
                title: "Error",
                description: "Failed to add follow-up suggestion",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Update an existing follow-up suggestion
    const updateSuggestion = async (id: number, data: Partial<FollowUpSuggestion>) => {
        if (!widgetId) return;

        setIsLoading(true);
        setSuggestionsError(null);

        try {
            const response = await api.put(`/widgets/${widgetId}/suggestions/${id}`, data);

            if (response.data && response.data.success) {
                const updatedSuggestion = response.data.data;
                setSuggestions(suggestions.map(suggestion =>
                    suggestion.id === id ? updatedSuggestion : suggestion
                ));
                toast({
                    title: "Success",
                    description: "Follow-up suggestion updated successfully"
                });
                return true;
            }
        } catch (err: any) {
            setSuggestionsError(err);
            toast({
                title: "Error",
                description: "Failed to update follow-up suggestion",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a follow-up suggestion
    const deleteSuggestion = async (id: number) => {
        if (!widgetId) return;

        setIsLoading(true);
        setSuggestionsError(null);

        try {
            const response = await api.delete(`/widgets/${widgetId}/suggestions/${id}`);

            if (response.data && response.data.success) {
                setSuggestions(suggestions.filter(suggestion => suggestion.id !== id));
                toast({
                    title: "Success",
                    description: "Follow-up suggestion deleted successfully"
                });
                return true;
            }
        } catch (err: any) {
            setSuggestionsError(err);
            toast({
                title: "Error",
                description: "Failed to delete follow-up suggestion",
                variant: "destructive"
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch follow-up statistics
    const fetchStats = async (id: number) => {
        setIsLoading(true);

        try {
            const response = await api.get(`/widgets/${id}/follow-up/stats`);

            if (response.data && response.data.data) {
                setStats(response.data.data);
            }
        } catch (err: any) {
            // We don't toast for stats errors as they're secondary
            console.error("Failed to load follow-up stats:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate AI suggestions for follow-ups
    const generateSuggestions = async (context: string) => {
        if (!widgetId) return;

        setIsLoading(true);
        setSuggestionsError(null);

        try {
            const response = await api.post(`/widgets/${widgetId}/suggestions/generate`, {
                context
            });

            if (response.data && response.data.data) {
                const generatedSuggestions = response.data.data;
                setSuggestions([...suggestions, ...generatedSuggestions]);
                toast({
                    title: "Success",
                    description: `Generated ${generatedSuggestions.length} new suggestions`
                });
                return generatedSuggestions;
            }
        } catch (err: any) {
            setSuggestionsError(err);
            toast({
                title: "Error",
                description: "Failed to generate follow-up suggestions",
                variant: "destructive"
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle suggestion active status
    const toggleSuggestionStatus = async (id: number, isActive: boolean) => {
        return updateSuggestion(id, { isActive });
    };

    // Fetch data when widgetId changes
    useEffect(() => {
        if (widgetId) {
            fetchSettings(widgetId);
            fetchSuggestions(widgetId);
            fetchStats(widgetId);
        }
    }, [widgetId]);

    return {
        settings,
        suggestions,
        stats,
        isLoading,
        hasError,
        settingsError,
        suggestionsError,
        saveSettings,
        addSuggestion,
        updateSuggestion,
        deleteSuggestion,
        toggleSuggestionStatus,
        generateSuggestions,
        refreshSuggestions: () => widgetId && fetchSuggestions(widgetId),
        refreshStats: () => widgetId && fetchStats(widgetId)
    };
}