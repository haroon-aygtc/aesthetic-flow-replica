import api from './api';

// Types for widget configurations
export interface WidgetSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: number;
  chatIconSize?: number;
  autoOpenDelay?: number;
  position?: string;
  initialMessage?: string;
  mobileBehavior?: string;
  headerTitle?: string;
  inputPlaceholder?: string;
  sendButtonText?: string;
  offlineMessage?: string;
  systemPrompt?: string;
  ai_model_id?: number | null;
  persistSession?: boolean;
  requireGuestInfo?: boolean;
  showNotifications?: boolean;
  triggerAfterPageViews?: number;
  pageTargeting?: string;
  use_knowledge_base?: boolean;
  knowledge_base_settings?: {
    search_threshold?: number;
    max_results?: number;
    sources?: string[];
    categories?: string[];
  };
  avatar?: {
    enabled?: boolean;
    imageUrl?: string;
    fallbackInitial?: string;
  };
}

export interface Widget {
  id?: number;
  name: string;
  widget_id?: string;
  ai_model_id?: number | null;
  settings?: WidgetSettings;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnalyticsSummary {
  total_views: number;
  total_conversations: number;
  total_messages: number;
  engagement_rate: number;
  avg_messages_per_conversation: number;
  period: string;
}

// Widget services
export const widgetService = {
  getAllWidgets: async () => {
    try {
      const response = await api.get('widgets');

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error('Error fetching widgets:', error);
      throw new Error(`Failed to fetch widgets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getWidget: async (id: number) => {
    try {
      if (!id) {
        throw new Error('Widget ID is required');
      }

      const response = await api.get(`widgets/${id}`);

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error fetching widget ${id}:`, error);
      throw new Error(`Failed to fetch widget ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  createWidget: async (widgetData: Widget) => {
    try {
      if (!widgetData.name) {
        throw new Error('Widget name is required');
      }

      const response = await api.post('widgets', widgetData);

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error('Error creating widget:', error);
      throw new Error(`Failed to create widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  updateWidget: async (id: number, widgetData: Partial<Widget>) => {
    try {
      if (!id) {
        throw new Error('Widget ID is required');
      }

      const response = await api.put(`widgets/${id}`, widgetData);

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error updating widget ${id}:`, error);
      throw new Error(`Failed to update widget ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  deleteWidget: async (id: number) => {
    try {
      if (!id) {
        throw new Error('Widget ID is required');
      }

      const response = await api.delete(`widgets/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting widget ${id}:`, error);
      throw new Error(`Failed to delete widget ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getWidgetByPublicId: async (widgetId: string) => {
    try {
      if (!widgetId) {
        throw new Error('Widget public ID is required');
      }

      const response = await api.get(`widgets/public/${widgetId}`);

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error fetching widget by public ID ${widgetId}:`, error);
      throw new Error(`Failed to fetch widget by public ID ${widgetId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  generateEmbedCode: async (widgetId: string, options: {
    embedType: 'standard' | 'iframe' | 'web-component';
    customizations?: Record<string, any>;
  }) => {
    try {
      if (!widgetId) {
        throw new Error('Widget ID is required');
      }

      if (!options.embedType) {
        throw new Error('Embed type is required');
      }

      const response = await api.post('embed-code/generate', {
        widget_id: widgetId,
        embed_type: options.embedType,
        customizations: options.customizations
      });

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error generating embed code for widget ${widgetId}:`, error);
      throw new Error(`Failed to generate embed code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Analytics methods
  getAnalyticsSummary: async (widgetId: number, period: 'day' | 'week' | 'month' | 'all' = 'month') => {
    try {
      if (!widgetId) {
        throw new Error('Widget ID is required');
      }

      const response = await api.get<AnalyticsSummary>(`widgets/${widgetId}/analytics/summary?period=${period}`);

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error fetching analytics summary for widget ${widgetId}:`, error);
      throw new Error(`Failed to fetch analytics summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getAnalytics: async (widgetId: number, options: {
    fromDate?: string;
    toDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'event_type' | 'url';
  } = {}) => {
    try {
      if (!widgetId) {
        throw new Error('Widget ID is required');
      }

      const params = new URLSearchParams();

      if (options.fromDate) {
        params.append('from_date', options.fromDate);
      }

      if (options.toDate) {
        params.append('to_date', options.toDate);
      }

      if (options.groupBy) {
        params.append('group_by', options.groupBy);
      }

      const response = await api.get(`widgets/${widgetId}/analytics?${params.toString()}`);

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error fetching analytics for widget ${widgetId}:`, error);
      throw new Error(`Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Additional widget configuration methods
  updateWidgetSettings: async (widgetId: number, settings: WidgetSettings) => {
    try {
      if (!widgetId) {
        throw new Error('Widget ID is required');
      }

      if (!settings) {
        throw new Error('Widget settings are required');
      }

      const response = await api.put(`widgets/${widgetId}`, {
        settings: settings
      });

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error updating settings for widget ${widgetId}:`, error);
      throw new Error(`Failed to update widget settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Widget activation/deactivation
  setWidgetActive: async (widgetId: number, isActive: boolean) => {
    try {
      if (!widgetId) {
        throw new Error('Widget ID is required');
      }

      const response = await api.put(`widgets/${widgetId}`, {
        is_active: isActive
      });

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error ${isActive ? 'activating' : 'deactivating'} widget ${widgetId}:`, error);
      throw new Error(`Failed to ${isActive ? 'activate' : 'deactivate'} widget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Guest settings
  updateGuestSettings: async (widgetId: number, requireGuestInfo: boolean, guestFields?: string[]) => {
    try {
      if (!widgetId) {
        throw new Error('Widget ID is required');
      }

      const response = await api.put(`widgets/${widgetId}`, {
        settings: {
          requireGuestInfo: requireGuestInfo,
          guestFields: guestFields
        }
      });

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error(`Error updating guest settings for widget ${widgetId}:`, error);
      throw new Error(`Failed to update guest settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
