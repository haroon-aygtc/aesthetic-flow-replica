
import api from './api';

export interface AIModelSettings {
  model_name?: string;
  temperature?: number;
  max_tokens?: number;
  stop?: string[];
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  template_id?: string;
}

export interface AIModelData {
  id?: number;
  name: string;
  provider: string;
  description?: string;
  api_key?: string;
  settings?: AIModelSettings;
  is_default?: boolean;
  active?: boolean;
  fallback_model_id?: number | null;
  confidence_threshold?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  data?: any;
  latency?: number;
}

export interface ModelActivationRule {
  id?: number;
  model_id: number;
  name: string;
  query_type?: string | null;
  use_case?: string | null;
  tenant_id?: number | null;
  active: boolean;
  priority: number;
  conditions?: Array<{
    field: string;
    operator: string;
    value: string | number | boolean;
  }> | null;
  created_at?: string;
  updated_at?: string;
}

export interface ModelAnalytics {
  model_id: number;
  model_name: string;
  provider: string;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_response_time: number;
  avg_confidence_score: number;
  success_rate: number;
  fallback_rate: number;
}

export const aiModelService = {
  getAllModels: async (): Promise<AIModelData[]> => {
    const response = await api.get<AIModelData[]>('/api/ai-models');
    return response.data;
  },
  
  getModel: async (id: number): Promise<AIModelData> => {
    const response = await api.get<AIModelData>(`/api/ai-models/${id}`);
    return response.data;
  },
  
  createModel: async (modelData: AIModelData): Promise<AIModelData> => {
    const response = await api.post<AIModelData>('/api/ai-models', modelData);
    return response.data;
  },
  
  updateModel: async (id: number, modelData: Partial<AIModelData>): Promise<AIModelData> => {
    const response = await api.put<AIModelData>(`/api/ai-models/${id}`, modelData);
    return response.data;
  },
  
  deleteModel: async (id: number): Promise<void> => {
    await api.delete(`/api/ai-models/${id}`);
  },
  
  setDefaultModel: async (id: number): Promise<void> => {
    await api.post(`/api/ai-models/${id}/set-default`);
  },
  
  testConnection: async (id: number): Promise<ConnectionTestResult> => {
    const response = await api.post<ConnectionTestResult>(`/api/ai-models/${id}/test`);
    return response.data;
  },
  
  getModelTemplates: async (id: number): Promise<any[]> => {
    const response = await api.get(`/api/ai-models/${id}/templates`);
    return response.data;
  },
  
  associateTemplate: async (modelId: number, templateId: string | null): Promise<void> => {
    await api.post(`/api/ai-models/${modelId}/template`, {
      template_id: templateId
    });
  },
  
  getFallbackOptions: async (id: number): Promise<AIModelData[]> => {
    const response = await api.get(`/api/ai-models/${id}/fallback-options`);
    return response.data.data;
  },
  
  toggleModelActivation: async (id: number, active: boolean): Promise<AIModelData> => {
    const response = await api.post(`/api/ai-models/${id}/toggle-activation`, { active });
    return response.data.data;
  },
  
  // Model activation rules
  getModelRules: async (modelId: number): Promise<ModelActivationRule[]> => {
    const response = await api.get(`/api/ai-models/${modelId}/rules`);
    return response.data.data;
  },
  
  createModelRule: async (modelId: number, rule: Omit<ModelActivationRule, 'id'>): Promise<ModelActivationRule> => {
    const response = await api.post(`/api/ai-models/${modelId}/rules`, rule);
    return response.data.data;
  },
  
  updateModelRule: async (modelId: number, ruleId: number, rule: Partial<ModelActivationRule>): Promise<ModelActivationRule> => {
    const response = await api.put(`/api/ai-models/${modelId}/rules/${ruleId}`, rule);
    return response.data.data;
  },
  
  deleteModelRule: async (modelId: number, ruleId: number): Promise<void> => {
    await api.delete(`/api/ai-models/${modelId}/rules/${ruleId}`);
  },
  
  // Analytics
  getModelsAnalytics: async (period: string = 'month'): Promise<ModelAnalytics[]> => {
    const response = await api.get(`/api/analytics/models?period=${period}`);
    return response.data.data;
  },
  
  getModelDetailedAnalytics: async (modelId: number, period: string = 'month', groupBy: string = 'day') => {
    const response = await api.get(`/api/analytics/models/${modelId}?period=${period}&group_by=${groupBy}`);
    return response.data;
  },
  
  getModelErrorLogs: async (modelId: number, period: string = 'month') => {
    const response = await api.get(`/api/analytics/models/${modelId}/errors?period=${period}`);
    return response.data;
  }
};
