import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PromptPreview } from "./prompt-preview";
import { PromptVariablesBuilder } from "./prompt-variables-builder";
import { AdvancedSettings } from "./advanced-settings";
import { AIAssistant } from "./ai-assistant";
import { PromptEditor } from "./prompt-editor";
import { PromptTemplate, PromptVariable, promptTemplateService } from "@/utils/prompt-template-service";
import { promptTemplateEngine } from "@/utils/prompt-template-engine";
import { promptTemplatesApi } from "@/api/prompt-templates";
import { Loader2, Save, ArrowLeft, Eye, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AdminLayout from "@/components/layouts/admin-layout";


// Import BuilderPromptVariable type to distinguish from service PromptVariable
import type { PromptVariable as BuilderPromptVariable } from "./prompt-variables-builder";

// Adapter functions to convert between service and builder variable types
function serviceToBuilderVariable(variable: PromptVariable): BuilderPromptVariable {
    return {
        ...variable,
        type: variable.type === 'date' ? 'text' :
            (variable.type as "text" | "number" | "boolean" | "select" | "context")
    };
}

function builderToServiceVariable(variable: BuilderPromptVariable): PromptVariable {
    return {
        name: variable.name || "unnamed_variable",
        type: variable.type === 'context' ? 'text' :
            (variable.type as "text" | "number" | "boolean" | "select" | "date"),
        description: variable.description || "", // Ensure description is never undefined
        defaultValue: variable.defaultValue || null,
        options: variable.options || [],
        required: variable.required ?? false
    } as PromptVariable;
}

// Add array conversion helpers
function serviceToBuilderVariables(variables: PromptVariable[] = []): BuilderPromptVariable[] {
    return variables.map(serviceToBuilderVariable);
}

// This function is used in handleReorderVariables
function builderToServiceVariables(variables: BuilderPromptVariable[] = []): PromptVariable[] {
    return variables.map(builderToServiceVariable);
}

// Form validation schema
const formSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(100),
    description: z.string().max(500).optional(),
    content: z.string().min(10, { message: "Template content must be at least 10 characters" }),
    variables: z.array(
        z.object({
            name: z.string().min(1),
            type: z.enum(["text", "number", "boolean", "select", "context"]),
            description: z.string().optional(),
            defaultValue: z.any().optional(),
            options: z.array(z.any()).optional(),
            required: z.boolean().default(false),
        })
    ).default([]),
    metadata: z.object({
        tags: z.array(z.string()).default([]),
        aiModel: z.array(z.string()).default([]),
        activationRules: z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                condition: z.string(),
                priority: z.number(),
                isActive: z.boolean(),
            })
        ).default([]),
        creator: z.string().optional(),
        lastModified: z.date().optional(),
        version: z.number().default(1),
    }).default({}),
});

type TemplateFormValues = z.infer<typeof formSchema>;

interface TemplateFormProps {
    initialTemplate?: Partial<PromptTemplate>;
    isEditing?: boolean;
}

// Utility function to ensure variables conform to PromptVariable interface
function ensureValidVariables(variables: any[] = []): PromptVariable[] {
    return variables.map(variable => {
        // Ensure each variable has required fields and convert incompatible types to text
        const varType = variable.type || "text";
        // Convert both 'date' and 'context' types to 'text' to match PromptVariable interface
        const compatibleType = (varType === 'date' || varType === 'context')
            ? 'text'
            : (varType as "text" | "number" | "boolean" | "select");

        // Create a valid PromptVariable with all required fields
        return {
            name: variable.name || "unnamed_variable",
            type: compatibleType,
            description: variable.description || "", // Ensure description is never undefined
            defaultValue: variable.defaultValue || null,
            options: variable.options || [],
            required: variable.required ?? false
        } as PromptVariable; // Use type assertion to ensure TypeScript recognizes this as a valid PromptVariable
    });
}

