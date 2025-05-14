import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PromptTemplate, PromptVariable } from "@/utils/prompt-template-service";
import { promptTemplatesApi } from "@/api/prompt-templates";
import { ArrowLeft, ArrowRight, Check, Sparkles, Save, RefreshCw, Play } from "lucide-react";
import { VisualTemplateBuilder } from "./visual-template-builder";
import { TemplatePresetSelector } from "./template-preset-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptPreview } from "./prompt-preview";
import { Badge } from "@/components/ui/badge";

// Step schemas
const stepOneSchema = z.object({
    templateType: z.enum(["custom", "customer_support", "general_assistant", "creative_writing", "technical_support"]),
    usePreset: z.boolean().default(false),
    presetId: z.string().optional(),
});

const stepTwoSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(100),
    description: z.string().max(500).optional(),
    purpose: z.enum(["chat", "content_generation", "question_answering", "other"]),
    tags: z.array(z.string()).default([]),
});

const stepThreeSchema = z.object({
    content: z.string().min(10, "Template content must be at least 10 characters"),
    useSimpleEditor: z.boolean().default(true),
});

const stepFourSchema = z.object({
    aiModels: z.array(z.string()).min(1, "Select at least one AI model"),
    testMode: z.boolean().default(false),
});

interface WizardFormData {
    templateType: string;
    usePreset: boolean;
    presetId?: string;
    name: string;
    description?: string;
    purpose: string;
    tags: string[];
    content: string;
    useSimpleEditor: boolean;
    aiModels: string[];
    testMode: boolean;
    variables: PromptVariable[];
}

