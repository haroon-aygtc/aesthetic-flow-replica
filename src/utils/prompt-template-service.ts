import { v4 as uuidv4 } from 'uuid';
import { promptTemplateEngine } from './prompt-template-engine';
import { z } from "zod";

export interface PromptVariable {
    name: string;
    type: "text" | "number" | "boolean" | "select" | "date";
    description: string;
    defaultValue?: any;
    options?: string[];  // For 'select' type
    required: boolean;
}

export interface PromptTemplateMetadata {
    tags: string[];
    aiModel: string[];
    activationRules: ActivationRule[];
    creator: string;
    lastModified: Date;
    version: number;
}

export interface ActivationRule {
    id: string;
    type: "url_pattern" | "user_intent" | "keyword" | "time_based" | "user_attribute" | "custom";
    condition: string;
    priority: number;
    isActive: boolean;
}

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    variables: PromptVariable[];
    metadata: PromptTemplateMetadata;
    createdAt?: Date;
    updatedAt?: Date;
}

export const promptVariableSchema = z.object({
    name: z.string().min(1, "Variable name is required"),
    type: z.enum(["text", "number", "boolean", "select", "date"]),
    description: z.string().optional(),
    defaultValue: z.any().optional(),
    options: z.array(z.string()).optional(),
    required: z.boolean().default(true),
});

export const activationRuleSchema = z.object({
    id: z.string().optional(),
    type: z.enum(["url_pattern", "user_intent", "keyword", "time_based", "user_attribute", "custom"]),
    condition: z.string(),
    priority: z.number().int().min(0),
    isActive: z.boolean().default(true),
});

export const promptTemplateMetadataSchema = z.object({
    tags: z.array(z.string()).default([]),
    aiModel: z.array(z.string()).min(1, "At least one AI model must be selected"),
    activationRules: z.array(activationRuleSchema).default([]),
    creator: z.string(),
    lastModified: z.date().default(() => new Date()),
    version: z.number().int().min(1).default(1),
});

export const promptTemplateSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "Template name must be at least 3 characters"),
    description: z.string().optional(),
    content: z.string().min(10, "Template content must be at least 10 characters"),
    variables: z.array(promptVariableSchema).default([]),
    metadata: promptTemplateMetadataSchema,
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

// Template processing functions
export function processTemplate(template: string, variables: Record<string, any> = {}): string {
    // Basic variable substitution
    let processed = template.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();

        // Handle helpers/filters (e.g., {{variable|uppercase}})
        if (trimmedKey.includes('|')) {
            const [varName, helper] = trimmedKey.split('|').map(part => part.trim());
            const value = variables[varName] || match;

            return applyHelper(value, helper);
        }

        // Handle simple variable replacement
        return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match;
    });

    // Handle conditional blocks (basic implementation)
    processed = processConditionals(processed, variables);

    return processed;
}

function processConditionals(template: string, variables: Record<string, any>): string {
    // Simple implementation for {{#if variable}}...{{/if}} blocks
    const conditionalRegex = /\{\{#if\s+([^{}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return template.replace(conditionalRegex, (match, condition, content) => {
        const conditionValue = evaluateCondition(condition.trim(), variables);
        return conditionValue ? content : '';
    });
}

function evaluateCondition(condition: string, variables: Record<string, any>): boolean {
    // For now, just check if the variable exists and is truthy
    return !!variables[condition];
}

function applyHelper(value: any, helper: string): string {
    switch (helper) {
        case 'uppercase':
            return String(value).toUpperCase();
        case 'lowercase':
            return String(value).toLowerCase();
        case 'capitalize':
            return String(value).charAt(0).toUpperCase() + String(value).slice(1);
        case 'json':
            return JSON.stringify(value, null, 2);
        default:
            return String(value);
    }
}

