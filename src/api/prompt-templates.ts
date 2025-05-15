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
            const response = await apiClient.get<ApiResponse<PromptTemplate[]>>('/prompt-templates');
            return { data: response.data.data };
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw new Error(`Failed to fetch templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Get a template by ID
    async getTemplateById(id: string) {
        try {
            const response = await apiClient.get<ApiResponse<PromptTemplate>>(`/prompt-templates/${id}`);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error fetching template ${id}:`, error);
            throw new Error(`Failed to fetch template ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Create a new template
    async createTemplate(template: Omit<PromptTemplate, 'id'>) {
        try {
            const response = await apiClient.post<ApiResponse<PromptTemplate>>('/prompt-templates', template);
            return { data: response.data.data };
        } catch (error) {
            console.error('Error creating template:', error);
            throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Update an existing template
    async updateTemplate(id: string, updates: Partial<PromptTemplate>) {
        try {
            const response = await apiClient.put<ApiResponse<PromptTemplate>>(`/prompt-templates/${id}`, updates);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error updating template ${id}:`, error);
            throw new Error(`Failed to update template ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Delete a template
    async deleteTemplate(id: string) {
        try {
            await apiClient.delete(`/prompt-templates/${id}`);
            return { success: true };
        } catch (error) {
            console.error(`Error deleting template ${id}:`, error);
            throw new Error(`Failed to delete template ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Duplicate a template
    async duplicateTemplate(id: string, newName?: string) {
        try {
            const response = await apiClient.post<ApiResponse<PromptTemplate>>(`/prompt-templates/${id}/duplicate`, { newName });
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error duplicating template ${id}:`, error);
            throw new Error(`Failed to duplicate template ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Preview a template with variables
    async previewTemplate(template: string, variables: Record<string, any>) {
        try {
            const response = await apiClient.post<ApiResponse<string>>('/prompt-templates/preview', { template, variables });
            return { data: response.data.data };
        } catch (error) {
            console.error('Error rendering template preview:', error);
            throw new Error(`Failed to preview template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Get templates by tag
    async getTemplatesByTag(tag: string) {
        try {
            const response = await apiClient.get<ApiResponse<PromptTemplate[]>>(`/prompt-templates/tag/${tag}`);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error fetching templates by tag ${tag}:`, error);
            throw new Error(`Failed to fetch templates by tag ${tag}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Get templates by AI model
    async getTemplatesByModel(model: string) {
        try {
            const response = await apiClient.get<ApiResponse<PromptTemplate[]>>(`/prompt-templates/model/${model}`);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error fetching templates by model ${model}:`, error);
            throw new Error(`Failed to fetch templates by model ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Get system prompt templates
    async getSystemPromptTemplates() {
        try {
            const response = await apiClient.get<ApiResponse<PromptTemplate[]>>('/prompt-templates/system');
            return { data: response.data.data };
        } catch (error) {
            console.error('Error fetching system prompt templates:', error);
            throw new Error(`Failed to fetch system prompt templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // Get template version history
    async getTemplateVersions(templateId: string) {
        try {
            const response = await apiClient.get<ApiResponse<any[]>>(`/prompt-templates/${templateId}/versions`);
            return { data: response.data.data };
        } catch (error) {
            console.error(`Error fetching template versions for template ${templateId}:`, error);
            throw new Error(`Failed to fetch template versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};