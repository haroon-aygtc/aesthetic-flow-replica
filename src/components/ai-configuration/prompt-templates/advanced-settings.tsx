import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertCircle,
    Plus,
    Trash,
    ChevronUp,
    ChevronDown,
    Info,
    RefreshCw,
    Loader2,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActivationRule, PromptTemplate } from "@/utils/prompt-template-service";
import { aiModelService } from "@/utils/ai-model-service";
import { useToast } from "@/components/ui/use-toast";

interface AdvancedSettingsProps {
    template: Partial<PromptTemplate>;
    onTemplateChange: (template: Partial<PromptTemplate>) => void;
    disabled?: boolean;
}

interface AIModelOption {
    id: string;
    name: string;
    provider: string;
}

const CONDITION_OPERATORS = [
    { value: "equals", label: "Equals" },
    { value: "notEquals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Not Contains" },
    { value: "startsWith", label: "Starts With" },
    { value: "endsWith", label: "Ends With" },
    { value: "greaterThan", label: "Greater Than" },
    { value: "lessThan", label: "Less Than" },
    { value: "regex", label: "Regex Match" }
];

const CONDITION_SUBJECTS = [
    { value: "user_query", label: "User Query" },
    { value: "conversation_context", label: "Conversation Context" },
    { value: "user_data", label: "User Data" },
    { value: "widget_id", label: "Widget ID" },
    { value: "url", label: "Current URL" },
    { value: "time", label: "Time of Day" },
    { value: "date", label: "Current Date" },
    { value: "custom", label: "Custom Variable" }
];

