// Import the API service
import api from "./api";

export interface TemplateData {
  id?: number;
  name: string;
  description?: string;
  category: string;
  content: string;
  version?: number;
  is_default?: boolean;
  variables?: string[];
}

export const templateService = {
  // Get all templates
  getTemplates: async (): Promise<TemplateData[]> => {
    try {
      const response = await api.get('templates');
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.error('Unexpected response format from templates API:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  // Get template by ID
  getTemplate: async (id: number): Promise<TemplateData> => {
    try {
      const response = await api.get(`templates/${id}`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      }
      
      console.error('Unexpected response format from template API:', response.data);
      throw new Error('Failed to retrieve template data');
    } catch (error) {
      console.error(`Error fetching template with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new template
  createTemplate: async (template: TemplateData): Promise<TemplateData> => {
    try {
      const response = await api.post('templates', template);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update a template
  updateTemplate: async (id: number, data: Partial<TemplateData>): Promise<TemplateData> => {
    try {
      const response = await api.put(`templates/${id}`, data);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating template with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a template
  deleteTemplate: async (id: number): Promise<void> => {
    try {
      await api.delete(`templates/${id}`);
    } catch (error) {
      console.error(`Error deleting template with ID ${id}:`, error);
      throw error;
    }
  },

  // Get templates for a specific model
  getModelTemplates: async (modelId: number): Promise<TemplateData[]> => {
    try {
      const response = await api.get(`ai-models/${modelId}/templates`);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.error('Unexpected response format from model templates API:', response.data);
      return [];
    } catch (error) {
      console.error(`Error fetching templates for model with ID ${modelId}:`, error);
      return [];
    }
  },

  // Assign a template to a model
  assignTemplateToModel: async (modelId: number, templateId: number | null): Promise<void> => {
    try {
      await api.post(`ai-models/${modelId}/templates`, { template_id: templateId });
    } catch (error) {
      console.error(`Error assigning template to model with ID ${modelId}:`, error);
      throw error;
    }
  }
};
