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
import { Plus, Edit, Trash2, Check, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface KnowledgeBase {
    id: number
    name: string
    description: string | null
    settings: Record<string, any>
    is_active: boolean
}

interface KnowledgeBaseManagerProps {
    knowledgeBases: KnowledgeBase[]
    selectedKnowledgeBase: KnowledgeBase | null
    onSelect: (knowledgeBase: KnowledgeBase | null) => void
    onCreate: (data: Omit<KnowledgeBase, "id">) => Promise<KnowledgeBase | undefined>
    onUpdate: (id: number, data: Partial<Omit<KnowledgeBase, "id">>) => Promise<KnowledgeBase | undefined>
    onDelete: (id: number) => Promise<boolean | undefined>
}

export function KnowledgeBaseManager({
    knowledgeBases,
    selectedKnowledgeBase,
    onSelect,
    onCreate,
    onUpdate,
    onDelete,
}: KnowledgeBaseManagerProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        is_active: true,
    })

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            is_active: true,
        })
    }

    const handleCreateClick = () => {
        resetForm()
        setIsCreating(true)
    }

    const handleEditClick = (knowledgeBase: KnowledgeBase) => {
        setFormData({
            name: knowledgeBase.name,
            description: knowledgeBase.description || "",
            is_active: knowledgeBase.is_active,
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
                settings: {},
                is_active: formData.is_active,
            })

            if (result) {
                setIsCreating(false)
                resetForm()
            }
        } catch (error) {
            console.error("Failed to create knowledge base:", error)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedKnowledgeBase) {
            return
        }

        try {
            const result = await onUpdate(selectedKnowledgeBase.id, {
                name: formData.name,
                description: formData.description || null,
                is_active: formData.is_active,
            })

            if (result) {
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Failed to update knowledge base:", error)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!selectedKnowledgeBase) {
            return
        }

        try {
            const result = await onDelete(selectedKnowledgeBase.id)

            if (result) {
                setIsDeleting(false)
            }
        } catch (error) {
            console.error("Failed to delete knowledge base:", error)
        }
    }

    const handleSelect = (knowledgeBase: KnowledgeBase) => {
        onSelect(knowledgeBase)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Knowledge Bases</h3>
                <Button size="sm" onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Knowledge Base
                </Button>
            </div>

            {knowledgeBases.length === 0 ? (
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-muted p-3">
                            <Plus className="h-6 w-6" />
                        </div>
                        <CardTitle className="mb-2">No Knowledge Bases</CardTitle>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create your first knowledge base to get started with organizing your data.
                        </p>
                        <Button onClick={handleCreateClick}>Create Knowledge Base</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {knowledgeBases.map((kb) => (
                                <TableRow
                                    key={kb.id}
                                    className={cn(
                                        selectedKnowledgeBase?.id === kb.id ? "bg-muted/50" : "",
                                        "cursor-pointer"
                                    )}
                                    onClick={() => handleSelect(kb)}
                                >
                                    <TableCell className="font-medium">{kb.name}</TableCell>
                                    <TableCell>{kb.description || "—"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <div className={cn(
                                                "rounded-full w-2 h-2 mr-2",
                                                kb.is_active ? "bg-green-500" : "bg-red-500"
                                            )} />
                                            {kb.is_active ? "Active" : "Inactive"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(kb)
                                                    handleEditClick(kb)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(kb)
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

            {/* Create Knowledge Base Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Knowledge Base</DialogTitle>
                        <DialogDescription>
                            Add a new knowledge base to organize your information.
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
                                    placeholder="Enter knowledge base name"
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
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label htmlFor="is_active">Active</Label>
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

            {/* Edit Knowledge Base Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Knowledge Base</DialogTitle>
                        <DialogDescription>
                            Update the knowledge base details.
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
                                    placeholder="Enter knowledge base name"
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
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label htmlFor="edit-is_active">Active</Label>
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

            {/* Delete Knowledge Base Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Knowledge Base</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this knowledge base? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="font-medium">{selectedKnowledgeBase?.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedKnowledgeBase?.description}</p>
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