export function extractVariablesFromTemplate(template: string): PromptVariable[] {
    const variableRegex = /\{\{([^{}|#\/]+)(?:\|[^{}]+)?\}\}/g;
    const matches = [...template.matchAll(variableRegex)];

    const uniqueVars = new Set<string>();
    matches.forEach(match => {
        const varName = match[1].trim();
        uniqueVars.add(varName);
    });

    return Array.from(uniqueVars).map(name => ({
        name,
        type: "text",
        description: `Variable: ${name}`,
        required: true
    }));
}

export function validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for unclosed variable tags
    const openTags = (template.match(/\{\{/g) || []).length;
    const closeTags = (template.match(/\}\}/g) || []).length;

    if (openTags !== closeTags) {
        errors.push(`Mismatched template tags: ${openTags} opening tags and ${closeTags} closing tags`);
    }

    // Check for unclosed conditional blocks
    const openIfs = (template.match(/\{\{#if/g) || []).length;
    const closeIfs = (template.match(/\{\{\/if\}\}/g) || []).length;

    if (openIfs !== closeIfs) {
        errors.push(`Mismatched conditional blocks: ${openIfs} opening blocks and ${closeIfs} closing blocks`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function ensureValidVariables(variables: Partial<PromptVariable>[]): PromptVariable[] {
    return variables.map(variable => ({
        name: variable.name || "",
        type: variable.type || "text",
        description: variable.description || "",
        defaultValue: variable.defaultValue || "",
        options: variable.options || [],
        required: variable.required !== undefined ? variable.required : true
    }));
}

// Import API service
import api from "./api";

class PromptTemplateService {
    async getTemplates(): Promise<{ data: PromptTemplate[] }> {
        try {
            const response = await api.get('/prompt-templates');
            return response.data;
        } catch (error) {
            console.error('Error fetching prompt templates:', error);
            return { data: [] };
        }
    }

    async getTemplate(id: string): Promise<{ data: PromptTemplate }> {
        try {
            const response = await api.get(`/prompt-templates/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching prompt template with ID ${id}:`, error);
            throw error;
        }
    }

    async createTemplate(template: Omit<PromptTemplate, 'id'>): Promise<{ data: PromptTemplate }> {
        try {
            // Extract variables from the template content
            const extractedVariables = extractVariablesFromTemplate(template.content);

            // Ensure all extracted variables are defined in template.variables
            const updatedVariables = [...template.variables];
            extractedVariables.forEach(varName => {
                const exists = updatedVariables.some(v => v.name === varName.name);
                if (!exists) {
                    updatedVariables.push(varName);
                }
            });

            // Prepare the template data with extracted variables
            const templateData = {
                ...template,
                variables: updatedVariables
            };

            const response = await api.post('/prompt-templates', templateData);
            return response.data;
        } catch (error) {
            console.error('Error creating prompt template:', error);
            throw error;
        }
    }

    async updateTemplate(id: string, updates: Partial<PromptTemplate>): Promise<{ data: PromptTemplate }> {
        try {
            // If content is updated, extract variables
            if (updates.content) {
                // Get current template to access existing variables
                const currentTemplate = await this.getTemplate(id);
                const currentVars = currentTemplate.data.variables || [];

                // Extract variables from the updated content
                const extractedVariables = extractVariablesFromTemplate(updates.content);

                // Add newly detected variables
                const updatedVariables = [...(updates.variables || currentVars)];
                extractedVariables.forEach(varName => {
                    const exists = updatedVariables.some(v => v.name === varName.name);
                    if (!exists) {
                        updatedVariables.push(varName);
                    }
                });

                // Update the variables in the updates object
                updates.variables = updatedVariables;
            }

            const response = await api.put(`/prompt-templates/${id}`, updates);
            return response.data;
        } catch (error) {
            console.error(`Error updating prompt template with ID ${id}:`, error);
            throw error;
        }
    }

    async deleteTemplate(id: string): Promise<{ success: boolean }> {
        try {
            await api.delete(`/prompt-templates/${id}`);
            return { success: true };
        } catch (error) {
            console.error(`Error deleting prompt template with ID ${id}:`, error);
            throw error;
        }
    }

    async duplicateTemplate(id: string, newName?: string): Promise<{ data: PromptTemplate }> {
        try {
            const response = await api.post(`/prompt-templates/${id}/duplicate`, {
                name: newName
            });
            return response.data;
        } catch (error) {
            console.error(`Error duplicating prompt template with ID ${id}:`, error);
            throw error;
        }
    }

    async validateTemplate(template: string): Promise<{ isValid: boolean; errors?: string[] }> {
        try {
            // First perform client-side validation
            const clientValidation = validateTemplate(template);

            if (!clientValidation.isValid) {
                return clientValidation;
            }

            // If client validation passes, validate on server
            const response = await api.post('/prompt-templates/validate', { content: template });
            return response.data;
        } catch (error) {
            console.error('Error validating prompt template:', error);
            // Fall back to client-side validation if server validation fails
            return validateTemplate(template);
        }
    }

    async previewTemplate(template: string, variables: Record<string, any>): Promise<{ data: string }> {
        try {
            const response = await api.post('/prompt-templates/preview', {
                content: template,
                variables
            });
            return response.data;
        } catch (error) {
            console.error('Error previewing prompt template:', error);
            // Fall back to client-side processing if server preview fails
            const processed = processTemplate(template, variables);
            return { data: processed };
        }
    }

    async getTemplateByTag(tag: string): Promise<{ data: PromptTemplate[] }> {
        try {
            const response = await api.get(`/prompt-templates/tags/${tag}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching prompt templates with tag ${tag}:`, error);
            return { data: [] };
        }
    }

    async getTemplatesByAIModel(model: string): Promise<{ data: PromptTemplate[] }> {
        try {
            const response = await api.get(`/prompt-templates/models/${model}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching prompt templates for model ${model}:`, error);
            return { data: [] };
        }
    }

    async getSystemPromptTemplates(): Promise<{ data: PromptTemplate[] }> {
        try {
            const response = await api.get('/prompt-templates/system');
            return response.data;
        } catch (error) {
            console.error('Error fetching system prompt templates:', error);
            return { data: [] };
        }
    }
}

export const promptTemplateService = new PromptTemplateService();