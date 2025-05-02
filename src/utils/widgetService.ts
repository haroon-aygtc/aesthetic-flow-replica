
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
  }
};
