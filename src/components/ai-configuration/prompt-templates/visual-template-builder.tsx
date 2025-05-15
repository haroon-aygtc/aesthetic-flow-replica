import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { promptTemplatesApi } from "@/api/prompt-templates";
import {
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    GripVertical,
    Type,
    List,
    BrainCircuit,
    CopyCheck,
    CircleOff,
    History,
    Save,
    AlertTriangle
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface BlockType {
    id: string;
    type: 'intro' | 'instruction' | 'guidelines' | 'variable' | 'condition' | 'format' | 'custom';
    content: string;
}

interface TemplateVersion {
    id: string;
    version: number;
    content: string;
    created_at: string;
    created_by?: string;
}

interface VisualTemplateBuilderProps {
    value: string;
    onChange: (value: string) => void;
    templateType?: string;
    templateId?: string;
    onSave?: (content: string) => Promise<void>;
}

export function VisualTemplateBuilder({ value, onChange, templateType = 'custom', templateId, onSave }: VisualTemplateBuilderProps) {
    const { toast } = useToast();

    // Parse initial value into blocks
    const [blocks, setBlocks] = useState<BlockType[]>(() => {
        if (!value) {
            // Default blocks based on template type
            return getDefaultBlocks(templateType);
        }

        // Try to parse from the value
        return parseContentToBlocks(value);
    });

    const [activeTab, setActiveTab] = useState("blocks");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [versions, setVersions] = useState<TemplateVersion[]>([]);
    const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load template versions if templateId is provided
    const loadVersionHistory = useCallback(async () => {
        if (!templateId) return;

        try {
            setIsLoading(true);
            setError(null);

            // Call the API to get template versions
            const response = await promptTemplatesApi.getTemplateVersions(templateId);

            if (response.data && Array.isArray(response.data)) {
                setVersions(response.data);
            }
        } catch (err) {
            console.error('Error loading template versions:', err);
            setError('Failed to load template version history');
            toast({
                title: 'Error',
                description: 'Failed to load template version history',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }, [templateId, toast]);

    // Load versions when templateId changes
    useEffect(() => {
        if (templateId) {
            loadVersionHistory();
        }
    }, [templateId, loadVersionHistory]);

    // Update the output value whenever blocks change
    const updateOutput = (newBlocks: BlockType[]) => {
        setBlocks(newBlocks);

        // Convert blocks to text
        const newContent = newBlocks.map(block => block.content).join('\n\n');
        onChange(newContent);
    };

    // Handle saving the template
    const handleSave = async () => {
        if (!onSave) return;

        try {
            setIsSaving(true);
            setError(null);

            // Call the parent's onSave function with the current content
            await onSave(value);

            // Refresh version history if available
            if (templateId) {
                await loadVersionHistory();
            }

            toast({
                title: 'Success',
                description: 'Template saved successfully',
            });
        } catch (err) {
            console.error('Error saving template:', err);
            setError('Failed to save template');
            toast({
                title: 'Error',
                description: 'Failed to save template',
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Handle restoring a previous version
    const handleRestoreVersion = (version: TemplateVersion) => {
        try {
            // Update the content with the selected version
            onChange(version.content);

            // Parse the content into blocks
            setBlocks(parseContentToBlocks(version.content));

            // Close the version history dialog
            setIsVersionHistoryOpen(false);

            toast({
                title: 'Success',
                description: `Restored version ${version.version}`,
            });
        } catch (err) {
            console.error('Error restoring template version:', err);
            toast({
                title: 'Error',
                description: 'Failed to restore template version',
                variant: 'destructive'
            });
        }
    };

    const handleAddBlock = (type: BlockType['type']) => {
        const newBlock: BlockType = {
            id: crypto.randomUUID(),
            type,
            content: getDefaultBlockContent(type, templateType)
        };

        updateOutput([...blocks, newBlock]);
    };

    const handleRemoveBlock = (id: string) => {
        const newBlocks = blocks.filter(block => block.id !== id);
        updateOutput(newBlocks);
    };

    const handleUpdateBlock = (id: string, content: string) => {
        const newBlocks = blocks.map(block =>
            block.id === id ? { ...block, content } : block
        );
        updateOutput(newBlocks);
    };

    const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(block => block.id === id);
        if (index === -1) return;

        const newBlocks = [...blocks];

        if (direction === 'up' && index > 0) {
            [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
        } else if (direction === 'down' && index < blocks.length - 1) {
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        }

        updateOutput(newBlocks);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = blocks.findIndex(block => block.id === active.id);
            const newIndex = blocks.findIndex(block => block.id === over.id);

            const newBlocks = [...blocks];
            const [removed] = newBlocks.splice(oldIndex, 1);
            newBlocks.splice(newIndex, 0, removed);

            updateOutput(newBlocks);
        }
    };

    return (
        <div className="border rounded-md h-[500px] flex flex-col">
            {error && (
                <Alert variant="destructive" className="mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-between items-center border-b px-4 py-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList>
                        <TabsTrigger value="blocks">Blocks</TabsTrigger>
                        <TabsTrigger value="source">Source</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center space-x-2">
                    {templateId && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsVersionHistoryOpen(true)}
                            disabled={isLoading || versions.length === 0}
                        >
                            <History className="h-4 w-4 mr-1" />
                            History
                        </Button>
                    )}

                    {onSave && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Spinner className="h-4 w-4 mr-1" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            <TabsContent value="blocks" className="flex-1 flex flex-col p-0">
                <div className="flex border-b">
                    <div className="p-2 space-x-1 overflow-auto flex">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock('intro')}
                            className="whitespace-nowrap"
                        >
                            <Type className="h-4 w-4 mr-1" />
                            Introduction
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock('instruction')}
                            className="whitespace-nowrap"
                        >
                            <List className="h-4 w-4 mr-1" />
                            Instructions
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock('guidelines')}
                            className="whitespace-nowrap"
                        >
                            <CopyCheck className="h-4 w-4 mr-1" />
                            Guidelines
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock('variable')}
                            className="whitespace-nowrap"
                        >
                            <BrainCircuit className="h-4 w-4 mr-1" />
                            Variable
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock('condition')}
                            className="whitespace-nowrap"
                        >
                            <CircleOff className="h-4 w-4 mr-1" />
                            Condition
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock('custom')}
                            className="whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Custom
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={blocks.map(block => block.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {blocks.map((block) => (
                                    <SortableBlockItem
                                        key={block.id}
                                        block={block}
                                        onUpdate={handleUpdateBlock}
                                        onRemove={handleRemoveBlock}
                                        onMove={handleMoveBlock}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {blocks.length === 0 && (
                        <div className="text-center text-muted-foreground">
                            Add your first block by clicking one of the buttons above
                        </div>
                    )}
                </ScrollArea>
            </TabsContent>

            <TabsContent value="source" className="flex-1 flex flex-col p-4">
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="Your prompt template content will appear here"
                />
            </TabsContent>
        </Tabs>

        {/* Version History Dialog */ }
    <Dialog open={isVersionHistoryOpen} onOpenChange={setIsVersionHistoryOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Template Version History</DialogTitle>
                <DialogDescription>
                    View and restore previous versions of this template
                </DialogDescription>
            </DialogHeader>

            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Spinner className="h-8 w-8 mr-2" />
                    <p>Loading version history...</p>
                </div>
            ) : versions.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    No version history available
                </div>
            ) : (
                <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Version</th>
                                <th className="text-left p-2">Created</th>
                                <th className="text-left p-2">Created By</th>
                                <th className="text-right p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {versions.map((version) => (
                                <tr key={version.id} className="border-b hover:bg-muted/50">
                                    <td className="p-2">v{version.version}</td>
                                    <td className="p-2">{new Date(version.created_at).toLocaleString()}</td>
                                    <td className="p-2">{version.created_by || 'System'}</td>
                                    <td className="p-2 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRestoreVersion(version)}
                                        >
                                            Restore
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsVersionHistoryOpen(false)}>
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
        </div >
    );
}

function SortableBlockItem({
    block,
    onUpdate,
    onRemove,
    onMove
}: {
    block: BlockType;
    onUpdate: (id: string, content: string) => void;
    onRemove: (id: string) => void;
    onMove: (id: string, direction: 'up' | 'down') => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="rounded-md border">
            <div className="flex items-center border-b bg-muted/30 px-3 py-2">
                <div className="cursor-move" {...attributes} {...listeners}>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="ml-2">
                    {getBlockTypeName(block.type)}
                </Badge>
                <div className="flex-1" />
                <div className="flex space-x-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMove(block.id, 'up')}
                        className="h-8 w-8"
                    >
                        <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMove(block.id, 'down')}
                        className="h-8 w-8"
                    >
                        <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(block.id)}
                        className="h-8 w-8 text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="p-3">
                <Textarea
                    value={block.content}
                    onChange={(e) => onUpdate(block.id, e.target.value)}
                    className="w-full min-h-[80px]"
                />
            </div>
        </div>
    );
}

function getBlockTypeName(type: BlockType['type']): string {
    switch (type) {
        case 'intro': return 'Introduction';
        case 'instruction': return 'Instructions';
        case 'guidelines': return 'Guidelines';
        case 'variable': return 'Variable';
        case 'condition': return 'Condition';
        case 'format': return 'Format';
        case 'custom': return 'Custom';
        default: return 'Block';
    }
}

function getDefaultBlockContent(type: BlockType['type'], templateType: string): string {
    switch (type) {
        case 'intro':
            switch (templateType) {
                case 'customer_support':
                    return 'You are a customer service agent for {{company_name}}. Your goal is to help customers in a friendly and efficient manner.';
                case 'general_assistant':
                    return 'You are an AI assistant for {{company_name}}. Your primary goal is to be helpful, accurate, and concise.';
                case 'creative_writing':
                    return 'As a creative writing assistant, I\'ll help you craft engaging content in the {{genre}} genre.';
                case 'technical_support':
                    return 'I\'m a technical support specialist for {{product_name}} version {{product_version}}.';
                default:
                    return 'You are an AI assistant. Your role is to provide helpful and accurate information.';
            }

        case 'instruction':
            return 'When responding to the user:\n1. Be concise and clear\n2. Provide accurate information\n3. Ask for clarification if needed';

        case 'guidelines':
            return 'Remember to:\n- Maintain a {{tone}} tone\n- Focus on being helpful\n- Provide references when possible';

        case 'variable':
            return 'Please consider the user\'s {{preference}} when responding.';

        case 'condition':
            return '{{#if context}}\nBased on the following context: {{context}}\n{{/if}}';

        case 'format':
            return 'Format your response in a structured way with headings and bullet points when appropriate.';

        case 'custom':
            return 'Enter your custom text here...';

        default:
            return '';
    }
}

function getDefaultBlocks(templateType: string): BlockType[] {
    const blocks: BlockType[] = [];

    // Add introduction block
    blocks.push({
        id: crypto.randomUUID(),
        type: 'intro',
        content: getDefaultBlockContent('intro', templateType)
    });

    // Add instructions block
    blocks.push({
        id: crypto.randomUUID(),
        type: 'instruction',
        content: getDefaultBlockContent('instruction', templateType)
    });

    return blocks;
}

function parseContentToBlocks(content: string): BlockType[] {
    // Simple splitting by double newlines
    const parts = content.split('\n\n').filter(part => part.trim().length > 0);

    return parts.map(part => {
        let type: BlockType['type'] = 'custom';

        // Try to detect block type based on content
        if (part.includes('You are') || part.includes('I am') || part.includes('As a')) {
            type = 'intro';
        } else if (part.includes('1.') && part.includes('2.')) {
            type = 'instruction';
        } else if (part.includes('Remember') || part.includes('- ')) {
            type = 'guidelines';
        } else if (part.includes('{{#if')) {
            type = 'condition';
        } else if (part.includes('{{') && part.includes('}}') && part.length < 100) {
            type = 'variable';
        }

        return {
            id: crypto.randomUUID(),
            type,
            content: part
        };
    });
}