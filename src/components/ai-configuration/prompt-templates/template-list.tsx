import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
    Search,
    PlusCircle,
    MoreVertical,
    Copy,
    Pencil,
    Trash2,
    Clock,
    Tag
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PromptTemplate, promptTemplateService } from "@/utils/prompt-template-service";
import AdminLayout from "@/components/layouts/admin-layout";

export function TemplateList() {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [tagFilter, setTagFilter] = useState<string>("all");
    const [modelFilter, setModelFilter] = useState<string>("all");
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        async function loadTemplates() {
            setIsLoading(true);
            try {
                const response = await promptTemplateService.getTemplates();
                setTemplates(response.data);

                // Extract all available tags and models
                const tags = new Set<string>();
                const models = new Set<string>();

                response.data.forEach(template => {
                    template.metadata.tags.forEach(tag => tags.add(tag));
                    template.metadata.aiModel.forEach(model => models.add(model));
                });

                setAvailableTags(Array.from(tags));
                setAvailableModels(Array.from(models));
            } catch (error) {
                console.error("Failed to load templates:", error);
                toast({
                    title: "Error loading templates",
                    description: "Failed to load prompt templates. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }

        loadTemplates();
    }, [toast]);

    useEffect(() => {
        // Filter templates based on search query, tag filter, and model filter
        let result = templates;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                template =>
                    template.name.toLowerCase().includes(query) ||
                    (template.description?.toLowerCase().includes(query)) ||
                    template.content.toLowerCase().includes(query)
            );
        }

        if (tagFilter && tagFilter !== "all") {
            result = result.filter(template =>
                template.metadata.tags.includes(tagFilter)
            );
        }

        if (modelFilter && modelFilter !== "all") {
            result = result.filter(template =>
                template.metadata.aiModel.includes(modelFilter)
            );
        }

        setFilteredTemplates(result);
    }, [templates, searchQuery, tagFilter, modelFilter]);

    const handleDeleteTemplate = async (id: string) => {
        try {
            await promptTemplateService.deleteTemplate(id);
            setTemplates(templates.filter(t => t.id !== id));
            toast({
                title: "Template deleted",
                description: "The prompt template has been deleted successfully."
            });
        } catch (error) {
            console.error("Failed to delete template:", error);
            toast({
                title: "Error deleting template",
                description: "Failed to delete the prompt template. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleDuplicateTemplate = async (id: string) => {
        try {
            const response = await promptTemplateService.duplicateTemplate(id);
            setTemplates([response.data, ...templates]);
            toast({
                title: "Template duplicated",
                description: "The prompt template has been duplicated successfully."
            });
        } catch (error) {
            console.error("Failed to duplicate template:", error);
            toast({
                title: "Error duplicating template",
                description: "Failed to duplicate the prompt template. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleCreateTemplate = () => {
        navigate("/ai-configuration/prompt-templates/create");
    };

    const handleEditTemplate = (id: string) => {
        navigate(`/ai-configuration/prompt-templates/edit/${id}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Prompt Templates</h2>
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-4 w-20 mr-2" />
                                <Skeleton className="h-4 w-20" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Prompt Templates</h2>
                    <Button onClick={handleCreateTemplate}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Template
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search templates..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select
                        value={tagFilter}
                        onValueChange={setTagFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by tag" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tags</SelectItem>
                            {availableTags.map(tag => (
                                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={modelFilter}
                        onValueChange={setModelFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Models</SelectItem>
                            {availableModels.map(model => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {filteredTemplates.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                        <h3 className="text-lg font-medium mb-2">No templates found</h3>
                        <p className="text-muted-foreground mb-6">
                            {templates.length > 0
                                ? "Try adjusting your search or filters."
                                : "Create your first prompt template to get started."}
                        </p>
                        {templates.length === 0 && (
                            <Button onClick={handleCreateTemplate}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Template
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template) => (
                            <Card key={template.id} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="line-clamp-1">{template.name}</CardTitle>
                                            <CardDescription className="line-clamp-2 mt-1">
                                                {template.description || "No description provided"}
                                            </CardDescription>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {template.metadata.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                <Tag className="mr-1 h-3 w-3" />
                                                {tag}
                                            </Badge>
                                        ))}
                                        {template.metadata.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{template.metadata.tags.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-md p-2 bg-muted/30 text-xs font-mono line-clamp-3 overflow-hidden">
                                        {template.content.substring(0, 150)}
                                        {template.content.length > 150 && "..."}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between text-xs text-muted-foreground pt-0">
                                    <div className="flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        <span>Updated {formatDistanceToNow(new Date(template.metadata.lastModified), { addSuffix: true })}</span>
                                    </div>
                                    <div className="flex items-center">
                                        {template.metadata.version > 1 ? (
                                            <Badge variant="outline" className="text-xs">
                                                v{template.metadata.version}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">
                                                New
                                            </Badge>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}