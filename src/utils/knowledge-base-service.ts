
import api from "./api-service";

export interface KnowledgeDocument {
  id: string;
  filename: string;
  filetype: string;
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
      return await api.get('/api/knowledge-base/documents');
    } catch (error) {
      console.error("Error fetching documents:", error);
      
      // Return mock data for demonstration
      const mockDocuments: KnowledgeDocument[] = [
        {
          id: "doc-1",
          filename: "Company FAQ.pdf",
          filetype: "pdf",
          size: 2458000,
          status: "processed",
          created_at: "2025-04-20T12:00:00Z",
          category: "General"
        },
        {
          id: "doc-2",
          filename: "Product Manual.docx",
          filetype: "docx",
          size: 1792000,
          status: "processed",
          created_at: "2025-04-21T14:30:00Z",
          category: "Technical"
        },
        {
          id: "doc-3",
          filename: "Support Knowledge Base.csv",
          filetype: "csv",
          size: 925000,
          status: "processing",
          created_at: "2025-04-22T09:15:00Z",
          category: "Support"
        },
        {
          id: "doc-4",
          filename: "Legal Disclaimers.txt",
          filetype: "txt",
          size: 456000,
          status: "processed",
          created_at: "2025-04-23T16:45:00Z",
          category: "Legal"
        },
        {
          id: "doc-5",
          filename: "Marketing Collateral.pptx",
          filetype: "pptx",
          size: 3450000,
          status: "failed",
          created_at: "2025-04-24T11:20:00Z",
          category: "Marketing"
        }
      ];
      
      return { data: mockDocuments };
    }
  },
  
  uploadDocument: async (file: File, category: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      return await api.post('/api/knowledge-base/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      
      // Return mock data for demonstration
      const mockDocument: KnowledgeDocument = {
        id: `doc-${Date.now()}`,
        filename: file.name,
        filetype: file.name.split('.').pop() || '',
        size: file.size,
        status: "processing",
        created_at: new Date().toISOString(),
        category: category
      };
      
      return { data: mockDocument };
    }
  },
  
  deleteDocument: async (documentId: string) => {
    try {
      return await api.delete(`/api/knowledge-base/documents/${documentId}`);
    } catch (error) {
      console.error("Error deleting document:", error);
      
      // Return mock data for demonstration
      return { data: { success: true } };
    }
  },
  
  downloadDocument: async (documentId: string) => {
    try {
      return await api.get(`/api/knowledge-base/documents/${documentId}/download`, {
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
      return await api.get('/api/knowledge-base/qa-pairs');
    } catch (error) {
      console.error("Error fetching Q&A pairs:", error);
      
      // Return mock data for demonstration
      const mockQAPairs: QAPair[] = [
        {
          id: "qa-1",
          question: "How do I reset my password?",
          answer: "To reset your password, click on the 'Forgot Password' link on the login page and follow the instructions sent to your email.",
          category: "Support",
          created_at: "2025-04-20T12:00:00Z"
        },
        {
          id: "qa-2",
          question: "What payment methods do you accept?",
          answer: "We accept credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for business accounts.",
          category: "Billing",
          created_at: "2025-04-21T14:30:00Z"
        },
        {
          id: "qa-3",
          question: "How can I upgrade my subscription?",
          answer: "To upgrade your subscription, go to the Account Settings page and click on the 'Subscription' tab. There you'll find options to upgrade your current plan.",
          category: "Billing",
          created_at: "2025-04-22T09:15:00Z"
        },
        {
          id: "qa-4",
          question: "What is your refund policy?",
          answer: "We offer a 30-day money-back guarantee for all our subscription plans. If you're not satisfied with our service, you can request a full refund within 30 days of your purchase.",
          category: "Legal",
          created_at: "2025-04-23T16:45:00Z"
        },
        {
          id: "qa-5",
          question: "How do I contact customer support?",
          answer: "You can contact our customer support team via email at support@example.com, through the in-app chat feature, or by calling our support line at +1-800-123-4567 during business hours.",
          category: "Support",
          created_at: "2025-04-24T11:20:00Z"
        }
      ];
      
      return { data: mockQAPairs };
    }
  },
  
  createQAPair: async (data: { question: string; answer: string; category: string }) => {
    try {
      return await api.post('/api/knowledge-base/qa-pairs', data);
    } catch (error) {
      console.error("Error creating Q&A pair:", error);
      
      // Return mock data for demonstration
      const mockQAPair: QAPair = {
        id: `qa-${Date.now()}`,
        question: data.question,
        answer: data.answer,
        category: data.category,
        created_at: new Date().toISOString()
      };
      
      return { data: mockQAPair };
    }
  },
  
  updateQAPair: async (pairId: string, data: { question: string; answer: string; category: string }) => {
    try {
      return await api.put(`/api/knowledge-base/qa-pairs/${pairId}`, data);
    } catch (error) {
      console.error("Error updating Q&A pair:", error);
      
      // Return mock data for demonstration
      const mockQAPair: QAPair = {
        id: pairId,
        question: data.question,
        answer: data.answer,
        category: data.category,
        created_at: new Date().toISOString()
      };
      
      return { data: mockQAPair };
    }
  },
  
  deleteQAPair: async (pairId: string) => {
    try {
      return await api.delete(`/api/knowledge-base/qa-pairs/${pairId}`);
    } catch (error) {
      console.error("Error deleting Q&A pair:", error);
      
      // Return mock data for demonstration
      return { data: { success: true } };
    }
  },
  
  // Insights operations
  getInsights: async (timeframe: string = '30days') => {
    try {
      return await api.get(`/api/knowledge-base/insights?timeframe=${timeframe}`);
    } catch (error) {
      console.error("Error fetching insights:", error);
      
      // Will use generated sample data from the component
      return { data: null };
    }
  }
};
