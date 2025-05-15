"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Check, X, FileText } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Template {
    id: number
    name: string
    description: string | null
    content: string
    placeholders: Record<string, any>
    settings: Record<string, any>
    priority: number
    is_active: boolean
}

interface TemplateManagerProps {
    templates: Template[]
    selectedTemplate: Template | null
    onSelect: (template: Template | null) => void
    onCreate: (data: Omit<Template, "id">) => Promise<Template | undefined>
    onUpdate: (id: number, data: Partial<Omit<Template, "id">>) => Promise<Template | undefined>
    onDelete: (id: number) => Promise<boolean | undefined>
}

export function TemplateManager({
    templates,
    selectedTemplate,
    onSelect,
    onCreate,
    onUpdate,
    onDelete,
}: TemplateManagerProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        content: "",
        is_active: true,
        priority: 0,
    })

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            content: "",
            is_active: true,
            priority: 0,
        })
    }

    const handleCreateClick = () => {
        resetForm()
        setIsCreating(true)
    }

    const handleEditClick = (template: Template) => {
        setFormData({
            name: template.name,
            description: template.description || "",
            content: template.content,
            is_active: template.is_active,
            priority: template.priority,
        })
        setIsEditing(true)
    }

    const handleDeleteClick = () => {
        setIsDeleting(true)
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await onCreate({
                name: formData.name,
                description: formData.description || null,
                content: formData.content,
                placeholders: {},
                settings: {},
                is_active: formData.is_active,
                priority: formData.priority,
            })

            if (result) {
                setIsCreating(false)
                resetForm()
            }
        } catch (error) {
            console.error("Failed to create template:", error)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedTemplate) {
            return
        }

        try {
            const result = await onUpdate(selectedTemplate.id, {
                name: formData.name,
                description: formData.description || null,
                priority: formData.priority,
                is_active: formData.is_active,
            })

            if (result) {
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Failed to update template:", error)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!selectedTemplate) {
            return
        }

        try {
            const result = await onDelete(selectedTemplate.id)

            if (result) {
                setIsDeleting(false)
            }
        } catch (error) {
            console.error("Failed to delete template:", error)
        }
    }

    const handleSelect = (template: Template) => {
        onSelect(template)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Prompt Templates</h3>
                <Button size="sm" onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Template
                </Button>
            </div>

            {templates.length === 0 ? (
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-muted p-3">
                            <FileText className="h-6 w-6" />
                        </div>
                        <CardTitle className="mb-2">No Templates</CardTitle>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create your first prompt template to get started with customizing AI responses.
                        </p>
                        <Button onClick={handleCreateClick}>Create Template</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map((template) => (
                                <TableRow
                                    key={template.id}
                                    className={cn(
                                        selectedTemplate?.id === template.id ? "bg-muted/50" : "",
                                        "cursor-pointer"
                                    )}
                                    onClick={() => handleSelect(template)}
                                >
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell>{template.description || "—"}</TableCell>
                                    <TableCell>{template.priority}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <div className={cn(
                                                "rounded-full w-2 h-2 mr-2",
                                                template.is_active ? "bg-green-500" : "bg-red-500"
                                            )} />
                                            {template.is_active ? "Active" : "Inactive"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(template)
                                                    handleEditClick(template)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(template)
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

            {/* Create Template Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Template</DialogTitle>
                        <DialogDescription>
                            Add a new prompt template for AI responses.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter template name"
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
                            <div className="space-y-2">
                                <Label htmlFor="content">Initial Content</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Enter template content with {{placeholders}}"
                                    rows={5}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use double curly braces for placeholders, e.g. {{ name }} or {{ context }}
                                </p>
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
                                    <p className="text-xs text-muted-foreground">
                                        Higher priority templates are selected first
                                    </p>
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

            {/* Edit Template Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Template</DialogTitle>
                        <DialogDescription>
                            Update template details. Content can be edited in the editor tab.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter template name"
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

            {/* Delete Template Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Template</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this template? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="font-medium">{selectedTemplate?.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTemplate?.description}</p>
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