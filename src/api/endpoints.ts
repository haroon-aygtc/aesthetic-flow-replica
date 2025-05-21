/**
 * Centralized API endpoint definitions
 * This file contains all API endpoint paths used throughout the application
 */

export const endpoints = {
  // Auth endpoints
  auth: {
    login: "/login",
    register: "/register",
    logout: "/logout",
    user: "/user",
    csrfToken: "/sanctum/csrf-cookie",
  },

  // User management endpoints
  users: {
    base: "/users",
    byId: (id: number) => `/users/${id}`,
    roles: (id: number) => `/users/${id}/roles`,
  },

  // Role management endpoints
  roles: {
    base: "/roles",
    byId: (id: number) => `/roles/${id}`,
    permissions: (roleId: number) => `/roles/${roleId}/permissions`,
    byPermission: (permissionId: number) => `/roles/permission/${permissionId}`,
  },

  // Permission management endpoints
  permissions: {
    base: "/permissions",
    byId: (id: number) => `/permissions/${id}`,
    byCategory: (category: string) => `/permissions/category/${category}`,
  },

  // Guest user endpoints
  guestUsers: {
    base: "/guest-users",
    byId: (id: number) => `/guest-users/${id}`,
    chatHistory: (sessionId: string) => `/chat/history?session_id=${sessionId}`,
  },

  // Widget endpoints
  widgets: {
    base: "/widgets",
    byId: (id: number) => `/widgets/${id}`,
    public: (widgetId: string) => `/widgets/public/${widgetId}`,
    analytics: {
      summary: (widgetId: number, period: string) =>
        `/widgets/${widgetId}/analytics/summary?period=${period}`,
      base: (widgetId: number) => `/widgets/${widgetId}/analytics`,
    },
  },

  // Embed code endpoints
  embedCode: {
    generate: "/embed-code/generate",
  },

  // Knowledge base endpoints
  knowledgeBase: {
    documents: {
      base: "/knowledge-base/documents",
      upload: "/knowledge-base/documents/upload",
      byId: (documentId: string) => `/knowledge-base/documents/${documentId}`,
      download: (documentId: string) =>
        `/knowledge-base/documents/${documentId}/download`,
    },
    qaPairs: {
      base: "/knowledge-base/qa-pairs",
      byId: (pairId: string) => `/knowledge-base/qa-pairs/${pairId}`,
    },
    websiteSources: {
      base: "/knowledge-base/website-sources",
      byId: (sourceId: string) => `/knowledge-base/website-sources/${sourceId}`,
      refresh: (sourceId: string) =>
        `/knowledge-base/website-sources/${sourceId}/refresh`,
      preview: (sourceId: string) =>
        `/knowledge-base/website-sources/${sourceId}/preview`,
      export: (sourceId: string) =>
        `/knowledge-base/website-sources/${sourceId}/export`,
    },
    insights: (timeframe: string = "30days") =>
      `/knowledge-base/insights?timeframe=${timeframe}`,
    search: "/knowledge-base/search",
  },

  // AI models endpoints
  aiModels: {
    base: "/ai-models",
    byId: (id: string) => `/ai-models/${id}`,
    providers: "/ai-models/providers",
    testConnection: (id: string) => `/ai-models/${id}/test-connection`,
  },

  // Prompt templates endpoints
  promptTemplates: {
    base: "/prompt-templates",
    byId: (id: string) => `/prompt-templates/${id}`,
    duplicate: (id: string) => `/prompt-templates/${id}/duplicate`,
    preview: "/prompt-templates/preview",
    byTag: (tag: string) => `/prompt-templates/tag/${tag}`,
    byModel: (model: string) => `/prompt-templates/model/${model}`,
    system: "/prompt-templates/system",
    versions: (templateId: string) =>
      `/prompt-templates/${templateId}/versions`,
  },
};
