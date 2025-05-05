
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
    return api.get('/api/widgets');
  },

  getWidget: async (id: number) => {
    return api.get(`/api/widgets/${id}`);
  },

  createWidget: async (widgetData: Widget) => {
    return api.post('/api/widgets', widgetData);
  },

  updateWidget: async (id: number, widgetData: Partial<Widget>) => {
    return api.put(`/api/widgets/${id}`, widgetData);
  },

  deleteWidget: async (id: number) => {
    return api.delete(`/api/widgets/${id}`);
  },

  getWidgetByPublicId: async (widgetId: string) => {
    return api.get(`/api/widgets/public/${widgetId}`);
  },

  generateEmbedCode: async (widgetId: string, options: {
    embedType: 'standard' | 'iframe' | 'web-component';
    customizations?: Record<string, any>;
  }) => {
    return api.post('/api/embed-code/generate', {
      widget_id: widgetId,
      embed_type: options.embedType,
      customizations: options.customizations
    });
  },

  // Analytics methods
  getAnalyticsSummary: async (widgetId: number, period: 'day' | 'week' | 'month' | 'all' = 'month') => {
    return api.get<AnalyticsSummary>(`/api/widgets/${widgetId}/analytics/summary?period=${period}`);
  },

  getAnalytics: async (widgetId: number, options: {
    fromDate?: string;
    toDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'event_type' | 'url';
  } = {}) => {
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

    return api.get(`/api/widgets/${widgetId}/analytics?${params.toString()}`);
  },

  // Additional widget configuration methods
  updateWidgetSettings: async (widgetId: number, settings: WidgetSettings) => {
    return api.put(`/api/widgets/${widgetId}`, {
      settings: settings
    });
  },

  // Widget activation/deactivation
  setWidgetActive: async (widgetId: number, isActive: boolean) => {
    return api.put(`/api/widgets/${widgetId}`, {
      is_active: isActive
    });
  },

  // Guest settings
  updateGuestSettings: async (widgetId: number, requireGuestInfo: boolean, guestFields?: string[]) => {
    return api.put(`/api/widgets/${widgetId}`, {
      settings: {
        requireGuestInfo: requireGuestInfo,
        guestFields: guestFields
      }
    });
  }
};
