import Handlebars from 'handlebars';

interface TemplateRenderOptions {
    template: string;
    variables: Record<string, any>;
}

interface TemplateCompileOptions {
    template: string;
    enableCache?: boolean;
}

interface TemplateValidationResult {
    isValid: boolean;
    errors: string[];
    missingVariables: string[];
}

type HandlebarsTemplateDelegate = (context?: any, options?: any) => string;

/**
 * Prompt Template Engine - A service for rendering and validating prompt templates
 * using Handlebars for variable substitution and conditional logic.
 */
class PromptTemplateEngine {
    private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
    private readonly defaultHelpers = [
        'uppercase', 'lowercase', 'titlecase', 'ifExists',
        'truncate', 'datetime', 'join', 'count', 'math', 'ifNotEmpty'
    ];

    constructor() {
        this.registerHelpers();
    }

    /**
     * Register custom Handlebars helpers for template processing
     */
    private registerHelpers(): void {
        // Text transformation helpers
        Handlebars.registerHelper('uppercase', (value) => {
            return typeof value === 'string' ? value.toUpperCase() : value;
        });

        Handlebars.registerHelper('lowercase', (value) => {
            return typeof value === 'string' ? value.toLowerCase() : value;
        });

        Handlebars.registerHelper('titlecase', (value) => {
            if (typeof value !== 'string') return value;
            return value.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
            });
        });

        // Conditional helpers
        Handlebars.registerHelper('ifExists', function (this: any, value, options) {
            return value !== undefined && value !== null ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('ifNotEmpty', function (this: any, value, options) {
            if (typeof value === 'string') {
                return value.trim().length > 0 ? options.fn(this) : options.inverse(this);
            }
            if (Array.isArray(value)) {
                return value.length > 0 ? options.fn(this) : options.inverse(this);
            }
            return value ? options.fn(this) : options.inverse(this);
        });

        // Utility helpers
        Handlebars.registerHelper('truncate', (value, length = 100, ending = '...') => {
            if (typeof value !== 'string') return value;
            if (value.length <= length) return value;
            return value.substring(0, length - ending.length) + ending;
        });

        Handlebars.registerHelper('datetime', (format = 'full') => {
            const date = new Date();
            switch (format) {
                case 'date':
                    return date.toLocaleDateString();
                case 'time':
                    return date.toLocaleTimeString();
                case 'iso':
                    return date.toISOString();
                case 'full':
                default:
                    return date.toLocaleString();
            }
        });

        Handlebars.registerHelper('join', (array, separator = ', ') => {
            return Array.isArray(array) ? array.join(separator) : array;
        });

        Handlebars.registerHelper('count', (array) => {
            return Array.isArray(array) ? array.length : 0;
        });

        // Math operations
        Handlebars.registerHelper('math', (lvalue, operator, rvalue) => {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);

            return {
                '+': lvalue + rvalue,
                '-': lvalue - rvalue,
                '*': lvalue * rvalue,
                '/': lvalue / rvalue,
                '%': lvalue % rvalue
            }[operator];
        });
    }

    /**
     * Compile a template string into a reusable template function
     */
    public compile({ template, enableCache = true }: TemplateCompileOptions): HandlebarsTemplateDelegate {
        // If caching is enabled and we have the template cached, return it
        if (enableCache && this.templates.has(template)) {
            return this.templates.get(template)!;
        }

        // Otherwise, compile the template
        const compiledTemplate = Handlebars.compile(template, {
            noEscape: true, // Don't escape HTML entities - we're handling prompt text
            strict: true,   // Throw errors for missing variables
        });

        // Cache the template if caching is enabled
        if (enableCache) {
            this.templates.set(template, compiledTemplate);
        }

        return compiledTemplate;
    }

    /**
     * Render a template with the provided variables
     */
    public async render({ template, variables }: TemplateRenderOptions): Promise<string> {
        try {
            const compiledTemplate = this.compile({ template, enableCache: true });
            return compiledTemplate(variables || {});
        } catch (error: any) {
            console.error("Error rendering template:", error);
            throw new Error(`Failed to render template: ${error.message}`);
        }
    }

    /**
     * Validate a template to check for syntax errors and missing variables
     */
    public validate(template: string, exampleVariables?: Record<string, any>): TemplateValidationResult {
        const result: TemplateValidationResult = {
            isValid: true,
            errors: [],
            missingVariables: []
        };

        try {
            // Try to compile the template to catch syntax errors
            Handlebars.compile(template, {
                strict: true,
                knownHelpersOnly: false
            });

            // Find all variables and helpers used in the template
            const matches = template.match(/{{([^{}]+)}}/g) || [];
            const variableNames = new Set<string>();

            matches.forEach(match => {
                // Extract the variable name or helper between {{ and }}
                let content = match.substring(2, match.length - 2).trim();

                // Skip helpers and block expressions
                if (content.startsWith('#') || content.startsWith('/') || content.startsWith('>')) {
                    return;
                }

                // Handle expressions with parameters, like {{helper param1 param2}}
                const parts = content.split(/\s+/);

                // If it's a helper with parameters, check if it's one of our default helpers
                if (parts.length > 1 && this.defaultHelpers.includes(parts[0])) {
                    // It's a known helper, skip checking its parameters
                    return;
                }

                // Otherwise, treat first part as a variable name
                variableNames.add(parts[0]);
            });

            // If example variables are provided, check if any are missing
            if (exampleVariables) {
                for (const varName of variableNames) {
                    if (!(varName in exampleVariables)) {
                        result.missingVariables.push(varName);
                    }
                }
            }

            // If we found missing variables, mark as invalid
            if (result.missingVariables.length > 0) {
                result.isValid = false;
                result.errors.push(`Template requires variables that are not provided: ${result.missingVariables.join(', ')}`);
            }
        } catch (error: any) {
            result.isValid = false;
            result.errors.push(error.message);
        }

        return result;
    }

    /**
     * Extract variable names from a template
     */
    public extractVariables(template: string): string[] {
        const matches = template.match(/{{([^{}]+)}}/g) || [];
        const variableSet = new Set<string>();

        matches.forEach(match => {
            const content = match.substring(2, match.length - 2).trim();

            // Skip helpers and block expressions
            if (content.startsWith('#') || content.startsWith('/') || content.startsWith('>')) {
                return;
            }

            // Handle expressions with parameters
            const parts = content.split(/\s+/);

            // If it's a helper, skip it
            if (parts.length > 1 && this.defaultHelpers.includes(parts[0])) {
                return;
            }

            // Add the variable name (first part)
            variableSet.add(parts[0]);
        });

        return Array.from(variableSet);
    }

    /**
     * Clear the template cache
     */
    public clearCache(): void {
        this.templates.clear();
    }
}

// Export a singleton instance for app-wide use
export const promptTemplateEngine = new PromptTemplateEngine();

// Export interfaces and types for use elsewhere
export type {
    TemplateRenderOptions,
    TemplateCompileOptions,
    TemplateValidationResult
}; 