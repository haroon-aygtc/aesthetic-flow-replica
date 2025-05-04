
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
  api_key?: string;
  settings?: AIModelSettings;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  data?: any;
  latency?: number;
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
    const response = await api.post<ConnectionTestResult>(`/api/ai-models/${id}/test-connection`);
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
  }
};