export function TemplateForm({ initialTemplate, isEditing = false }: TemplateFormProps) {
    const [activeTab, setActiveTab] = useState("editor");
    const [testVariables, setTestVariables] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [template, setTemplate] = useState<Partial<PromptTemplate> | null>(
        initialTemplate ? {
            ...initialTemplate,
            variables: initialTemplate.variables ? ensureValidVariables(initialTemplate.variables) : []
        } : null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();

    // Load template data if in editing mode and no initialTemplate was provided
    useEffect(() => {
        async function loadTemplate() {
            if (!id || !isEditing) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await promptTemplatesApi.getTemplateById(id);
                // Ensure variables have required fields
                const templateData = response.data;
                templateData.variables = ensureValidVariables(templateData.variables);
                setTemplate(templateData);
            } catch (err) {
                console.error("Failed to load template:", err);
                setError("Failed to load the template. It may have been deleted or you don't have permission to view it.");
            } finally {
                setIsLoading(false);
            }
        }

        if (!initialTemplate && isEditing) {
            loadTemplate();
        }
    }, [id, isEditing, initialTemplate]);

    // Initialize form with default values or provided template
    const form = useForm<TemplateFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: template?.name || "",
            description: template?.description || "",
            content: template?.content || "",
            variables: ensureValidVariables(template?.variables || []) as any,
            metadata: {
                tags: template?.metadata?.tags || [],
                aiModel: template?.metadata?.aiModel || [],
                activationRules: template?.metadata?.activationRules || [],
                creator: template?.metadata?.creator || "current-user",
                lastModified: template?.metadata?.lastModified || new Date(),
                version: template?.metadata?.version || 1,
            },
        },
    });

    // Update form when template is loaded
    useEffect(() => {
        if (template) {
            form.reset({
                name: template.name || "",
                description: template.description || "",
                content: template.content || "",
                variables: ensureValidVariables(template.variables || []).map(v => ({
                    ...v,
                    // Convert 'date' type to 'text' to fix incompatibility
                    type: v.type === 'date' ? 'text' :
                        (v.type as "text" | "number" | "boolean" | "select" | "context")
                })),
                metadata: {
                    tags: template.metadata?.tags || [],
                    aiModel: template.metadata?.aiModel || [],
                    activationRules: template.metadata?.activationRules || [],
                    creator: template.metadata?.creator || "current-user",
                    lastModified: template.metadata?.lastModified || new Date(),
                    version: template.metadata?.version || 1,
                },
            });
        }
    }, [template, form]);

    const watchContent = form.watch("content");
    const watchVariables = form.watch("variables");

    // Update test variables when variables change
    useEffect(() => {
        const newTestVariables: Record<string, any> = {};

        watchVariables.forEach(variable => {
            if (variable.name) {
                newTestVariables[variable.name] = variable.defaultValue !== undefined
                    ? variable.defaultValue
                    : getDefaultValueForType(variable.type);
            }
        });

        setTestVariables(newTestVariables);
    }, [watchVariables]);

    // Get default value based on variable type
    const getDefaultValueForType = (type: string): any => {
        switch (type) {
            case "text":
                return "Sample text";
            case "number":
                return 42;
            case "boolean":
                return true;
            case "select":
                return "Option 1";
            case "context":
                return {
                    user: {
                        name: "John Doe",
                        email: "john@example.com"
                    },
                    conversation: {
                        history: ["Hello, how can I help you?", "I need information about your services"]
                    }
                };
            default:
                return "";
        }
    };

    const validateTemplate = () => {
        const validationResult = promptTemplateEngine.validate(watchContent, testVariables);
        setValidationErrors(validationResult.errors);
        return validationResult.isValid;
    };

    // Function to handle reordering variables
    const handleReorderVariables = (newVariables: any[]) => {
        form.setValue("variables", builderToServiceVariables(newVariables) as any);
    };

    const handleAiSuggestion = (suggestedTemplate: string) => {
        form.setValue("content", suggestedTemplate);
    };

    const handleUpdateTestVariable = (name: string, value: any) => {
        setTestVariables(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateTemplate = (updates: Partial<TemplateFormValues>) => {
        if (updates.content !== undefined) {
            form.setValue("content", updates.content);
        }

        if (updates.metadata !== undefined) {
            form.setValue("metadata", {
                ...form.getValues("metadata"),
                ...updates.metadata
            });
        }

        // Ensure variables are valid if provided
        if (updates.variables !== undefined) {
            form.setValue("variables", ensureValidVariables(updates.variables).map(v => ({
                ...v,
                type: v.type === 'date' ? 'text' :
                    (v.type as "text" | "number" | "boolean" | "select" | "context")
            })));
        }
    };

    // Extract variable names from template content
    const extractVariablesFromTemplate = () => {
        const variableNames = promptTemplateEngine.extractVariables(watchContent);

        // Check for variables in content that aren't defined in variables array
        const existingVarNames = new Set(watchVariables.map(v => v.name));
        const newVariables: PromptVariable[] = [];

        variableNames.forEach(name => {
            if (!existingVarNames.has(name)) {
                newVariables.push({
                    name,
                    type: "text",
                    description: "",
                    defaultValue: "Sample value",
                    required: true
                });
            }
        });

        if (newVariables.length > 0) {
            // Convert to builder variables before setting
            form.setValue("variables", [...watchVariables, ...newVariables].map(v => ({
                ...v,
                type: v.type === 'date' ? 'text' :
                    (v.type as "text" | "number" | "boolean" | "select" | "context")
            })));

            toast({
                title: "Variables detected",
                description: `Added ${newVariables.length} new variable${newVariables.length > 1 ? 's' : ''} found in your template.`,
            });
        }
    };

    const onSubmit = async (data: TemplateFormValues) => {
        if (!validateTemplate()) {
            toast({
                title: "Template validation failed",
                description: "Please fix the errors in your template before saving.",
                variant: "destructive"
            });
            setActiveTab("editor");
            return;
        }

        setIsSubmitting(true);

        try {
            // Update lastModified timestamp
            data.metadata.lastModified = new Date();

            // Ensure all variables are valid before submission
            data.variables = ensureValidVariables(data.variables).map(v => ({
                ...v,
                type: v.type === 'date' ? 'text' :
                    (v.type as "text" | "number" | "boolean" | "select" | "context")
            }));

            if (isEditing && id) {
                // Update existing template
                await promptTemplatesApi.updateTemplate(id, data as unknown as PromptTemplate);
                toast({
                    title: "Template updated",
                    description: "Your template has been updated successfully.",
                });
            } else {
                // Create new template
                await promptTemplatesApi.createTemplate(data as unknown as PromptTemplate);
                toast({
                    title: "Template created",
                    description: "Your new template has been created successfully.",
                });
            }

            // Redirect to templates list
            navigate("/ai-configuration/prompt-templates");
        } catch (error) {
            console.error("Error saving template:", error);
            toast({
                title: "Error saving template",
                description: "An error occurred while saving the template. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/ai-configuration/prompt-templates")}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">Loading template...</h1>
                    </div>
                    <Card className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/ai-configuration/prompt-templates")}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">Error</h1>
                    </div>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error loading template</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button onClick={() => navigate("/ai-configuration/prompt-templates")}>
                        Back to Templates
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/ai-configuration/prompt-templates")}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">
                            {isEditing ? "Edit Prompt Template" : "Create Prompt Template"}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab("preview")}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {isEditing ? "Update Template" : "Save Template"}
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Template Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter template name" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormDescription>
                                                A descriptive name for your prompt template.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Describe what this template does" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormDescription>
                                                Brief description of this template's purpose and use cases.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            <TabsList className="grid grid-cols-3">
                                <TabsTrigger value="editor">Template Editor</TabsTrigger>
                                <TabsTrigger value="variables">Variables</TabsTrigger>
                                <TabsTrigger value="preview">Preview & Test</TabsTrigger>
                            </TabsList>

                            <TabsContent value="editor" className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-2">
                                        <PromptEditor
                                            templateId={id}
                                            onUpdateTemplate={(content) => form.setValue("content", content)}
                                            variables={ensureValidVariables(watchVariables)}
                                            onExtractVariables={extractVariablesFromTemplate}
                                        />

                                        {validationErrors.length > 0 && (
                                            <Alert variant="destructive" className="mt-4">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Template Error</AlertTitle>
                                                <AlertDescription>
                                                    <ul className="list-disc pl-4 mt-2">
                                                        {validationErrors.map((error, index) => (
                                                            <li key={index}>{error}</li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div>
                                        <AIAssistant
                                            currentTemplate={watchContent}
                                            onApplySuggestion={handleAiSuggestion}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="variables" className="space-y-4">
                                <PromptVariablesBuilder
                                    variables={serviceToBuilderVariables(watchVariables as any[])}
                                    onChange={(newVars) => handleReorderVariables(newVars as any)}
                                    disabled={isLoading}
                                />
                            </TabsContent>

                            <TabsContent value="preview" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Test Variables</h3>
                                        <div className="space-y-4">
                                            {watchVariables.length === 0 ? (
                                                <p className="text-muted-foreground">
                                                    No variables defined. Add variables in the Variables tab.
                                                </p>
                                            ) : (
                                                watchVariables.map((variable) => (
                                                    <div key={variable.name} className="space-y-2">
                                                        <FormLabel htmlFor={`test-${variable.name}`}>
                                                            {variable.name}
                                                            {variable.required && <span className="text-destructive ml-1">*</span>}
                                                        </FormLabel>
                                                        {variable.description && (
                                                            <p className="text-xs text-muted-foreground">{variable.description}</p>
                                                        )}
                                                        <div>
                                                            {variable.type === "text" && (
                                                                <Input
                                                                    id={`test-${variable.name}`}
                                                                    value={testVariables[variable.name] || ""}
                                                                    onChange={(e) => handleUpdateTestVariable(variable.name, e.target.value)}
                                                                />
                                                            )}
                                                            {variable.type === "number" && (
                                                                <Input
                                                                    id={`test-${variable.name}`}
                                                                    type="number"
                                                                    value={testVariables[variable.name] || 0}
                                                                    onChange={(e) => handleUpdateTestVariable(variable.name, parseFloat(e.target.value))}
                                                                />
                                                            )}
                                                            {variable.type === "boolean" && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Input
                                                                        id={`test-${variable.name}`}
                                                                        type="checkbox"
                                                                        className="h-4 w-4"
                                                                        checked={!!testVariables[variable.name]}
                                                                        onChange={(e) => handleUpdateTestVariable(variable.name, e.target.checked)}
                                                                    />
                                                                    <label htmlFor={`test-${variable.name}`}>
                                                                        {testVariables[variable.name] ? "True" : "False"}
                                                                    </label>
                                                                </div>
                                                            )}
                                                            {variable.type === "select" && variable.options && (
                                                                <select
                                                                    id={`test-${variable.name}`}
                                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    value={testVariables[variable.name] || ""}
                                                                    onChange={(e) => handleUpdateTestVariable(variable.name, e.target.value)}
                                                                >
                                                                    {variable.options.map((option) => (
                                                                        <option key={option} value={option}>
                                                                            {option}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                            {variable.type === "context" && (
                                                                <Textarea
                                                                    id={`test-${variable.name}`}
                                                                    className="font-mono text-xs"
                                                                    value={typeof testVariables[variable.name] === 'object'
                                                                        ? JSON.stringify(testVariables[variable.name], null, 2)
                                                                        : testVariables[variable.name] || ""}
                                                                    onChange={(e) => {
                                                                        try {
                                                                            const value = JSON.parse(e.target.value);
                                                                            handleUpdateTestVariable(variable.name, value);
                                                                        } catch (err) {
                                                                            handleUpdateTestVariable(variable.name, e.target.value);
                                                                        }
                                                                    }}
                                                                    rows={4}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Rendered Output</h3>
                                        <PromptPreview
                                            templateContent={watchContent}
                                            variables={testVariables}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <AdvancedSettings
                            template={{
                                ...form.getValues(),
                                variables: ensureValidVariables(form.getValues().variables),
                                // Ensure metadata has required fields
                                metadata: {
                                    creator: form.getValues().metadata?.creator || "current-user",
                                    lastModified: form.getValues().metadata?.lastModified || new Date(),
                                    version: form.getValues().metadata?.version || 1,
                                    tags: form.getValues().metadata?.tags || [],
                                    aiModel: form.getValues().metadata?.aiModel || [],
                                    activationRules: (form.getValues().metadata?.activationRules || []).map(rule => ({
                                        id: rule.id || "",
                                        name: rule.name || "",
                                        condition: rule.condition || "",
                                        priority: rule.priority || 0,
                                        isActive: rule.isActive || false,
                                        type: "custom" // Add missing type property
                                    }))
                                }
                            }}
                            onTemplateChange={handleUpdateTemplate as any}
                        />
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
}