export function AdvancedSettings({
    template,
    onTemplateChange,
    disabled = false
}: AdvancedSettingsProps) {
    const [activeTab, setActiveTab] = useState("models");
    const [customTag, setCustomTag] = useState("");
    const [availableModels, setAvailableModels] = useState<AIModelOption[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const { toast } = useToast();

    // Create default metadata if not provided
    useEffect(() => {
        if (!template.metadata) {
            onTemplateChange({
                ...template,
                metadata: {
                    tags: [],
                    aiModel: [],
                    activationRules: [],
                    creator: "current-user",
                    lastModified: new Date(),
                    version: 1
                }
            });
        }
    }, [template, onTemplateChange]);

    // Fetch available AI models from the database
    useEffect(() => {
        async function fetchModels() {
            setIsLoadingModels(true);
            try {
                const models = await aiModelService.getModels();

                // Transform the models into the format we need
                const modelOptions: AIModelOption[] = models.map(model => ({
                    id: model.provider + (model.settings?.model_name ? `-${model.settings.model_name}` : ''),
                    name: model.name,
                    provider: model.provider
                }));

                setAvailableModels(modelOptions);
            } catch (error) {
                console.error("Failed to load AI models:", error);
                toast({
                    title: "Error loading models",
                    description: "Could not load AI models from the database. Using default settings.",
                    variant: "destructive"
                });
                // Set some default models as fallback
                setAvailableModels([
                    { id: "openai-gpt-4", name: "GPT-4", provider: "OpenAI" },
                    { id: "openai-gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
                    { id: "anthropic-claude-3", name: "Claude 3", provider: "Anthropic" }
                ]);
            } finally {
                setIsLoadingModels(false);
            }
        }

        fetchModels();
    }, [toast]);

    const handleModelChange = (modelId: string, checked: boolean) => {
        if (!template.metadata) return;

        const currentModels = [...(template.metadata.aiModel || [])];

        if (checked && !currentModels.includes(modelId)) {
            onTemplateChange({
                ...template,
                metadata: {
                    ...template.metadata,
                    aiModel: [...currentModels, modelId]
                }
            });
        } else if (!checked && currentModels.includes(modelId)) {
            onTemplateChange({
                ...template,
                metadata: {
                    ...template.metadata,
                    aiModel: currentModels.filter(m => m !== modelId)
                }
            });
        }
    };

    const handleAddTag = () => {
        if (!customTag.trim() || !template.metadata) return;

        if (!template.metadata.tags.includes(customTag.trim())) {
            onTemplateChange({
                ...template,
                metadata: {
                    ...template.metadata,
                    tags: [...template.metadata.tags, customTag.trim()]
                }
            });
        }

        setCustomTag("");
    };

    const handleRemoveTag = (tag: string) => {
        if (!template.metadata) return;

        onTemplateChange({
            ...template,
            metadata: {
                ...template.metadata,
                tags: template.metadata.tags.filter(t => t !== tag)
            }
        });
    };

    const handleAddActivationRule = () => {
        if (!template.metadata) return;

        const newRule: ActivationRule = {
            id: crypto.randomUUID(),
            condition: "user_query equals ''",
            priority: template.metadata.activationRules.length + 1,
            isActive: true,
            type: "url_pattern"
        };

        onTemplateChange({
            ...template,
            metadata: {
                ...template.metadata,
                activationRules: [...template.metadata.activationRules, newRule]
            }
        });
    };

    const handleUpdateActivationRule = (ruleId: string, updates: Partial<ActivationRule>) => {
        if (!template.metadata) return;

        const updatedRules = template.metadata.activationRules.map(rule =>
            rule.id === ruleId ? { ...rule, ...updates } : rule
        );

        onTemplateChange({
            ...template,
            metadata: {
                ...template.metadata,
                activationRules: updatedRules
            }
        });
    };

    const handleRemoveActivationRule = (ruleId: string) => {
        if (!template.metadata) return;

        onTemplateChange({
            ...template,
            metadata: {
                ...template.metadata,
                activationRules: template.metadata.activationRules.filter(rule => rule.id !== ruleId)
            }
        });
    };

    const handleMovePriority = (ruleId: string, direction: 'up' | 'down') => {
        if (!template.metadata) return;

        const rules = [...template.metadata.activationRules];
        const index = rules.findIndex(rule => rule.id === ruleId);

        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            // Swap with previous rule
            [rules[index - 1], rules[index]] = [rules[index], rules[index - 1]];

            // Update priorities
            rules[index].priority = index + 1;
            rules[index - 1].priority = index;
        } else if (direction === 'down' && index < rules.length - 1) {
            // Swap with next rule
            [rules[index], rules[index + 1]] = [rules[index + 1], rules[index]];

            // Update priorities
            rules[index].priority = index + 1;
            rules[index + 1].priority = index + 2;
        }

        onTemplateChange({
            ...template,
            metadata: {
                ...template.metadata,
                activationRules: rules
            }
        });
    };

    // Ensure metadata exists for rendering
    const metadata = template.metadata || {
        tags: [],
        aiModel: [],
        activationRules: [],
        creator: "",
        lastModified: new Date(),
        version: 1
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="models">Model Compatibility</TabsTrigger>
                        <TabsTrigger value="tags">Tags</TabsTrigger>
                        <TabsTrigger value="activation">Activation Rules</TabsTrigger>
                    </TabsList>

                    <TabsContent value="models" className="space-y-4">
                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">
                                Select which AI models this template is compatible with. The template will only be available for use with the selected models.
                            </p>
                        </div>

                        {isLoadingModels ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Loading AI models...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableModels.length > 0 ? (
                                    availableModels.map(model => (
                                        <div
                                            key={model.id}
                                            className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                id={`model-${model.id}`}
                                                checked={metadata.aiModel.includes(model.id)}
                                                onCheckedChange={(checked) =>
                                                    handleModelChange(model.id, checked as boolean)
                                                }
                                                disabled={disabled}
                                            />
                                            <div className="flex flex-col">
                                                <label
                                                    htmlFor={`model-${model.id}`}
                                                    className="text-sm font-medium cursor-pointer"
                                                >
                                                    {model.name}
                                                </label>
                                                <span className="text-xs text-muted-foreground">
                                                    {model.provider}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                                        No AI models found. Please add models in the AI Model Manager.
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {metadata.aiModel.length === 0 && (
                        <div className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-md p-3 text-sm flex items-start mt-4">
                            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">No models selected</p>
                                <p className="mt-1">This template won't be available for use until you select at least one compatible model.</p>
                            </div>
                        </div>
                    )}
             

                <TabsContent value="tags" className="space-y-4">
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">
                            Add tags to categorize this template and make it easier to find.
                        </p>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Add a tag..."
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                disabled={disabled}
                            />
                        </div>
                        <Button
                            onClick={handleAddTag}
                            disabled={!customTag.trim() || disabled}
                        >
                            Add
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {metadata.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1">
                                {tag}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleRemoveTag(tag)}
                                    disabled={disabled}
                                >
                                    <Trash className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}

                        {metadata.tags.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No tags added yet.
                            </p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="activation" className="space-y-4">
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                            Set rules to determine when this template should be used. Rules are evaluated in priority order.
                        </p>

                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={handleAddActivationRule}
                                disabled={disabled}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Rule
                            </Button>
                        </div>
                    </div>

                    {metadata.activationRules.length === 0 ? (
                        <div className="text-center py-8 border rounded-md">
                            <p className="text-muted-foreground">
                                No activation rules defined.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Without rules, this template can be manually selected but won't be automatically activated.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {metadata.activationRules
                                .sort((a, b) => a.priority - b.priority)
                                .map((rule) => (
                                    <Card key={rule.id} className="overflow-hidden">
                                        <CardHeader className="p-4 pb-2 bg-muted/50">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <Input
                                                        className="max-w-[250px] font-medium"
                                                        value={rule.type}
                                                        onChange={(e) =>
                                                            handleUpdateActivationRule(rule.id, { type: e.target.value as "url_pattern" | "user_intent" | "keyword" | "time_based" | "user_attribute" | "custom" })
                                                        }
                                                        disabled={disabled}
                                                    />
                                                    <div className="ml-2 flex items-center">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center ml-2">
                                                                        <Badge variant={rule.isActive ? "default" : "outline"}>
                                                                            {rule.isActive ? "Active" : "Inactive"}
                                                                        </Badge>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right">
                                                                    <p className="text-xs">
                                                                        {rule.isActive
                                                                            ? "This rule is active and will be evaluated"
                                                                            : "This rule is inactive and will be ignored"}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleUpdateActivationRule(rule.id, { isActive: !rule.isActive })
                                                        }
                                                        disabled={disabled}
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleMovePriority(rule.id, "up")}
                                                        disabled={rule.priority <= 1 || disabled}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleMovePriority(rule.id, "down")}
                                                        disabled={rule.priority >= metadata.activationRules.length || disabled}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleRemoveActivationRule(rule.id)}
                                                        disabled={disabled}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <Label className="text-xs mb-1 block">Subject</Label>
                                                    <Select
                                                        value={rule.condition.split(' ')[0]}
                                                        onValueChange={(value) => {
                                                            const parts = rule.condition.split(' ');
                                                            parts[0] = value;
                                                            handleUpdateActivationRule(rule.id, {
                                                                condition: parts.join(' ')
                                                            });
                                                        }}
                                                        disabled={disabled}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select subject" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {CONDITION_SUBJECTS.map(subject => (
                                                                <SelectItem
                                                                    key={subject.value}
                                                                    value={subject.value}
                                                                >
                                                                    {subject.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label className="text-xs mb-1 block">Operator</Label>
                                                    <Select
                                                        value={rule.condition.split(' ')[1]}
                                                        onValueChange={(value) => {
                                                            const parts = rule.condition.split(' ');
                                                            parts[1] = value;
                                                            handleUpdateActivationRule(rule.id, {
                                                                condition: parts.join(' ')
                                                            });
                                                        }}
                                                        disabled={disabled}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select operator" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {CONDITION_OPERATORS.map(operator => (
                                                                <SelectItem
                                                                    key={operator.value}
                                                                    value={operator.value}
                                                                >
                                                                    {operator.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label className="text-xs mb-1 block">Value</Label>
                                                    <Input
                                                        value={rule.condition.split(' ').slice(2).join(' ').replace(/^['"]|['"]$/g, '')}
                                                        onChange={(e) => {
                                                            const parts = rule.condition.split(' ');
                                                            const subject = parts[0];
                                                            const operator = parts[1];
                                                            const newValue = `'${e.target.value}'`;
                                                            handleUpdateActivationRule(rule.id, {
                                                                condition: `${subject} ${operator} ${newValue}`
                                                            });
                                                        }}
                                                        disabled={disabled}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-3 text-xs text-muted-foreground flex items-center">
                                                <Info className="h-3 w-3 mr-1" />
                                                <span>
                                                    Priority: {rule.priority} | Rule will activate when
                                                    {' '}
                                                    <span className="font-mono">
                                                        {CONDITION_SUBJECTS.find(s => s.value === rule.condition.split(' ')[0])?.label || rule.condition.split(' ')[0]}
                                                        {' '}
                                                        {CONDITION_OPERATORS.find(o => o.value === rule.condition.split(' ')[1])?.label.toLowerCase() || rule.condition.split(' ')[1]}
                                                        {' '}
                                                        "{rule.condition.split(' ').slice(2).join(' ').replace(/^['"]|['"]$/g, '')}"
                                                    </span>
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </CardContent>
        </Card >
    );
}