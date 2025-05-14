import axios from 'axios';
import { PromptTemplate } from '@/utils/prompt-template-service';

// Configure the base API client
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for auth tokens
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Define API response types
interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}

// Define the API methods
export const promptTemplatesApi = {
    // Get all templates
    async getTemplates() {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.getTemplates();
            }

            const response = await apiClient.get<ApiResponse<PromptTemplate[]>>('/prompt-templates');
            return { data: response.data.data };
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    },

    // Get a template by ID
    async getTemplateById(id: string) {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.getTemplate(id);
            }

            const response = await apiClient.get<ApiResponse<PromptTemplate>>(`/prompt-templates/${id}`);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error fetching template ${id}:`, error);
            throw error;
        }
    },

    // Create a new template
    async createTemplate(template: Omit<PromptTemplate, 'id'>) {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.createTemplate(template);
            }

            const response = await apiClient.post<ApiResponse<PromptTemplate>>('/prompt-templates', template);
            return { data: response.data.data };
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    },

    // Update an existing template
    async updateTemplate(id: string, updates: Partial<PromptTemplate>) {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.updateTemplate(id, updates);
            }

            const response = await apiClient.put<ApiResponse<PromptTemplate>>(`/prompt-templates/${id}`, updates);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error updating template ${id}:`, error);
            throw error;
        }
    },

    // Delete a template
    async deleteTemplate(id: string) {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.deleteTemplate(id);
            }

            await apiClient.delete(`/prompt-templates/${id}`);
            return { success: true };
        } catch (error) {
            console.error(`Error deleting template ${id}:`, error);
            throw error;
        }
    },

    // Duplicate a template
    async duplicateTemplate(id: string, newName?: string) {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.duplicateTemplate(id, newName);
            }

            const response = await apiClient.post<ApiResponse<PromptTemplate>>(`/prompt-templates/${id}/duplicate`, { newName });
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error duplicating template ${id}:`, error);
            throw error;
        }
    },

    // Preview a template with variables
    async previewTemplate(template: string, variables: Record<string, any>) {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.previewTemplate(template, variables);
            }

            const response = await apiClient.post<ApiResponse<string>>('/prompt-templates/preview', { template, variables });
            return { data: response.data.data };
        } catch (error) {
            console.error('Error rendering template preview:', error);
            throw error;
        }
    },

    // Get templates by tag
    async getTemplatesByTag(tag: string) {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.getTemplateByTag(tag);
            }

            const response = await apiClient.get<ApiResponse<PromptTemplate[]>>(`/prompt-templates/tag/${tag}`);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error fetching templates by tag ${tag}:`, error);
            throw error;
        }
    },

    // Get templates by AI model
    async getTemplatesByModel(model: string) {
        try {
            // For development mockup, use local service
            if (import.meta.env.DEV) {
                const { promptTemplateService } = await import('@/utils/prompt-template-service');
                return promptTemplateService.getTemplatesByAIModel(model);
            }

            const response = await apiClient.get<ApiResponse<PromptTemplate[]>>(`/prompt-templates/model/${model}`);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error fetching templates by model ${model}:`, error);
            throw error;
        }
    }
}; 