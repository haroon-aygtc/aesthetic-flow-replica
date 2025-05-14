import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PromptTemplate, PromptVariable } from "@/utils/prompt-template-service";
import { promptTemplatesApi } from "@/api/prompt-templates";

interface TemplateContextState {
    templates: PromptTemplate[];
    activeTemplate: PromptTemplate | null;
    conversationHistory: ConversationTurn[];
    isLoading: boolean;
    error: string | null;
}

interface ConversationTurn {
    id: string;
    role: "user" | "assistant";
    content: string;
    templateId?: string;
    variables?: Record<string, any>;
    timestamp: Date;
}

interface TemplateContextValue extends TemplateContextState {
    loadTemplates: () => Promise<void>;
    setActiveTemplate: (template: PromptTemplate | null) => void;
    switchTemplate: (templateId: string, preserveContext?: boolean) => Promise<boolean>;
    addConversationTurn: (turn: Omit<ConversationTurn, "id" | "timestamp">) => void;
    clearConversation: () => void;
    applyTemplate: (message: string, variables: Record<string, any>) => Promise<string>;
}

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

export function PromptTemplateProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<TemplateContextState>({
        templates: [],
        activeTemplate: null,
        conversationHistory: [],
        isLoading: false,
        error: null,
    });

    const loadTemplates = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await promptTemplatesApi.getTemplates();
            setState(prev => ({
                ...prev,
                templates: response.data,
                isLoading: false
            }));
        } catch (error) {
            console.error("Failed to load templates:", error);
            setState(prev => ({
                ...prev,
                error: "Failed to load templates. Please try again.",
                isLoading: false
            }));
        }
    };

    const setActiveTemplate = (template: PromptTemplate | null) => {
        setState(prev => ({ ...prev, activeTemplate: template }));
    };

    const switchTemplate = async (templateId: string, preserveContext = true): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            // Find the template in the loaded templates
            const template = state.templates.find(t => t.id === templateId);

            if (!template) {
                // If not found, try to fetch it
                const response = await promptTemplatesApi.getTemplateById(templateId);
                setActiveTemplate(response.data);
            } else {
                setActiveTemplate(template);
            }

            // If not preserving context, clear conversation history
            if (!preserveContext) {
                clearConversation();
            }

            setState(prev => ({ ...prev, isLoading: false }));
            return true;
        } catch (error) {
            console.error("Failed to switch template:", error);
            setState(prev => ({
                ...prev,
                error: "Failed to switch template. Please try again.",
                isLoading: false
            }));
            return false;
        }
    };

    const addConversationTurn = (turn: Omit<ConversationTurn, "id" | "timestamp">) => {
        const newTurn: ConversationTurn = {
            ...turn,
            id: crypto.randomUUID(),
            timestamp: new Date()
        };

        setState(prev => ({
            ...prev,
            conversationHistory: [...prev.conversationHistory, newTurn]
        }));
    };

    const clearConversation = () => {
        setState(prev => ({ ...prev, conversationHistory: [] }));
    };

    const applyTemplate = async (message: string, variables: Record<string, any>): Promise<string> => {
        if (!state.activeTemplate) {
            throw new Error("No active template selected");
        }

        try {
            // Include conversation context in variables
            const contextEnrichedVariables = {
                ...variables,
                conversation_history: state.conversationHistory.map(turn => ({
                    role: turn.role,
                    content: turn.content
                })),
                user_message: message
            };

            // Preview the template with the variables
            const response = await promptTemplatesApi.previewTemplate(
                state.activeTemplate.content,
                contextEnrichedVariables
            );

            return response.data;
        } catch (error) {
            console.error("Failed to apply template:", error);
            throw new Error("Failed to apply template to message");
        }
    };

    // Load templates on initial mount
    useEffect(() => {
        loadTemplates();
    }, []);

    const value: TemplateContextValue = {
        ...state,
        loadTemplates,
        setActiveTemplate,
        switchTemplate,
        addConversationTurn,
        clearConversation,
        applyTemplate
    };

    return (
        <TemplateContext.Provider value={value}>
            {children}
        </TemplateContext.Provider>
    );
}

export function usePromptTemplates() {
    const context = useContext(TemplateContext);
    if (context === undefined) {
        throw new Error("usePromptTemplates must be used within a PromptTemplateProvider");
    }
    return context;
} 