"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, FileText, Database, Globe, MessageSquare, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface KnowledgeBaseSource {
    id: number
    knowledge_base_id: number
    source_type: "database" | "file" | "website" | "qa_pair"
    name: string
    description: string | null
    settings: Record<string, any>
    metadata: Record<string, any>
    is_active: boolean
    priority: number
}

interface KnowledgeBaseSourceManagerProps {
    sources: KnowledgeBaseSource[]
    selectedSource: KnowledgeBaseSource | null
    onSelect: (source: KnowledgeBaseSource | null) => void
    onCreate: (data: Omit<KnowledgeBaseSource, "id" | "knowledge_base_id">) => Promise<KnowledgeBaseSource | undefined>
    onUpdate: (id: number, data: Partial<Omit<KnowledgeBaseSource, "id" | "knowledge_base_id">>) => Promise<KnowledgeBaseSource | undefined>
    onDelete: (id: number) => Promise<boolean | undefined>
    onProcess: (id: number) => Promise<any>
}

export function KnowledgeBaseSourceManager({
    sources,
    selectedSource,
    onSelect,
    onCreate,
    onUpdate,
    onDelete,
    onProcess,
}: KnowledgeBaseSourceManagerProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [formData, setFormData] = useState({
        source_type: "qa_pair" as KnowledgeBaseSource["source_type"],
        name: "",
        description: "",
        is_active: true,
        priority: 0,
        settings: {},
    })

    const sourceTypeIcons = {
        file: <FileText className="h-4 w-4" />,
        database: <Database className="h-4 w-4" />,
        website: <Globe className="h-4 w-4" />,
        qa_pair: <MessageSquare className="h-4 w-4" />,
    }

    const sourceTypeLabels = {
        file: "File",
        database: "Database",
        website: "Website",
        qa_pair: "Q&A Pairs",
    }

    const resetForm = () => {
        setFormData({
            source_type: "qa_pair",
            name: "",
            description: "",
            is_active: true,
            priority: 0,
            settings: {},
        })
    }

    const handleCreateClick = () => {
        resetForm()
        setIsCreating(true)
    }

    const handleEditClick = (source: KnowledgeBaseSource) => {
        setFormData({
            source_type: source.source_type,
            name: source.name,
            description: source.description || "",
            is_active: source.is_active,
            priority: source.priority,
            settings: source.settings,
        })
        setIsEditing(true)
    }

    const handleDeleteClick = () => {
        setIsDeleting(true)
    }

    const handleProcessClick = () => {
        if (!selectedSource) return

        setIsProcessing(true)
        onProcess(selectedSource.id)
            .finally(() => setIsProcessing(false))
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await onCreate({
                source_type: formData.source_type,
                name: formData.name,
                description: formData.description || null,
                settings: formData.settings,
                metadata: {},
                is_active: formData.is_active,
                priority: formData.priority,
            })

            if (result) {
                setIsCreating(false)
                resetForm()
            }
        } catch (error) {
            console.error("Failed to create source:", error)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedSource) {
            return
        }

        try {
            const result = await onUpdate(selectedSource.id, {
                name: formData.name,
                description: formData.description || null,
                is_active: formData.is_active,
                priority: formData.priority,
            })

            if (result) {
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Failed to update source:", error)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!selectedSource) {
            return
        }

        try {
            const result = await onDelete(selectedSource.id)

            if (result) {
                setIsDeleting(false)
            }
        } catch (error) {
            console.error("Failed to delete source:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Knowledge Sources</h3>
                <div className="space-x-2">
                    {selectedSource && (
                        <Button size="sm" variant="outline" onClick={handleProcessClick} disabled={isProcessing}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Process Source
                        </Button>
                    )}
                    <Button size="sm" onClick={handleCreateClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Source
                    </Button>
                </div>
            </div>

            {sources.length === 0 ? (
                <div className="border rounded-md p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">No Sources Added</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Add sources such as files, websites, or Q&A pairs to your knowledge base.
                    </p>
                    <Button className="mt-4" onClick={handleCreateClick}>
                        Add Source
                    </Button>
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sources.map((source) => (
                                <TableRow
                                    key={source.id}
                                    className={cn(
                                        selectedSource?.id === source.id ? "bg-muted/50" : "",
                                        "cursor-pointer"
                                    )}
                                    onClick={() => onSelect(source)}
                                >
                                    <TableCell>
                                        <div className="flex items-center">
                                            {sourceTypeIcons[source.source_type]}
                                            <span className="ml-2">{sourceTypeLabels[source.source_type]}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{source.name}</TableCell>
                                    <TableCell>{source.description || "—"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{source.priority}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <div className={cn(
                                                "rounded-full w-2 h-2 mr-2",
                                                source.is_active ? "bg-green-500" : "bg-red-500"
                                            )} />
                                            {source.is_active ? "Active" : "Inactive"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(source)
                                                    handleEditClick(source)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(source)
                                                    handleDeleteClick()
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create Source Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Knowledge Source</DialogTitle>
                        <DialogDescription>
                            Add a new source to your knowledge base.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="source_type">Source Type</Label>
                                <Select
                                    value={formData.source_type}
                                    onValueChange={(value: KnowledgeBaseSource["source_type"]) =>
                                        setFormData({ ...formData, source_type: value })
                                    }
                                >
                                    <SelectTrigger id="source_type">
                                        <SelectValue placeholder="Select source type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="file">File</SelectItem>
                                        <SelectItem value="database">Database</SelectItem>
                                        <SelectItem value="website">Website</SelectItem>
                                        <SelectItem value="qa_pair">Q&A Pairs</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter source name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter description (optional)"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                                <div className="space-y-2 flex items-end">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                        <Label htmlFor="is_active">Active</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Source Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Source</DialogTitle>
                        <DialogDescription>
                            Update the source details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Source Type</Label>
                                <div className="flex items-center p-2 border rounded-md bg-muted">
                                    {sourceTypeIcons[formData.source_type]}
                                    <span className="ml-2">{sourceTypeLabels[formData.source_type]}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Source type cannot be changed after creation.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter source name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter description (optional)"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-priority">Priority</Label>
                                    <Input
                                        id="edit-priority"
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                                <div className="space-y-2 flex items-end">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="edit-is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                        <Label htmlFor="edit-is_active">Active</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Source Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Source</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this source? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center">
                            {selectedSource && sourceTypeIcons[selectedSource.source_type]}
                            <p className="font-medium ml-2">{selectedSource?.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{selectedSource?.description}</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDeleting(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteSubmit}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 