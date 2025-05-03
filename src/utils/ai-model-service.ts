
import api from "@/utils/api-service";

export interface AIModelData {
  id?: number;
  name: string;
  provider: string;
  description?: string;
  api_key?: string;
  settings?: Record<string, any>;
  is_default?: boolean;
  active?: boolean;
  fallback_model_id?: number | null;
  confidence_threshold?: number;
}

export const aiModelService = {
  // Get all models
  getModels: async (): Promise<AIModelData[]> => {
    const response = await api.get('/api/ai-models');
    return response.data;
  },

  // Get model by ID
  getModel: async (id: number): Promise<AIModelData> => {
    const response = await api.get(`/api/ai-models/${id}`);
    return response.data;
  },

  // Create a new model
  createModel: async (model: AIModelData): Promise<AIModelData> => {
    const response = await api.post('/api/ai-models', model);
    return response.data;
  },

  // Update a model
  updateModel: async (id: number, data: Partial<AIModelData>): Promise<AIModelData> => {
    const response = await api.put(`/api/ai-models/${id}`, data);
    return response.data;
  },

  // Delete a model
  deleteModel: async (id: number): Promise<void> => {
    await api.delete(`/api/ai-models/${id}`);
  },

  // Toggle model activation
  toggleModelActivation: async (id: number, active: boolean): Promise<AIModelData> => {
    const response = await api.post(`/api/ai-models/${id}/toggle-activation`, { active });
    return response.data;
  },

  // Test a model connection
  testConnection: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/api/ai-models/${id}/test`);
    return response.data;
  },

  // Get fallback options for a model
  getFallbackOptions: async (id: number): Promise<AIModelData[]> => {
    const response = await api.get(`/api/ai-models/${id}/fallback-options`);
    return response.data;
  },

  // Get model activation rules
  getModelRules: async (modelId: number): Promise<any[]> => {
    const response = await api.get(`/api/ai-models/${modelId}/rules`);
    return response.data;
  },

  // Create a new activation rule
  createModelRule: async (modelId: number, rule: any): Promise<any> => {
    const response = await api.post(`/api/ai-models/${modelId}/rules`, rule);
    return response.data;
  },

  // Update an activation rule
  updateModelRule: async (modelId: number, ruleId: number, rule: any): Promise<any> => {
    const response = await api.put(`/api/ai-models/${modelId}/rules/${ruleId}`, rule);
    return response.data;
  },

  // Delete an activation rule
  deleteModelRule: async (modelId: number, ruleId: number): Promise<void> => {
    await api.delete(`/api/ai-models/${modelId}/rules/${ruleId}`);
  },

  // Get model analytics
  getModelAnalytics: async (modelId: number, period: string = '7d'): Promise<any> => {
    const response = await api.get(`/api/analytics/models/${modelId}?period=${period}`);
    return response.data;
  },

  // Get model error logs
  getModelErrorLogs: async (modelId: number, period: string = '7d'): Promise<any> => {
    const response = await api.get(`/api/analytics/models/${modelId}/errors?period=${period}`);
    return response.data;
  }
};
