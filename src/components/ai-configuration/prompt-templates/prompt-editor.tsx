import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Play, Copy, Wand2 } from "lucide-react";
import { promptTemplateService } from "@/utils/prompt-template-service";
import { PromptVariablesBuilder } from "./prompt-variables-builder";
import { PromptPreview } from "./prompt-preview";
import { AIAssistant } from "./ai-assistant";
import { PromptVariable } from "@/utils/prompt-template-service";
import { CodeEditor } from "@/components/ai-configuration/code-editor";
import type { PromptVariable as BuilderPromptVariable } from "./prompt-variables-builder";

// Form schema for prompt template
const promptTemplateSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    content: z.string().min(10, "Template content must be at least 10 characters"),
    variables: z.array(
        z.object({
            name: z.string().min(1),
            type: z.enum(["text", "number", "boolean", "select", "context"]),
            description: z.string().optional(),
            defaultValue: z.any().optional(),
            options: z.array(z.any()).optional(),
            required: z.boolean().default(false)
        })
    ).default([]),
    metadata: z.object({
        aiModel: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        activationRules: z.array(z.any()).default([])
    }).default({
        aiModel: [],
        tags: [],
        activationRules: []
    }),
    tenantId: z.string().optional()
});

type PromptTemplateFormValues = z.infer<typeof promptTemplateSchema>;

// Utility function to ensure variables conform to PromptVariable interface
function ensureValidVariables(variables: any[] = []): PromptVariable[] {
    return variables.map(variable => {
        // Ensure each variable has required fields
        const validVariable: PromptVariable = {
            name: variable.name || "unnamed_variable",
            type: variable.type || "text",
            description: variable.description || "",
            defaultValue: variable.defaultValue,
            options: variable.options,
            required: typeof variable.required === 'boolean' ? variable.required : false
        };
        return validVariable;
    });
}

// Adapter functions to convert between service and builder variable types
function serviceToBuilderVariable(variable: any): BuilderPromptVariable {
    return {
        name: variable.name || "unnamed_variable",
        type: (variable.type === 'date' ? 'text' :
            (variable.type || 'text')) as "text" | "number" | "boolean" | "select" | "context",
        description: variable.description || "",
        defaultValue: variable.defaultValue,
        options: variable.options,
        required: typeof variable.required === 'boolean' ? variable.required : false
    };
}

function builderToServiceVariable(variable: any): PromptVariable {
    return {
        name: variable.name || "unnamed_variable",
        type: (variable.type === 'context' ? 'text' :
            (variable.type || 'text')) as "text" | "number" | "boolean" | "select" | "date",
        description: variable.description || "",
        defaultValue: variable.defaultValue,
        options: variable.options,
        required: typeof variable.required === 'boolean' ? variable.required : false
    };
}

// Add array conversion helpers
function serviceToBuilderVariables(variables: any[] = []): BuilderPromptVariable[] {
    return variables.map(serviceToBuilderVariable);
}

function builderToServiceVariables(variables: any[] = []): PromptVariable[] {
    return variables.map(builderToServiceVariable);
}

interface PromptEditorProps {
    templateId?: string;
    onSave?: (templateId: string) => void;
    initialValues?: Partial<PromptTemplateFormValues>;
    // Additional props for template-form.tsx integration
    onUpdateTemplate?: (content: string) => void;
    variables?: PromptVariable[];
    onExtractVariables?: () => void;
}

