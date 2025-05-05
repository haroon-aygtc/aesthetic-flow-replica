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

  // Insights operations
  getInsights: async (timeframe: string = '30days') => {
    try {
      return await api.get(`knowledge-base/insights?timeframe=${timeframe}`);
    } catch (error) {
      console.error("Error fetching insights:", error);
      throw error;
    }
  }
};
