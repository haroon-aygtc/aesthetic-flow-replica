import axios from 'axios';
import { useCallback } from 'react';

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

/**
 * This hook provides a GraphQL-like interface that actually uses REST API endpoints.
 * It's a compatibility layer to allow components to use a GraphQL-like syntax
 * while we're using REST APIs under the hood.
 */
export function useGraphQL() {
    /**
     * Context Rules API Methods
     */
    const contextRulesQuery = useCallback(async () => {
        try {
            const response = await apiClient.get('/context-rules');
            return { data: { contextRules: response.data.data } };
        } catch (error) {
            console.error('Error fetching context rules:', error);
            return { data: { contextRules: [] } };
        }
    }, []);

    const widgetContextRulesQuery = useCallback(async ({ widget_id }: { widget_id: number }) => {
        try {
            const response = await apiClient.get(`/widgets/${widget_id}/context-rules`);
            return { data: { widgetContextRules: response.data.data } };
        } catch (error) {
            console.error(`Error fetching context rules for widget ${widget_id}:`, error);
            return { data: { widgetContextRules: [] } };
        }
    }, []);

    const createContextRuleMutation = useCallback(async ({ input }: { input: any }) => {
        try {
            const response = await apiClient.post('/context-rules', input);
            return { data: { createContextRule: response.data.data } };
        } catch (error) {
            console.error('Error creating context rule:', error);
            throw error;
        }
    }, []);

    const updateContextRuleMutation = useCallback(async ({ id, input }: { id: number, input: any }) => {
        try {
            const response = await apiClient.put(`/context-rules/${id}`, input);
            return { data: { updateContextRule: response.data.data } };
        } catch (error) {
            console.error(`Error updating context rule ${id}:`, error);
            throw error;
        }
    }, []);

    const deleteContextRuleMutation = useCallback(async ({ id }: { id: number }) => {
        try {
            await apiClient.delete(`/context-rules/${id}`);
            return { data: { deleteContextRule: true } };
        } catch (error) {
            console.error(`Error deleting context rule ${id}:`, error);
            throw error;
        }
    }, []);

    const associateContextRuleWithWidgetMutation = useCallback(async ({
        rule_id,
        widget_id,
        settings
    }: {
        rule_id: number,
        widget_id: number,
        settings?: Record<string, any>
    }) => {
        try {
            const response = await apiClient.post(`/context-rules/${rule_id}/widgets/${widget_id}`, { settings });
            return { data: { associateContextRuleWithWidget: response.data.data } };
        } catch (error) {
            console.error(`Error associating context rule ${rule_id} with widget ${widget_id}:`, error);
            throw error;
        }
    }, []);

    const dissociateContextRuleFromWidgetMutation = useCallback(async ({
        rule_id,
        widget_id
    }: {
        rule_id: number,
        widget_id: number
    }) => {
        try {
            await apiClient.delete(`/context-rules/${rule_id}/widgets/${widget_id}`);
            return { data: { dissociateContextRuleFromWidget: true } };
        } catch (error) {
            console.error(`Error dissociating context rule ${rule_id} from widget ${widget_id}:`, error);
            throw error;
        }
    }, []);

    const testContextRuleMutation = useCallback(async ({
        id,
        context
    }: {
        id: number,
        context: Record<string, any>
    }) => {
        try {
            const response = await apiClient.post(`/context-rules/${id}/test`, { context });
            return { data: { testContextRule: response.data.data } };
        } catch (error) {
            console.error(`Error testing context rule ${id}:`, error);
            throw error;
        }
    }, []);

    const getContextSessionQuery = useCallback(async ({ session_id }: { session_id: string }) => {
        try {
            const response = await apiClient.get(`/context-sessions/${session_id}`);
            return { data: { contextSession: response.data.data } };
        } catch (error) {
            console.error(`Error fetching context session ${session_id}:`, error);
            return { data: { contextSession: { data: {} } } };
        }
    }, []);

    const storeContextSessionMutation = useCallback(async ({
        session_id,
        data
    }: {
        session_id: string,
        data: Record<string, any>
    }) => {
        try {
            const response = await apiClient.post(`/context-sessions/${session_id}`, { data });
            return { data: { storeContextSession: response.data.data } };
        } catch (error) {
            console.error(`Error storing context session ${session_id}:`, error);
            throw error;
        }
    }, []);

    const clearContextSessionMutation = useCallback(async ({ session_id }: { session_id: string }) => {
        try {
            await apiClient.delete(`/context-sessions/${session_id}`);
            return { data: { clearContextSession: true } };
        } catch (error) {
            console.error(`Error clearing context session ${session_id}:`, error);
            throw error;
        }
    }, []);

    /**
     * Template API Methods
     */
    const templatesQuery = useCallback(async () => {
        try {
            const response = await apiClient.get('/templates');
            return { data: { templates: response.data.data } };
        } catch (error) {
            console.error('Error fetching templates:', error);
            return { data: { templates: [] } };
        }
    }, []);

    const widgetTemplatesQuery = useCallback(async ({ widget_id }: { widget_id: number }) => {
        try {
            const response = await apiClient.get(`/widgets/${widget_id}/templates`);
            return { data: { widgetTemplates: response.data.data } };
        } catch (error) {
            console.error(`Error fetching templates for widget ${widget_id}:`, error);
            return { data: { widgetTemplates: [] } };
        }
    }, []);

    const templateVersionsQuery = useCallback(async ({ template_id }: { template_id: number }) => {
        try {
            const response = await apiClient.get(`/templates/${template_id}/versions`);
            return { data: { templateVersions: response.data.data } };
        } catch (error) {
            console.error(`Error fetching versions for template ${template_id}:`, error);
            return { data: { templateVersions: [] } };
        }
    }, []);

    const createTemplateMutation = useCallback(async ({ input }: { input: any }) => {
        try {
            const response = await apiClient.post('/templates', input);
            return { data: { createTemplate: response.data.data } };
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    }, []);

    const updateTemplateMutation = useCallback(async ({ id, input }: { id: number, input: any }) => {
        try {
            const response = await apiClient.put(`/templates/${id}`, input);
            return { data: { updateTemplate: response.data.data } };
        } catch (error) {
            console.error(`Error updating template ${id}:`, error);
            throw error;
        }
    }, []);

    const deleteTemplateMutation = useCallback(async ({ id }: { id: number }) => {
        try {
            await apiClient.delete(`/templates/${id}`);
            return { data: { deleteTemplate: true } };
        } catch (error) {
            console.error(`Error deleting template ${id}:`, error);
            throw error;
        }
    }, []);

    const createTemplateVersionMutation = useCallback(async ({
        template_id,
        input
    }: {
        template_id: number,
        input: any
    }) => {
        try {
            const response = await apiClient.post(`/templates/${template_id}/versions`, input);
            return { data: { createTemplateVersion: response.data.data } };
        } catch (error) {
            console.error(`Error creating version for template ${template_id}:`, error);
            throw error;
        }
    }, []);

    /**
     * Knowledge Base API Methods
     */
    const knowledgeBasesQuery = useCallback(async () => {
        try {
            const response = await apiClient.get('/knowledge-base/bases');
            return { data: { knowledgeBases: response.data.data } };
        } catch (error) {
            console.error('Error fetching knowledge bases:', error);
            return { data: { knowledgeBases: [] } };
        }
    }, []);

    const knowledgeBaseSourcesQuery = useCallback(async ({ knowledge_base_id }: { knowledge_base_id: number }) => {
        try {
            const response = await apiClient.get(`/knowledge-base/bases/${knowledge_base_id}/sources`);
            return { data: { knowledgeBaseSources: response.data.data } };
        } catch (error) {
            console.error(`Error fetching sources for knowledge base ${knowledge_base_id}:`, error);
            return { data: { knowledgeBaseSources: [] } };
        }
    }, []);

    const knowledgeBaseEntriesQuery = useCallback(async ({ source_id }: { source_id: number }) => {
        try {
            const response = await apiClient.get(`/knowledge-base/sources/${source_id}/entries`);
            return { data: { knowledgeBaseEntries: response.data.data } };
        } catch (error) {
            console.error(`Error fetching entries for source ${source_id}:`, error);
            return { data: { knowledgeBaseEntries: [] } };
        }
    }, []);

    const createKnowledgeBaseMutation = useCallback(async ({ input }: { input: any }) => {
        try {
            const response = await apiClient.post('/knowledge-base/bases', input);
            return { data: { createKnowledgeBase: response.data.data } };
        } catch (error) {
            console.error('Error creating knowledge base:', error);
            throw error;
        }
    }, []);

    const updateKnowledgeBaseMutation = useCallback(async ({ id, input }: { id: number, input: any }) => {
        try {
            const response = await apiClient.put(`/knowledge-base/bases/${id}`, input);
            return { data: { updateKnowledgeBase: response.data.data } };
        } catch (error) {
            console.error(`Error updating knowledge base ${id}:`, error);
            throw error;
        }
    }, []);

    const deleteKnowledgeBaseMutation = useCallback(async ({ id }: { id: number }) => {
        try {
            await apiClient.delete(`/knowledge-base/bases/${id}`);
            return { data: { deleteKnowledgeBase: true } };
        } catch (error) {
            console.error(`Error deleting knowledge base ${id}:`, error);
            throw error;
        }
    }, []);

    const createKnowledgeBaseSourceMutation = useCallback(async ({
        knowledge_base_id,
        input
    }: {
        knowledge_base_id: number,
        input: any
    }) => {
        try {
            const response = await apiClient.post(`/knowledge-base/bases/${knowledge_base_id}/sources`, input);
            return { data: { createKnowledgeBaseSource: response.data.data } };
        } catch (error) {
            console.error(`Error creating source for knowledge base ${knowledge_base_id}:`, error);
            throw error;
        }
    }, []);

    const updateKnowledgeBaseSourceMutation = useCallback(async ({
        id,
        input
    }: {
        id: number,
        input: any
    }) => {
        try {
            const response = await apiClient.put(`/knowledge-base/sources/${id}`, input);
            return { data: { updateKnowledgeBaseSource: response.data.data } };
        } catch (error) {
            console.error(`Error updating knowledge base source ${id}:`, error);
            throw error;
        }
    }, []);

    const deleteKnowledgeBaseSourceMutation = useCallback(async ({ id }: { id: number }) => {
        try {
            await apiClient.delete(`/knowledge-base/sources/${id}`);
            return { data: { deleteKnowledgeBaseSource: true } };
        } catch (error) {
            console.error(`Error deleting knowledge base source ${id}:`, error);
            throw error;
        }
    }, []);

    const createKnowledgeBaseEntryMutation = useCallback(async ({
        source_id,
        input
    }: {
        source_id: number,
        input: any
    }) => {
        try {
            const response = await apiClient.post(`/knowledge-base/sources/${source_id}/entries`, input);
            return { data: { createKnowledgeBaseEntry: response.data.data } };
        } catch (error) {
            console.error(`Error creating entry for source ${source_id}:`, error);
            throw error;
        }
    }, []);

    const updateKnowledgeBaseEntryMutation = useCallback(async ({
        id,
        input
    }: {
        id: number,
        input: any
    }) => {
        try {
            const response = await apiClient.put(`/knowledge-base/entries/${id}`, input);
            return { data: { updateKnowledgeBaseEntry: response.data.data } };
        } catch (error) {
            console.error(`Error updating knowledge base entry ${id}:`, error);
            throw error;
        }
    }, []);

    const deleteKnowledgeBaseEntryMutation = useCallback(async ({ id }: { id: number }) => {
        try {
            await apiClient.delete(`/knowledge-base/entries/${id}`);
            return { data: { deleteKnowledgeBaseEntry: true } };
        } catch (error) {
            console.error(`Error deleting knowledge base entry ${id}:`, error);
            throw error;
        }
    }, []);

    /**
     * Branding API Methods
     */
    const brandingSettingsQuery = useCallback(async () => {
        try {
            const response = await apiClient.get('/branding-settings');
            return { data: { brandingSettings: response.data.data } };
        } catch (error) {
            console.error('Error fetching branding settings:', error);
            return { data: { brandingSettings: [] } };
        }
    }, []);

    const widgetBrandingQuery = useCallback(async ({ widget_id }: { widget_id: number }) => {
        try {
            const response = await apiClient.get(`/widgets/${widget_id}/branding`);
            return { data: { widgetBranding: response.data.data } };
        } catch (error) {
            console.error(`Error fetching branding for widget ${widget_id}:`, error);
            return { data: { widgetBranding: null } };
        }
    }, []);

    const widgetBrandingCssQuery = useCallback(async ({ widget_id }: { widget_id: number }) => {
        try {
            const response = await apiClient.get(`/widgets/${widget_id}/branding/css`);
            return { data: { widgetBrandingCss: response.data.data } };
        } catch (error) {
            console.error(`Error fetching branding CSS for widget ${widget_id}:`, error);
            return { data: { widgetBrandingCss: { css: null } } };
        }
    }, []);

    const brandingSettingCssQuery = useCallback(async ({ id }: { id: number }) => {
        try {
            const response = await apiClient.get(`/branding-settings/${id}/css`);
            return { data: { brandingSettingCss: response.data.data } };
        } catch (error) {
            console.error(`Error fetching CSS for branding setting ${id}:`, error);
            return { data: { brandingSettingCss: { css: null } } };
        }
    }, []);

    return {
        client: {
            // Context Rules
            contextRulesQuery,
            widgetContextRulesQuery,
            createContextRuleMutation,
            updateContextRuleMutation,
            deleteContextRuleMutation,
            associateContextRuleWithWidgetMutation,
            dissociateContextRuleFromWidgetMutation,
            testContextRuleMutation,
            getContextSessionQuery,
            storeContextSessionMutation,
            clearContextSessionMutation,

            // Templates
            templatesQuery,
            widgetTemplatesQuery,
            templateVersionsQuery,
            createTemplateMutation,
            updateTemplateMutation,
            deleteTemplateMutation,
            createTemplateVersionMutation,

            // Knowledge Base
            knowledgeBasesQuery,
            knowledgeBaseSourcesQuery,
            knowledgeBaseEntriesQuery,
            createKnowledgeBaseMutation,
            updateKnowledgeBaseMutation,
            deleteKnowledgeBaseMutation,
            createKnowledgeBaseSourceMutation,
            updateKnowledgeBaseSourceMutation,
            deleteKnowledgeBaseSourceMutation,
            createKnowledgeBaseEntryMutation,
            updateKnowledgeBaseEntryMutation,
            deleteKnowledgeBaseEntryMutation,

            // Branding
            brandingSettingsQuery,
            widgetBrandingQuery,
            widgetBrandingCssQuery,
            brandingSettingCssQuery,
        }
    };
}
