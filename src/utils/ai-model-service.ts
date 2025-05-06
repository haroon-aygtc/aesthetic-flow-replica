// Import the API service
import api from "./api";

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
  template_id?: number | null;
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

export const aiModelService = {
  // Get all models
  getModels: async (): Promise<AIModelData[]> => {
    try {
      const response = await api.get('ai-models');

      // Check if response.data has a 'data' property (backend wraps models in a 'data' property)
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // If response.data is already an array, return it
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // If we can't find an array, log the error and return an empty array
      console.error('Unexpected response format from AI models API:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching AI models:', error);
      return [];
    }
  },

  // Get model by ID
  getModel: async (id: number): Promise<AIModelData> => {
    try {
      const response = await api.get(`ai-models/${id}`);

      // Check if response.data has a 'data' property
      if (response.data && response.data.data) {
        return response.data.data;
      }

      // If response.data is already the model object, return it
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      }

      // If we can't find a valid model, log the error and return a default model
      console.error('Unexpected response format from AI model API:', response.data);
      throw new Error('Failed to retrieve AI model data');
    } catch (error) {
      console.error(`Error fetching AI model with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new model
  createModel: async (model: AIModelData): Promise<AIModelData> => {
    try {
      const response = await api.post('ai-models', model);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error('Error creating AI model:', error);
      throw error;
    }
  },

  // Update a model
  updateModel: async (id: number, data: Partial<AIModelData>): Promise<AIModelData> => {
    try {
      const response = await api.put(`ai-models/${id}`, data);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating AI model with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a model
  deleteModel: async (id: number): Promise<void> => {
    try {
      await api.delete(`ai-models/${id}`);
    } catch (error) {
      console.error(`Error deleting AI model with ID ${id}:`, error);
      throw error;
    }
  },

  // Toggle model activation
  toggleModelActivation: async (id: number, active: boolean): Promise<AIModelData> => {
    try {
      const response = await api.post(`ai-models/${id}/toggle-activation`, { active });
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error toggling activation for AI model with ID ${id}:`, error);
      throw error;
    }
  },

  // Test a model connection
  testConnection: async (id: number): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await api.post(`ai-models/${id}/test`);
      return response.data;
    } catch (error) {
      console.error(`Error testing connection for AI model with ID ${id}:`, error);
      throw error;
    }
  },

  // Test chat with a model
  testChat: async (id: number, message: string, options?: {
    temperature?: number;
    max_tokens?: number;
    system_prompt?: string;
  }): Promise<{
    success: boolean;
    response: string;
    metadata: {
      model: string;
      provider: string;
      response_time: number;
      tokens_input: number;
      tokens_output: number;
      error?: string;
    }
  }> => {
    try {
      const response = await api.post(`ai-models/${id}/test-chat`, {
        message,
        temperature: options?.temperature,
        max_tokens: options?.max_tokens,
        system_prompt: options?.system_prompt
      });
      return response.data;
    } catch (error) {
      console.error(`Error testing chat for AI model with ID ${id}:`, error);
      throw error;
    }
  },

  // Get fallback options for a model
  getFallbackOptions: async (id: number): Promise<AIModelData[]> => {
    try {
      const response = await api.get(`ai-models/${id}/fallback-options`);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.error('Unexpected response format from fallback options API:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching fallback options for AI model with ID ${id}:`, error);
      return [];
    }
  },

  // Get model activation rules
  getModelRules: async (modelId: number): Promise<any[]> => {
    try {
      const response = await api.get(`ai-models/${modelId}/rules`);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.error('Unexpected response format from model rules API:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching rules for AI model with ID ${modelId}:`, error);
      return [];
    }
  },

  // Create a new activation rule
  createModelRule: async (modelId: number, rule: any): Promise<any> => {
    try {
      const response = await api.post(`ai-models/${modelId}/rules`, rule);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error creating rule for AI model with ID ${modelId}:`, error);
      throw error;
    }
  },

  // Update an activation rule
  updateModelRule: async (modelId: number, ruleId: number, rule: any): Promise<any> => {
    try {
      const response = await api.put(`ai-models/${modelId}/rules/${ruleId}`, rule);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating rule ${ruleId} for AI model with ID ${modelId}:`, error);
      throw error;
    }
  },

  // Delete an activation rule
  deleteModelRule: async (modelId: number, ruleId: number): Promise<void> => {
    try {
      await api.delete(`ai-models/${modelId}/rules/${ruleId}`);
    } catch (error) {
      console.error(`Error deleting rule ${ruleId} for AI model with ID ${modelId}:`, error);
      throw error;
    }
  },

  // Get model analytics
  getModelAnalytics: async (modelId: number, period: string = '7d'): Promise<any> => {
    try {
      const response = await api.get(`analytics/models/${modelId}?period=${period}`);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching analytics for AI model with ID ${modelId}:`, error);
      return {};
    }
  },

  // Get model error logs
  getModelErrorLogs: async (modelId: number, period: string = '7d'): Promise<any> => {
    try {
      const response = await api.get(`analytics/models/${modelId}/errors?period=${period}`);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching error logs for AI model with ID ${modelId}:`, error);
      return [];
    }
  },

  // Get detailed analytics for a model
  getModelDetailedAnalytics: async (modelId: number, period: string = 'month', groupBy: string = 'day'): Promise<any> => {
    try {
      const response = await api.get(`analytics/models/${modelId}/detailed?period=${period}&group_by=${groupBy}`);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching detailed analytics for AI model with ID ${modelId}:`, error);
      return {};
    }
  },

  // Assign a template to a model
  assignTemplate: async (modelId: number, templateId: string | null): Promise<any> => {
    try {
      const response = await api.post(`ai-models/${modelId}/templates`, {
        template_id: templateId
      });
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error assigning template to AI model with ID ${modelId}:`, error);
      throw error;
    }
  },

  // Get available models for a specific AI model
  getAvailableModels: async (id: number): Promise<any> => {
    try {
      const response = await api.get(`ai-models/${id}/available-models`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching available models for AI model with ID ${id}:`, error);
      return { data: [], success: false };
    }
  },

  // Discover available models from the provider
  discoverModels: async (id: number): Promise<any> => {
    try {
      const response = await api.post(`ai-models/${id}/discover-models`);
      return response.data;
    } catch (error) {
      console.error(`Error discovering models for AI model with ID ${id}:`, error);
      throw error;
    }
  }
};