export function PromptEditor({
    templateId,
    onSave,
    initialValues,
    onUpdateTemplate,
    onExtractVariables
}: PromptEditorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("editor");
    const [previewData, setPreviewData] = useState<Record<string, any>>({});
    const { toast } = useToast();

    // Mock test values for variables
    const [testValues, setTestValues] = useState<Record<string, any>>({});

    const form = useForm<PromptTemplateFormValues>({
        resolver: zodResolver(promptTemplateSchema),
        defaultValues: initialValues || {
            name: "",
            description: "",
            content: "",
            variables: [],
            metadata: {
                aiModel: [],
                tags: [],
                activationRules: []
            }
        }
    });

    // Load existing template data if editing
    useEffect(() => {
        const loadTemplate = async () => {
            if (!templateId) return;

            setIsLoading(true);
            try {
                const response = await promptTemplateService.getTemplate(templateId);
                const template = response.data;

                form.reset({
                    name: template.name,
                    description: template.description,
                    content: template.content,
                    variables: template.variables.map(variable => ({
                        name: variable.name,
                        type: variable.type === 'date' ? 'text' :
                            (variable.type as "text" | "number" | "boolean" | "select" | "context"),
                        description: variable.description,
                        defaultValue: variable.defaultValue,
                        options: variable.options,
                        required: variable.required
                    })),
                    metadata: template.metadata
                });

                // Generate test values from variables
                const initialTestValues: Record<string, any> = {};
                template.variables.forEach(variable => {
                    initialTestValues[variable.name] = variable.defaultValue ||
                        (variable.type === 'boolean' ? false :
                            variable.type === 'number' ? 0 :
                                variable.type === 'select' && variable.options?.length ? variable.options[0] : '');
                });
                setTestValues(initialTestValues);

            } catch (error) {
                console.error("Error loading template:", error);
                toast({
                    title: "Error loading template",
                    description: "Could not load the template. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (templateId) {
            loadTemplate();
        }
    }, [templateId, form, toast]);

    // Update previewData whenever testValues change
    useEffect(() => {
        setPreviewData({ ...testValues });
    }, [testValues]);

    const onSubmit = async (values: PromptTemplateFormValues) => {
        setIsLoading(true);

        try {
            // Ensure variables are valid before submission
            const validatedValues = {
                ...values,
                variables: ensureValidVariables(values.variables),
                name: values.name || "Untitled Template", // Ensure name is not optional
                content: values.content || "", // Ensure content is not optional
                tenantId: values.tenantId || "default", // Provide default tenantId
                metadata: {
                    creator: "current-user",
                    lastModified: new Date(),
                    version: 1,
                    tags: values.metadata?.tags || [],
                    aiModel: values.metadata?.aiModel || [],
                    activationRules: values.metadata?.activationRules || []
                }
            };

            let response: { data: { id: string } };
            if (templateId) {
                response = await promptTemplateService.updateTemplate(templateId, {
                    ...validatedValues,
                    description: validatedValues.description || ''
                });
            } else {
                response = await promptTemplateService.createTemplate({
                    ...validatedValues,
                    description: validatedValues.description || ''
                });
            }

            toast({
                title: templateId ? "Template updated" : "Template created",
                description: `Template "${values.name}" has been ${templateId ? "updated" : "saved"} successfully.`
            });

            if (onSave) {
                onSave(response.data.id);
            }
        } catch (error) {
            console.error("Error saving template:", error);
            toast({
                title: "Error saving template",
                description: "Could not save the template. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloneTemplate = () => {
        const currentValues = form.getValues();
        form.reset({
            ...currentValues,
            name: `${currentValues.name} (Copy)`,
        });

        toast({
            title: "Template cloned",
            description: "You're now working on a copy of the template."
        });
    };

    const handleTestValueChange = (variable: string, value: any) => {
        setTestValues(prev => ({
            ...prev,
            [variable]: value
        }));
    };

    return (
        <div className="space-y-4">
            <Form {...form}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter template name"
                                        {...field}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end items-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloneTemplate}
                            disabled={isLoading}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                        </Button>
                        <Button
                            type="button"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            Save Template
                        </Button>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="mb-4">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter template description"
                                    {...field}
                                    disabled={isLoading}
                                    rows={2}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="editor">Template Editor</TabsTrigger>
                        <TabsTrigger value="variables">Variables</TabsTrigger>
                        <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
                        <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
                    </TabsList>

                    <TabsContent value="editor" className="space-y-4">
                        <ResizablePanelGroup direction="horizontal" className="min-h-[500px] border rounded-md">
                            <ResizablePanel defaultSize={50}>
                                <div className="h-full p-4">
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem className="h-full flex flex-col">
                                                <div className="flex justify-between items-center mb-2">
                                                    <FormLabel>Template Content</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (onExtractVariables) {
                                                                    onExtractVariables();
                                                                }
                                                            }}
                                                        >
                                                            Extract Variables
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setActiveTab("assistant")}
                                                        >
                                                            <Wand2 className="h-4 w-4 mr-2" />
                                                            AI Help
                                                        </Button>
                                                    </div>
                                                </div>
                                                <FormControl className="flex-1">
                                                    <CodeEditor
                                                        value={field.value}
                                                        onChange={(value) => {
                                                            field.onChange(value);
                                                            if (onUpdateTemplate) {
                                                                onUpdateTemplate(value);
                                                            }
                                                        }}
                                                        language="handlebars"
                                                        placeholder="Enter your prompt template..."
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </ResizablePanel>

                            <ResizablePanel defaultSize={50}>
                                <div className="h-full flex flex-col">
                                    <div className="border-b p-3 flex justify-between items-center bg-muted/50">
                                        <h3 className="text-sm font-medium">Preview</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPreviewData({ ...testValues })}
                                        >
                                            <Play className="h-3 w-3 mr-2" />
                                            Refresh
                                        </Button>
                                    </div>
                                    <ScrollArea className="flex-1 p-4">
                                        <PromptPreview
                                            templateContent={form.watch("content")}
                                            variables={previewData}
                                        />
                                    </ScrollArea>

                                    <Card className="m-3 border">
                                        <div className="p-3 border-b bg-muted/50">
                                            <h3 className="text-sm font-medium">Test Values</h3>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            {form.watch("variables").map((variable, index) => (
                                                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                                                    <div className="text-sm font-medium">{variable.name}:</div>
                                                    <div className="col-span-2">
                                                        <Input
                                                            value={testValues[variable.name] || ''}
                                                            onChange={(e) => handleTestValueChange(variable.name, e.target.value)}
                                                            placeholder={`Test value for ${variable.name}`}
                                                            type={variable.type === 'number' ? 'number' : 'text'}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {form.watch("variables").length === 0 && (
                                                <div className="text-sm text-muted-foreground">
                                                    No variables defined yet. Add variables in the Variables tab.
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </TabsContent>

                    <TabsContent value="variables">
                        <PromptVariablesBuilder
                            variables={serviceToBuilderVariables(form.watch("variables") as any[])}
                            onChange={(newVars: any) => form.setValue("variables", builderToServiceVariables(newVars) as any)}
                            disabled={isLoading}
                        />
                    </TabsContent>

                    <TabsContent value="settings">
                        <div className="space-y-4">
                            <Card className="p-4">
                                <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
                                {/* Settings content - to be implemented */}
                                <div className="text-sm text-muted-foreground">
                                    Advanced settings like AI model compatibility, activation rules, and tags will be implemented here.
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="assistant">
                        <AIAssistant
                            currentTemplate={form.watch("content")}
                            onApplySuggestion={(suggestion) => {
                                form.setValue("content", suggestion);
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </Form>
        </div>
    );
}