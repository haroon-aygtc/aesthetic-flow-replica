import api from "./api";
import { AIModelData } from "./ai-model-service";
import { LucideIcon } from "lucide-react";

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon?: React.ElementType | string;
  modelId?: number | null;
  settings?: Record<string, any>;
}

export const moduleConfigService = {
  // Get all module configurations
  getModuleConfigurations: async (): Promise<ModuleConfig[]> => {
    try {
      const response = await api.get('module-configurations');
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.error('Unexpected response format from module configurations API:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching module configurations:', error);
      throw error;
    }
  },
  
  // Get a specific module configuration
  getModuleConfiguration: async (moduleId: string): Promise<ModuleConfig | null> => {
    try {
      const response = await api.get(`module-configurations/${moduleId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching module configuration for ${moduleId}:`, error);
      throw error;
    }
  },
  
  // Update a module configuration
  updateModuleConfiguration: async (moduleId: string, config: Partial<ModuleConfig>): Promise<ModuleConfig> => {
    try {
      const response = await api.put(`module-configurations/${moduleId}`, config);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating module configuration for ${moduleId}:`, error);
      throw error;
    }
  },
  
  // Save all module configurations
  saveModuleConfigurations: async (modules: ModuleConfig[]): Promise<boolean> => {
    try {
      const response = await api.post('module-configurations/batch', { modules });
      return response.data.success || false;
    } catch (error) {
      console.error('Error saving module configurations:', error);
      throw error;
    }
  }
};
