
import api from "@/utils/api-service";

export interface AIModelData {
  id?: number;
  name: string;
  provider: string;
  description?: string;
  api_key?: string;
  settings?: ModelSettings;
  is_default?: boolean;
  active?: boolean;
  fallback_model_id?: number | null;
  confidence_threshold?: number;
}

export interface ModelSettings {
  model_name?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop_sequences?: string[];
  [key: string]: any; // Allow for provider-specific settings
}

// Analytics data interfaces
export interface ModelAnalytics {
  model_id: number;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_response_time: number;
  avg_confidence_score: number;
  successful_requests: number;
  fallback_requests: number;
  date?: string;
  query_type?: string;
  use_case?: string;
}

export interface ModelActivationRule {
  id?: number;
  model_id: number;
  name: string;
  query_type?: string;
  use_case?: string;
  tenant_id?: number;
  active: boolean;
  priority: number;
  conditions?: RuleCondition[];
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export const aiModelService = {
  // Get all models
  getModels: async (): Promise<AIModelData[]> => {
    try {
      const response = await api.get('/api/ai-models');
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  },

  // Get model by ID
  getModel: async (id: number): Promise<AIModelData> => {
    try {
      const response = await api.get(`/api/ai-models/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching model ${id}:`, error);
      throw error;
    }
  },

  // Create a new model
  createModel: async (model: AIModelData): Promise<AIModelData> => {
    try {
      const response = await api.post('/api/ai-models', model);
      return response.data.data;
    } catch (error) {
      console.error("Error creating model:", error);
      throw error;
    }
  },

  // Update a model
  updateModel: async (id: number, data: Partial<AIModelData>): Promise<AIModelData> => {
    try {
      const response = await api.put(`/api/ai-models/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating model ${id}:`, error);
      throw error;
    }
  },

  // Delete a model
  deleteModel: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/ai-models/${id}`);
    } catch (error) {
      console.error(`Error deleting model ${id}:`, error);
      throw error;
    }
  },

  // Toggle model activation
  toggleModelActivation: async (id: number, active: boolean): Promise<AIModelData> => {
    try {
      const response = await api.post(`/api/ai-models/${id}/toggle-activation`, { active });
      return response.data.data;
    } catch (error) {
      console.error(`Error toggling model ${id} activation:`, error);
      throw error;
    }
  },

  // Test a model connection
  testConnection: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(`/api/ai-models/${id}/test`);
      return response.data;
    } catch (error: any) {
      console.error(`Error testing model ${id} connection:`, error);
      return {
        success: false,
        message: error.response?.data?.message || "Connection test failed"
      };
    }
  },

  // Get fallback options for a model
  getFallbackOptions: async (id: number): Promise<AIModelData[]> => {
    try {
      const response = await api.get(`/api/ai-models/${id}/fallback-options`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching fallback options for model ${id}:`, error);
      throw error;
    }
  },

  // Get model activation rules
  getModelRules: async (modelId: number): Promise<ModelActivationRule[]> => {
    try {
      const response = await api.get(`/api/ai-models/${modelId}/rules`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching rules for model ${modelId}:`, error);
      throw error;
    }
  },

  // Create a new activation rule
  createModelRule: async (modelId: number, rule: ModelActivationRule): Promise<ModelActivationRule> => {
    try {
      const response = await api.post(`/api/ai-models/${modelId}/rules`, rule);
      return response.data.data;
    } catch (error) {
      console.error(`Error creating rule for model ${modelId}:`, error);
      throw error;
    }
  },

  // Update an activation rule
  updateModelRule: async (modelId: number, ruleId: number, rule: Partial<ModelActivationRule>): Promise<ModelActivationRule> => {
    try {
      const response = await api.put(`/api/ai-models/${modelId}/rules/${ruleId}`, rule);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating rule ${ruleId} for model ${modelId}:`, error);
      throw error;
    }
  },

  // Delete an activation rule
  deleteModelRule: async (modelId: number, ruleId: number): Promise<void> => {
    try {
      await api.delete(`/api/ai-models/${modelId}/rules/${ruleId}`);
    } catch (error) {
      console.error(`Error deleting rule ${ruleId} for model ${modelId}:`, error);
      throw error;
    }
  },

  // Get model analytics
  getModelAnalytics: async (modelId: number, period: string = '7d'): Promise<ModelAnalytics> => {
    try {
      const response = await api.get(`/api/analytics/models/${modelId}?period=${period}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching analytics for model ${modelId}:`, error);
      throw error;
    }
  },

  // Get model error logs
  getModelErrorLogs: async (modelId: number, period: string = '7d'): Promise<any[]> => {
    try {
      const response = await api.get(`/api/analytics/models/${modelId}/errors?period=${period}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching error logs for model ${modelId}:`, error);
      throw error;
    }
  },

  // Get detailed analytics for a model
  getModelDetailedAnalytics: async (modelId: number, period: string = 'month', groupBy: string = 'day'): Promise<any> => {
    try {
      const response = await api.get(`/api/analytics/models/${modelId}/detailed?period=${period}&group_by=${groupBy}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching detailed analytics for model ${modelId}:`, error);
      throw error;
    }
  }
};
