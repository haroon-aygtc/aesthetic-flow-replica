import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Database } from "lucide-react";
import { widgetService } from "@/utils/widgetService";
import { knowledgeBaseService } from "@/utils/knowledge-base-service";
import { MultiSelect } from "@/components/ui/multi-select";

// Form schema for knowledge base widget settings
const knowledgeBaseSettingsSchema = z.object({
    use_knowledge_base: z.boolean().default(false),
    knowledge_base_settings: z.object({
        search_threshold: z.number().min(0).max(1),
        max_results: z.number().int().min(1).max(20),
        sources: z.array(z.string()),
        categories: z.array(z.string())
    }).optional().default({
        search_threshold: 0.7,
        max_results: 5,
        sources: ["embeddings", "qa_pairs", "keywords"],
        categories: []
    })
});

type KnowledgeBaseSettingsFormValues = z.infer<typeof knowledgeBaseSettingsSchema>;

interface KnowledgeBaseWidgetSettingsProps {
    widgetId: number;
    initialSettings?: {
        use_knowledge_base: boolean;
        knowledge_base_settings?: {
            search_threshold?: number;
            max_results?: number;
            sources?: string[];
            categories?: string[];
        };
    };
    onSettingsChange?: () => void;
}

export function KnowledgeBaseWidgetSettings({
    widgetId,
    initialSettings,
    onSettingsChange
}: KnowledgeBaseWidgetSettingsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
    const { toast } = useToast();

    // Initialize form with react-hook-form and zod validation
    const form = useForm<KnowledgeBaseSettingsFormValues>({
        resolver: zodResolver(knowledgeBaseSettingsSchema),
        defaultValues: {
            use_knowledge_base: initialSettings?.use_knowledge_base ?? false,
            knowledge_base_settings: {
                search_threshold: initialSettings?.knowledge_base_settings?.search_threshold ?? 0.7,
                max_results: initialSettings?.knowledge_base_settings?.max_results ?? 5,
                sources: initialSettings?.knowledge_base_settings?.sources ?? ["embeddings", "qa_pairs", "keywords"],
                categories: initialSettings?.knowledge_base_settings?.categories ?? []
            }
        }
    });

    // Watch the use_knowledge_base field to conditionally show other fields
    const useKnowledgeBase = form.watch("use_knowledge_base");

    // Load categories from knowledge base
    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Get documents to extract categories
                const docsResponse = await knowledgeBaseService.getDocuments();
                const qaPairsResponse = await knowledgeBaseService.getQAPairs();
                const websiteSourcesResponse = await knowledgeBaseService.getWebsiteSources();

                // Extract unique categories
                const documents = docsResponse.data.data || [];
                const qaPairs = qaPairsResponse.data.data || [];
                const websiteSources = websiteSourcesResponse.data.data || [];

                const uniqueCategories = new Set<string>();

                documents.forEach((doc: any) => {
                    if (doc.category) uniqueCategories.add(doc.category);
                });

                qaPairs.forEach((pair: any) => {
                    if (pair.category) uniqueCategories.add(pair.category);
                });

                websiteSources.forEach((source: any) => {
                    if (source.category) uniqueCategories.add(source.category);
                });

                // Convert to options format
                const categoryOptions = Array.from(uniqueCategories).map(category => ({
                    label: category,
                    value: category
                }));

                setCategories(categoryOptions);
            } catch (error) {
                console.error("Error loading categories:", error);
            }
        };

        if (useKnowledgeBase) {
            loadCategories();
        }
    }, [useKnowledgeBase]);

    // Handle form submission
    const onSubmit = async (values: KnowledgeBaseSettingsFormValues) => {
        setIsLoading(true);

        try {
            await widgetService.updateWidgetSettings(widgetId, {
                use_knowledge_base: values.use_knowledge_base,
                knowledge_base_settings: values.use_knowledge_base ? values.knowledge_base_settings : undefined
            });

            toast({
                title: "Settings saved",
                description: "Knowledge base settings have been updated successfully."
            });

            if (onSettingsChange) {
                onSettingsChange();
            }
        } catch (error) {
            console.error("Error saving knowledge base settings:", error);

            toast({
                title: "Error saving settings",
                description: "There was a problem saving your knowledge base settings.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Knowledge Base Settings
                </CardTitle>
                <CardDescription>
                    Configure how this widget interacts with your knowledge base
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="use_knowledge_base"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Use Knowledge Base</FormLabel>
                                        <FormDescription>
                                            Enhance AI responses with information from your knowledge base
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {useKnowledgeBase && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="knowledge_base_settings.search_threshold"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Relevance Threshold: {field.value.toFixed(2)}</FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={1}
                                                    step={0.01}
                                                    value={[field.value]}
                                                    onValueChange={values => field.onChange(values[0])}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Higher values require more relevant matches (0-1)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="knowledge_base_settings.max_results"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Results</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={20}
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value) || 5)}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Number of knowledge items to include in responses (1-20)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="knowledge_base_settings.sources"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Knowledge Sources</FormLabel>
                                            <FormControl>
                                                <div className="flex flex-wrap gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="source-embeddings"
                                                            checked={field.value.includes("embeddings")}
                                                            onCheckedChange={(checked) => {
                                                                const newSources = checked
                                                                    ? [...field.value, "embeddings"]
                                                                    : field.value.filter(s => s !== "embeddings");
                                                                field.onChange(newSources);
                                                            }}
                                                            disabled={isLoading}
                                                        />
                                                        <label
                                                            htmlFor="source-embeddings"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Documents
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="source-qa-pairs"
                                                            checked={field.value.includes("qa_pairs")}
                                                            onCheckedChange={(checked) => {
                                                                const newSources = checked
                                                                    ? [...field.value, "qa_pairs"]
                                                                    : field.value.filter(s => s !== "qa_pairs");
                                                                field.onChange(newSources);
                                                            }}
                                                            disabled={isLoading}
                                                        />
                                                        <label
                                                            htmlFor="source-qa-pairs"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Q&A Pairs
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="source-keywords"
                                                            checked={field.value.includes("keywords")}
                                                            onCheckedChange={(checked) => {
                                                                const newSources = checked
                                                                    ? [...field.value, "keywords"]
                                                                    : field.value.filter(s => s !== "keywords");
                                                                field.onChange(newSources);
                                                            }}
                                                            disabled={isLoading}
                                                        />
                                                        <label
                                                            htmlFor="source-keywords"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Keywords
                                                        </label>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Select which knowledge sources to include
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {categories.length > 0 && (
                                    <FormField
                                        control={form.control}
                                        name="knowledge_base_settings.categories"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categories</FormLabel>
                                                <FormControl>
                                                    <MultiSelect
                                                        options={categories}
                                                        selected={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select categories..."
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Limit responses to specific knowledge categories (leave empty for all)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}

                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 