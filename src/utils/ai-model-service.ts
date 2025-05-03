
import api from "./api";
import { toast } from "@/hooks/use-toast";

export interface AIModelData {
  id?: number;
  name: string;
  provider: string;
  description?: string;
  api_key?: string;
  settings?: any;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const aiModelService = {
  /**
   * Get all AI models
   */
  getAllModels: async (): Promise<AIModelData[]> => {
    try {
      const response = await api.get("/api/ai-models");
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to fetch AI models:", error);
      throw error;
    }
  },

  /**
   * Get a specific AI model by ID
   */
  getModel: async (id: number): Promise<AIModelData> => {
    try {
      const response = await api.get(`/api/ai-models/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to fetch AI model ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new AI model
   */
  createModel: async (modelData: AIModelData): Promise<AIModelData> => {
    try {
      const response = await api.post("/api/ai-models", modelData);
      return response.data.data;
    } catch (error: any) {
      console.error("Failed to create AI model:", error);
      throw error;
    }
  },

  /**
   * Update an existing AI model
   */
  updateModel: async (id: number, modelData: Partial<AIModelData>): Promise<AIModelData> => {
    try {
      const response = await api.put(`/api/ai-models/${id}`, modelData);
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to update AI model ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an AI model
   */
  deleteModel: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/ai-models/${id}`);
    } catch (error: any) {
      console.error(`Failed to delete AI model ${id}:`, error);
      throw error;
    }
  },

  /**
   * Test connection to an AI provider
   */
  testConnection: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(`/api/ai-models/${id}/test`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to test connection for AI model ${id}:`, error);
      throw error;
    }
  },

  /**
   * Set an AI model as default
   */
  setAsDefault: async (id: number): Promise<AIModelData> => {
    try {
      const response = await api.put(`/api/ai-models/${id}`, { is_default: true });
      return response.data.data;
    } catch (error: any) {
      console.error(`Failed to set AI model ${id} as default:`, error);
      throw error;
    }
  }
};