export function TemplateWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<WizardFormData>>({
        templateType: "custom",
        usePreset: false,
        name: "",
        description: "",
        purpose: "chat",
        tags: [],
        content: "",
        useSimpleEditor: true,
        aiModels: [],
        testMode: false,
        variables: []
    });
    const [extractedVariables, setExtractedVariables] = useState<PromptVariable[]>([]);
    const [testVariables, setTestVariables] = useState<Record<string, any>>({});
    const [testResult, setTestResult] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Create form for each step
    const stepOneForm = useForm<z.infer<typeof stepOneSchema>>({
        resolver: zodResolver(stepOneSchema),
        defaultValues: {
            templateType: formData.templateType as any || "custom",
            usePreset: formData.usePreset || false,
            presetId: formData.presetId,
        }
    });

    const stepTwoForm = useForm<z.infer<typeof stepTwoSchema>>({
        resolver: zodResolver(stepTwoSchema),
        defaultValues: {
            name: formData.name || "",
            description: formData.description || "",
            purpose: formData.purpose as any || "chat",
            tags: formData.tags || [],
        }
    });

    const stepThreeForm = useForm<z.infer<typeof stepThreeSchema>>({
        resolver: zodResolver(stepThreeSchema),
        defaultValues: {
            content: formData.content || "",
            useSimpleEditor: formData.useSimpleEditor || true,
        }
    });

    const stepFourForm = useForm<z.infer<typeof stepFourSchema>>({
        resolver: zodResolver(stepFourSchema),
        defaultValues: {
            aiModels: formData.aiModels || [],
            testMode: formData.testMode || false,
        }
    });

    const handleStepOneSubmit = (data: z.infer<typeof stepOneSchema>) => {
        setFormData(prev => ({ ...prev, ...data }));

        // If using preset, load preset content
        if (data.usePreset && data.presetId) {
            // Here you'd fetch the preset template
            // For now, just setting a sample content based on type
            const presetContent = getPresetContent(data.templateType);
            setFormData(prev => ({ ...prev, content: presetContent }));

            // Extract variables from preset
            extractVariablesFromContent(presetContent);
        }

        setCurrentStep(2);
    };

    const handleStepTwoSubmit = (data: z.infer<typeof stepTwoSchema>) => {
        setFormData(prev => ({ ...prev, ...data }));
        setCurrentStep(3);
    };

    const handleStepThreeSubmit = (data: z.infer<typeof stepThreeSchema>) => {
        setFormData(prev => ({ ...prev, ...data }));

        // Extract variables
        extractVariablesFromContent(data.content);

        setCurrentStep(4);
    };

    const handleStepFourSubmit = async (data: z.infer<typeof stepFourSchema>) => {
        setFormData(prev => ({ ...prev, ...data }));

        if (data.testMode) {
            await testTemplate();
            return;
        }

        await saveTemplate();
    };

    const extractVariablesFromContent = (content: string) => {
        // Simple regex to extract variables like {{variable_name}}
        const regex = /{{([^{}]+)}}/g;
        const matches = content.match(regex) || [];

        const uniqueVars = new Set<string>();
        matches.forEach(match => {
            // Clean up the variable name (remove {{ }}, handle helpers like {{var|uppercase}})
            let varName = match.replace(/{{|}}/g, '').trim();
            if (varName.includes('|')) {
                varName = varName.split('|')[0].trim();
            }

            if (varName && !varName.startsWith('#') && !varName.startsWith('/')) {
                uniqueVars.add(varName);
            }
        });

        // Create variable objects
        const variables: PromptVariable[] = Array.from(uniqueVars).map(name => ({
            name,
            type: "text",
            description: `Variable: ${name}`,
            defaultValue: "",
            required: true
        }));

        setExtractedVariables(variables);

        // Update form data with variables
        setFormData(prev => ({ ...prev, variables }));

        // Initialize test variables
        const newTestVars: Record<string, any> = {};
        variables.forEach(v => {
            newTestVars[v.name] = v.defaultValue || getDefaultValueForType(v.type);
        });
        setTestVariables(newTestVars);
    };

    const getDefaultValueForType = (type: string): any => {
        switch (type) {
            case "text": return "Sample text";
            case "number": return 42;
            case "boolean": return true;
            case "select": return "Option 1";
            default: return "";
        }
    };

    const getPresetContent = (templateType: string): string => {
        switch (templateType) {
            case "customer_support":
                return `You are a helpful customer service agent for {{company_name}}. 

When responding to customer inquiries:
1. Address the customer by name if available: "Hello {{customer_name}}!"
2. Be empathetic and understanding
3. Provide clear solutions using {{company_name}}'s policies
4. Always ask if the customer needs further assistance

{{#if previous_interaction}}
I see you've contacted us before about {{previous_topic}}. Let me help you further.
{{/if}}`;

            case "general_assistant":
                return `You are an AI assistant for {{company_name}}. Your primary goal is to be helpful, accurate, and concise.

When responding to user queries:
1. Be friendly but professional
2. Provide information based on {{knowledge_source}}
3. If you don't know something, admit it clearly
4. Keep responses concise and to the point

{{#if user_context}}
Based on your previous interactions, I'll tailor my response accordingly.
{{/if}}`;

            case "creative_writing":
                return `As a creative writing assistant, I'll help you craft engaging and imaginative content in the {{genre}} genre.

When creating content, I'll consider:
- The target audience ({{audience}})
- The desired tone ({{tone}})
- Any specific themes you've mentioned ({{themes}})

I'll aim to be creative, original, and avoid clichés while matching your specified style.`;

            case "technical_support":
                return `I'm a technical support specialist for {{product_name}} version {{product_version}}.

To help troubleshoot your issue with {{component_name}}:
1. I'll explain technical concepts clearly
2. Provide step-by-step instructions
3. Check if each step resolves the issue before proceeding
4. Suggest preventative measures for the future

{{#if error_code}}
I see you're experiencing error code {{error_code}}. Let me help you resolve this specific issue.
{{/if}}`;

            default:
                return `You are an AI assistant. 
        
Please respond to the following query: {{user_query}}

{{#if context}}
Consider this additional context: {{context}}
{{/if}}`;
        }
    };

    const testTemplate = async () => {
        setIsSubmitting(true);
        try {
            // Call preview API to test the template
            const response = await promptTemplatesApi.previewTemplate(
                formData.content || "",
                testVariables
            );

            setTestResult(response.data);

            toast({
                title: "Template preview generated",
                description: "Your template has been successfully tested."
            });
        } catch (error) {
            console.error("Error testing template:", error);
            toast({
                title: "Error testing template",
                description: "There was a problem generating the preview.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveTemplate = async () => {
        setIsSubmitting(true);
        try {
            // Prepare template data
            const templateData: Partial<PromptTemplate> = {
                name: formData.name || "",
                description: formData.description || "",
                content: formData.content || "",
                variables: formData.variables || [],
                metadata: {
                    tags: formData.tags || [],
                    aiModel: formData.aiModels || [],
                    activationRules: [],
                    creator: "current-user",
                    lastModified: new Date(),
                    version: 1
                }
            };

            // Save template
            await promptTemplatesApi.createTemplate(templateData as PromptTemplate);

            toast({
                title: "Template created",
                description: "Your template has been created successfully."
            });

            // Navigate back to template list
            navigate("/ai-configuration/prompt-templates");
        } catch (error) {
            console.error("Error saving template:", error);
            toast({
                title: "Error saving template",
                description: "There was a problem saving your template.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVariableUpdate = (name: string, value: any) => {
        setTestVariables(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBackButton = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate("/ai-configuration/prompt-templates");
        }
    };

    const renderProgressBar = () => {
        return (
            <div className="flex items-center mb-8">
                {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                        <div
                            className={`rounded-full h-10 w-10 flex items-center justify-center border-2 
                ${currentStep === step
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : currentStep > step
                                        ? "bg-primary/20 text-primary border-primary"
                                        : "bg-muted text-muted-foreground border-muted"}`}
                        >
                            {currentStep > step ? <Check className="h-5 w-5" /> : step}
                        </div>
                        {step < 4 && (
                            <div
                                className={`h-1 w-10 ${currentStep > step ? "bg-primary" : "bg-muted"
                                    }`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackButton}
                    className="mr-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">Create Prompt Template</h1>
            </div>

            {renderProgressBar()}

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>
                        {currentStep === 1 && "Choose Template Type"}
                        {currentStep === 2 && "Template Information"}
                        {currentStep === 3 && "Create Template Content"}
                        {currentStep === 4 && "Test & Finalize"}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 && "Select the type of template you want to create"}
                        {currentStep === 2 && "Add basic information about your template"}
                        {currentStep === 3 && "Craft your template content"}
                        {currentStep === 4 && "Test and save your template"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Step 1: Choose template type */}
                    {currentStep === 1 && (
                        <Form {...stepOneForm}>
                            <form onSubmit={stepOneForm.handleSubmit(handleStepOneSubmit)} className="space-y-6">
                                <FormField
                                    control={stepOneForm.control}
                                    name="templateType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Template Type</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select template type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="custom">Custom Template</SelectItem>
                                                    <SelectItem value="customer_support">Customer Support</SelectItem>
                                                    <SelectItem value="general_assistant">General Assistant</SelectItem>
                                                    <SelectItem value="creative_writing">Creative Writing</SelectItem>
                                                    <SelectItem value="technical_support">Technical Support</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Choose the category that best fits your template's purpose
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <TemplatePresetSelector
                                    templateType={stepOneForm.watch("templateType")}
                                    onPresetSelect={(presetId) => {
                                        stepOneForm.setValue("usePreset", true);
                                        stepOneForm.setValue("presetId", presetId);
                                    }}
                                />

                                <div className="flex justify-end">
                                    <Button type="submit">
                                        Next Step
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* Step 2: Template Information */}
                    {currentStep === 2 && (
                        <Form {...stepTwoForm}>
                            <form onSubmit={stepTwoForm.handleSubmit(handleStepTwoSubmit)} className="space-y-6">
                                <FormField
                                    control={stepTwoForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Template Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter a descriptive name" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                A clear name helps you identify this template later
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={stepTwoForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe what this template does"
                                                    {...field}
                                                    rows={3}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                A brief description of this template's purpose
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={stepTwoForm.control}
                                    name="purpose"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Purpose</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select purpose" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="chat">Chat Conversation</SelectItem>
                                                    <SelectItem value="content_generation">Content Generation</SelectItem>
                                                    <SelectItem value="question_answering">Question Answering</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                How this template will primarily be used
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={handleBackButton}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button type="submit">
                                        Next Step
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* Step 3: Template Content */}
                    {currentStep === 3 && (
                        <Form {...stepThreeForm}>
                            <form onSubmit={stepThreeForm.handleSubmit(handleStepThreeSubmit)} className="space-y-6">
                                <div className="mb-4">
                                    <Tabs
                                        defaultValue={stepThreeForm.watch("useSimpleEditor") ? "simple" : "advanced"}
                                        onValueChange={(value) => stepThreeForm.setValue("useSimpleEditor", value === "simple")}
                                    >
                                        <TabsList className="mb-2">
                                            <TabsTrigger value="simple">Simple Editor</TabsTrigger>
                                            <TabsTrigger value="advanced">Advanced Editor</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="simple">
                                            <FormField
                                                control={stepThreeForm.control}
                                                name="content"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <VisualTemplateBuilder
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                templateType={formData.templateType || "custom"}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Build your template using blocks and variables
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TabsContent>
                                        <TabsContent value="advanced">
                                            <FormField
                                                control={stepThreeForm.control}
                                                name="content"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                rows={12}
                                                                className="font-mono text-sm"
                                                                placeholder="Enter your template content with variables like {{variable_name}}"
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Use {'{{'} variable_name {'}}'}  syntax to define variables. Use {'{{'} #if condition {'}}'}...{'{{'}/if{'}}'}  for conditionals.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => extractVariablesFromContent(stepThreeForm.watch("content"))}
                                    className="mb-4"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Extract Variables
                                </Button>

                                {extractedVariables.length > 0 && (
                                    <div className="border rounded-md p-4 mb-4">
                                        <h3 className="font-medium mb-2">Detected Variables</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {extractedVariables.map((variable) => (
                                                <Badge key={variable.name} variant="outline">
                                                    {variable.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={handleBackButton}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button type="submit">
                                        Next Step
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* Step 4: Test & Finalize */}
                    {currentStep === 4 && (
                        <Form {...stepFourForm}>
                            <form onSubmit={stepFourForm.handleSubmit(handleStepFourSubmit)} className="space-y-6">
                                <FormField
                                    control={stepFourForm.control}
                                    name="aiModels"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Compatible AI Models</FormLabel>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="gpt-3.5-turbo"
                                                        checked={field.value.includes("gpt-3.5-turbo")}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                field.onChange([...field.value, "gpt-3.5-turbo"]);
                                                            } else {
                                                                field.onChange(field.value.filter(x => x !== "gpt-3.5-turbo"));
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="gpt-3.5-turbo">GPT-3.5 Turbo</label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="gpt-4"
                                                        checked={field.value.includes("gpt-4")}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                field.onChange([...field.value, "gpt-4"]);
                                                            } else {
                                                                field.onChange(field.value.filter(x => x !== "gpt-4"));
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="gpt-4">GPT-4</label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="claude-3"
                                                        checked={field.value.includes("claude-3")}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                field.onChange([...field.value, "claude-3"]);
                                                            } else {
                                                                field.onChange(field.value.filter(x => x !== "claude-3"));
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="claude-3">Claude 3</label>
                                                </div>
                                            </div>
                                            <FormDescription>
                                                Select which AI models this template is compatible with
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator className="my-4" />

                                <div className="space-y-4">
                                    <h3 className="font-medium">Test Your Template</h3>

                                    {extractedVariables.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium mb-2">Set Variable Values</h4>
                                                    <div className="space-y-3">
                                                        {extractedVariables.map((variable) => (
                                                            <div key={variable.name} className="space-y-1">
                                                                <label htmlFor={`var-${variable.name}`} className="text-sm font-medium">
                                                                    {variable.name}:
                                                                </label>
                                                                <Input
                                                                    id={`var-${variable.name}`}
                                                                    value={testVariables[variable.name] || ""}
                                                                    onChange={(e) => handleVariableUpdate(variable.name, e.target.value)}
                                                                    placeholder={`Value for ${variable.name}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-2">Preview</h4>
                                                    <div className="border rounded-md p-4 min-h-[200px] bg-muted/20">
                                                        {testResult ? (
                                                            <div className="whitespace-pre-wrap">{testResult}</div>
                                                        ) : (
                                                            <div className="text-muted-foreground italic">
                                                                Click "Test Template" to see a preview
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    stepFourForm.setValue("testMode", true);
                                                    stepFourForm.handleSubmit(handleStepFourSubmit)();
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting && stepFourForm.watch("testMode") ? (
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Play className="mr-2 h-4 w-4" />
                                                )}
                                                Test Template
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-muted-foreground">
                                            No variables detected in your template. You can still save it or go back to add variables.
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={handleBackButton}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        type="submit"
                                        onClick={() => stepFourForm.setValue("testMode", false)}
                                        disabled={isSubmitting && !stepFourForm.watch("testMode")}
                                    >
                                        {isSubmitting && !stepFourForm.watch("testMode") ? (
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Save Template
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 