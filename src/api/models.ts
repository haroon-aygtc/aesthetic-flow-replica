import axios from 'axios';

// Base API client configuration
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
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

// Interface definitions
export interface AIModel {
    id: string;
    name: string;
    provider: string;
    type: string;
    maxInputTokens: number;
    maxOutputTokens: number;
    isActive: boolean;
    costPerToken: number;
    features: string[];
    settings?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

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
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    message: string;
    success: boolean;
}

interface ModelListParams {
    page?: number;
    per_page?: number;
    search?: string;
    provider?: string;
    type?: string;
    isActive?: boolean;
}

// AI Models API service
export const modelsApi = {
    /**
     * Get a paginated list of available AI models
     */
    async getModels(params?: ModelListParams): Promise<PaginatedResponse<AIModel>> {
        try {
            const response = await apiClient.get('/ai-models', { params });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch AI models:', error);
            throw error;
        }
    },

    /**
     * Get a single AI model by ID
     */
    async getModelById(id: string): Promise<ApiResponse<AIModel>> {
        try {
            const response = await apiClient.get(`/ai-models/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch AI model with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create a new AI model configuration
     */
    async createModel(model: Partial<AIModel>): Promise<ApiResponse<AIModel>> {
        try {
            const response = await apiClient.post('/ai-models', model);
            return response.data;
        } catch (error) {
            console.error('Failed to create AI model:', error);
            throw error;
        }
    },

    /**
     * Update an existing AI model configuration
     */
    async updateModel(id: string, model: Partial<AIModel>): Promise<ApiResponse<AIModel>> {
        try {
            const response = await apiClient.put(`/ai-models/${id}`, model);
            return response.data;
        } catch (error) {
            console.error(`Failed to update AI model with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete an AI model configuration
     */
    async deleteModel(id: string): Promise<ApiResponse<null>> {
        try {
            const response = await apiClient.delete(`/ai-models/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to delete AI model with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get all AI model providers
     */
    async getProviders(): Promise<ApiResponse<string[]>> {
        try {
            const response = await apiClient.get('/ai-models/providers');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch AI model providers:', error);
            throw error;
        }
    },

    /**
     * Test connection to an AI model
     */
    async testModelConnection(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
        try {
            const response = await apiClient.post(`/ai-models/${id}/test-connection`);
            return response.data;
        } catch (error) {
            console.error(`Failed to test connection to AI model with ID ${id}:`, error);
            throw error;
        }
    }
}; 