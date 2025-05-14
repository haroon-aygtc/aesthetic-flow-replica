import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import {
    knowledgeBaseService,
    WebsiteSource
} from "@/utils/knowledge-base-service";
import { WebsiteSourceDialog } from "./website-source-dialog";
import { cn } from "@/lib/utils";
import {
    Globe,
    MoreVertical,
    Trash2,
    RefreshCw,
    Search,
    Plus,
    Check,
    AlertCircle,
    Clock,
    FileText,
    Download,
    Code,
    Eye
} from "lucide-react";

interface WebsiteSourceListProps {
    sources: WebsiteSource[];
    onSourcesChange: (sources: WebsiteSource[]) => void;
}

interface ContentPreviewProps {
    sourceId: string;
    url: string;
    onClose: () => void;
}

function ContentPreview({ sourceId, url, onClose }: ContentPreviewProps) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [exportFormat, setExportFormat] = useState("json");
    const [exportLoading, setExportLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                setIsLoading(true);
                const response = await knowledgeBaseService.previewWebsiteContent(sourceId);
                setData(response.data.data);
            } catch (error) {
                console.error("Error previewing content:", error);
                toast({
                    title: "Error",
                    description: "Failed to preview website content",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreview();
    }, [sourceId, toast]);

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const response = await knowledgeBaseService.exportWebsiteContent(sourceId, exportFormat);

            // Create a blob and download
            const blob = new Blob([response.data.data.content], { type: response.data.data.content_type });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', response.data.data.filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast({
                title: "Export successful",
                description: `Content exported as ${exportFormat.toUpperCase()}`
            });
        } catch (error) {
            console.error("Error exporting content:", error);
            toast({
                title: "Export failed",
                description: "Could not export the content",
                variant: "destructive"
            });
        } finally {
            setExportLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>No preview data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-xl font-bold">{data.title}</h3>
                <p className="text-muted-foreground">{data.description}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a href={data.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {data.url}
                    </a>
                </div>
            </div>

            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="mt-4">
                    <div className="border rounded-md p-4 max-h-96 overflow-y-auto bg-muted/50">
                        <p className="whitespace-pre-line">{data.content_sample}</p>
                        {data.content_length > 1000 && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                                Content truncated ({data.content_length} characters total)
                            </p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="metadata" className="mt-4">
                    <div className="border rounded-md p-4 max-h-96 overflow-y-auto bg-muted/50">
                        <pre className="text-xs">{JSON.stringify(data.metadata, null, 2)}</pre>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Export as:</span>
                    <select
                        className="text-sm border rounded px-2 py-1"
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                    >
                        {data.export_formats.map((format: string) => (
                            <option key={format} value={format}>
                                {format.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <Button size="sm" onClick={handleExport} disabled={exportLoading}>
                        {exportLoading ? (
                            <Spinner className="h-4 w-4 mr-2" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Export
                    </Button>
                </div>
                <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}

export function WebsiteSourceList({ sources, onSourcesChange }: WebsiteSourceListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState<Record<string, boolean>>({});
    const [previewSource, setPreviewSource] = useState<WebsiteSource | null>(null);
    const { toast } = useToast();

    const categories = ["all", ...Array.from(new Set(sources.map(source => source.category)))];

    const filteredSources = sources.filter(source => {
        const matchesSearch =
            source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.url.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || source.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDeleteSource = async (id: string) => {
        try {
            await knowledgeBaseService.deleteWebsiteSource(id);
            onSourcesChange(sources.filter(source => source.id !== id));
            toast({
                title: "Website source deleted",
                description: "The website has been removed from your knowledge base"
            });
        } catch (error) {
            console.error("Error deleting website source:", error);
            toast({
                title: "Error deleting website source",
                description: "Please try again later",
                variant: "destructive"
            });
        }
    };

    const handleRefreshSource = async (id: string) => {
        try {
            setIsRefreshing(prev => ({ ...prev, [id]: true }));
            await knowledgeBaseService.refreshWebsiteSource(id);

            // Update the source status
            const updatedSources = sources.map(source => {
                if (source.id === id) {
                    return {
                        ...source,
                        status: 'pending' as const,
                        last_crawled_at: new Date().toISOString()
                    };
                }
                return source;
            });

            onSourcesChange(updatedSources);

            toast({
                title: "Refresh started",
                description: "The website content is being updated"
            });
        } catch (error) {
            console.error("Error refreshing website source:", error);
            toast({
                title: "Error refreshing website",
                description: "Please try again later",
                variant: "destructive"
            });
        } finally {
            setIsRefreshing(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleAddComplete = (newSources: WebsiteSource[]) => {
        onSourcesChange([...newSources, ...sources]);
        setIsAddDialogOpen(false);
        toast({
            title: "Website source added",
            description: `${newSources.length} website(s) added successfully`
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Check className="h-4 w-4 text-green-500" />;
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "failed":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "failed":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search websites..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Website
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                    <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category === "all" ? "All" : category}
                    </Badge>
                ))}
            </div>

            <div className="border rounded-md">
                <div className="grid grid-cols-12 p-3 border-b bg-muted/50 font-medium text-sm">
                    <div className="col-span-4">Website</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Last Updated</div>
                    <div className="col-span-1">Actions</div>
                </div>
                <div className="divide-y">
                    {filteredSources.length > 0 ? (
                        filteredSources.map((source) => (
                            <div key={source.id} className="grid grid-cols-12 p-3 items-center text-sm hover:bg-muted/50">
                                <div className="col-span-4 flex items-start gap-2 overflow-hidden">
                                    <Globe className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium truncate">{source.title}</div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {source.url}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 capitalize">{source.category}</div>
                                <div className="col-span-2">
                                    <div className={cn("px-2 py-1 rounded-full text-xs inline-flex items-center gap-1", getStatusClass(source.status))}>
                                        {getStatusIcon(source.status)}
                                        <span className="capitalize">{source.status}</span>
                                    </div>
                                </div>
                                <div className="col-span-3 text-xs text-muted-foreground">
                                    {source.last_crawled_at ? formatDate(source.last_crawled_at) : 'Never'}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setPreviewSource(source)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                <span>Preview</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleRefreshSource(source.id)}
                                                disabled={isRefreshing[source.id]}
                                            >
                                                {isRefreshing[source.id] ? (
                                                    <Spinner className="h-4 w-4 mr-2" />
                                                ) : (
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                )}
                                                <span>Refresh</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteSource(source.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            {searchQuery || selectedCategory !== "all"
                                ? "No website sources match your search criteria."
                                : "No website sources found. Add websites to get started."}
                        </div>
                    )}
                </div>
            </div>

            <WebsiteSourceDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onComplete={handleAddComplete}
            />

            <Dialog open={!!previewSource} onOpenChange={(open) => !open && setPreviewSource(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Globe className="h-5 w-5 mr-2" />
                            Website Content Preview
                        </DialogTitle>
                    </DialogHeader>
                    {previewSource && (
                        <ContentPreview
                            sourceId={previewSource.id}
                            url={previewSource.url}
                            onClose={() => setPreviewSource(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 