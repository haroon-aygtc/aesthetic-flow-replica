// Import the API instance from the modular file
import api from "./api";

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "processed" | "processing" | "failed";
  created_at: string;
  category: string;
  url?: string;
}

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
}

export interface WebsiteSource {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "pending" | "failed";
  last_crawled_at: string;
  auto_update: boolean;
  update_frequency: "daily" | "weekly" | "monthly";
  created_at: string;
}

export const knowledgeBaseService = {
  // Document operations
  getDocuments: async () => {
    try {
      return await api.get('knowledge-base/documents');
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  uploadDocument: async (file: File, category: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      return await api.post('knowledge-base/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  deleteDocument: async (documentId: string) => {
    try {
      return await api.delete(`knowledge-base/documents/${documentId}`);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  downloadDocument: async (documentId: string) => {
    try {
      return await api.get(`knowledge-base/documents/${documentId}/download`, {
        responseType: 'blob'
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      throw error;
    }
  },

  // Q&A pair operations
  getQAPairs: async () => {
    try {
      return await api.get('knowledge-base/qa-pairs');
    } catch (error) {
      console.error("Error fetching Q&A pairs:", error);
      throw error;
    }
  },

  createQAPair: async (data: { question: string; answer: string; category: string }) => {
    try {
      return await api.post('knowledge-base/qa-pairs', data);
    } catch (error) {
      console.error("Error creating Q&A pair:", error);
      throw error;
    }
  },

  updateQAPair: async (pairId: string, data: { question: string; answer: string; category: string }) => {
    try {
      return await api.put(`knowledge-base/qa-pairs/${pairId}`, data);
    } catch (error) {
      console.error("Error updating Q&A pair:", error);
      throw error;
    }
  },

  deleteQAPair: async (pairId: string) => {
    try {
      return await api.delete(`knowledge-base/qa-pairs/${pairId}`);
    } catch (error) {
      console.error("Error deleting Q&A pair:", error);
      throw error;
    }
  },

  // Website source operations
  getWebsiteSources: async () => {
    try {
      return await api.get('knowledge-base/website-sources');
    } catch (error) {
      console.error("Error fetching website sources:", error);
      throw error;
    }
  },

  addWebsiteSource: async (data: {
    url: string;
    category: string;
    auto_update?: boolean;
    update_frequency?: 'daily' | 'weekly' | 'monthly'
  }) => {
    try {
      return await api.post('knowledge-base/website-sources', data);
    } catch (error) {
      console.error("Error adding website source:", error);
      throw error;
    }
  },

  updateWebsiteSource: async (sourceId: string, data: {
    category?: string;
    auto_update?: boolean;
    update_frequency?: 'daily' | 'weekly' | 'monthly'
  }) => {
    try {
      return await api.put(`knowledge-base/website-sources/${sourceId}`, data);
    } catch (error) {
      console.error("Error updating website source:", error);
      throw error;
    }
  },

  deleteWebsiteSource: async (sourceId: string) => {
    try {
      return await api.delete(`knowledge-base/website-sources/${sourceId}`);
    } catch (error) {
      console.error("Error deleting website source:", error);
      throw error;
    }
  },

  refreshWebsiteSource: async (sourceId: string) => {
    try {
      return await api.post(`knowledge-base/website-sources/${sourceId}/refresh`);
    } catch (error) {
      console.error("Error refreshing website source:", error);
      throw error;
    }
  },

  previewWebsiteContent: async (sourceId: string) => {
    try {
      return await api.get(`knowledge-base/website-sources/${sourceId}/preview`);
    } catch (error) {
      console.error("Error previewing website content:", error);
      throw error;
    }
  },

  exportWebsiteContent: async (sourceId: string, format: string) => {
    try {
      return await api.post(`knowledge-base/website-sources/${sourceId}/export`, {
        format,
        use_cached: true
      });
    } catch (error) {
      console.error("Error exporting website content:", error);
      throw error;
    }
  },

  // Insights operations
  getInsights: async (timeframe: string = '30days') => {
    try {
      const response = await api.get(`knowledge-base/insights?timeframe=${timeframe}`);

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error("Error fetching insights:", error);
      // Provide more specific error message
      throw new Error(`Failed to fetch knowledge base insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Search operations
  search: async (query: string, options?: {
    limit?: number;
    threshold?: number;
    sources?: string[];
    category?: string;
  }) => {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query cannot be empty');
      }

      const response = await api.post('knowledge-base/search', {
        query,
        ...options
      });

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response format: missing data');
      }

      return response;
    } catch (error) {
      console.error("Error searching knowledge base:", error);
      // Provide more specific error message with query info
      throw new Error(`Failed to search knowledge base for "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
