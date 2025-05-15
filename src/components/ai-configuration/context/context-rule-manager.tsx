"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Check, X, FileCog } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ContextRule {
    id: number
    name: string
    description: string | null
    conditions: Record<string, any>[]
    settings: Record<string, any>
    priority: number
    is_active: boolean
}

interface ContextRuleManagerProps {
    rules: ContextRule[]
    selectedRule: ContextRule | null
    onSelect: (rule: ContextRule | null) => void
    onCreate: (data: Omit<ContextRule, "id">) => Promise<ContextRule | undefined>
    onUpdate: (id: number, data: Partial<Omit<ContextRule, "id">>) => Promise<ContextRule | undefined>
    onDelete: (id: number) => Promise<boolean | undefined>
}

export function ContextRuleManager({
    rules,
    selectedRule,
    onSelect,
    onCreate,
    onUpdate,
    onDelete,
}: ContextRuleManagerProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        priority: 0,
        is_active: true,
    })

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            priority: 0,
            is_active: true,
        })
    }

    const handleCreateClick = () => {
        resetForm()
        setIsCreating(true)
    }

    const handleEditClick = (rule: ContextRule) => {
        setFormData({
            name: rule.name,
            description: rule.description || "",
            priority: rule.priority,
            is_active: rule.is_active,
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
                conditions: [],
                settings: {},
                priority: formData.priority,
                is_active: formData.is_active,
            })

            if (result) {
                setIsCreating(false)
                resetForm()
            }
        } catch (error) {
            console.error("Failed to create context rule:", error)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedRule) {
            return
        }

        try {
            const result = await onUpdate(selectedRule.id, {
                name: formData.name,
                description: formData.description || null,
                priority: formData.priority,
                is_active: formData.is_active,
            })

            if (result) {
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Failed to update context rule:", error)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!selectedRule) {
            return
        }

        try {
            const result = await onDelete(selectedRule.id)

            if (result) {
                setIsDeleting(false)
            }
        } catch (error) {
            console.error("Failed to delete context rule:", error)
        }
    }

    const handleToggleActive = async (rule: ContextRule) => {
        try {
            await onUpdate(rule.id, {
                is_active: !rule.is_active,
            })
        } catch (error) {
            console.error("Failed to toggle rule status:", error)
            toast({
                title: "Error",
                description: "Failed to update rule status.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Context Rules</h3>
                <Button size="sm" onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rule
                </Button>
            </div>

            {rules.length === 0 ? (
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-muted p-3">
                            <FileCog className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No Context Rules</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create your first context rule to enhance AI responses with contextual awareness.
                        </p>
                        <Button onClick={handleCreateClick}>Create Rule</Button>
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
                                <TableHead className="w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow
                                    key={rule.id}
                                    className={cn(
                                        selectedRule?.id === rule.id ? "bg-muted/50" : "",
                                        "cursor-pointer"
                                    )}
                                    onClick={() => onSelect(rule)}
                                >
                                    <TableCell className="font-medium">{rule.name}</TableCell>
                                    <TableCell>{rule.description || "—"}</TableCell>
                                    <TableCell>{rule.priority}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Switch
                                                checked={rule.is_active}
                                                onCheckedChange={() => handleToggleActive(rule)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mr-2"
                                            />
                                            <span>{rule.is_active ? "Active" : "Inactive"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(rule)
                                                    handleEditClick(rule)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(rule)
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

            {/* Create Rule Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Context Rule</DialogTitle>
                        <DialogDescription>
                            Add a new context rule to enhance AI responses with contextual awareness.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Rule Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter rule name"
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
                                    <p className="text-xs text-muted-foreground">
                                        Higher priority rules are evaluated first
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

            {/* Edit Rule Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Context Rule</DialogTitle>
                        <DialogDescription>
                            Update context rule details. Conditions can be edited in the Rule Editor tab.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Rule Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter rule name"
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

            {/* Delete Rule Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Context Rule</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this context rule? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="font-medium">{selectedRule?.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedRule?.description}</p>
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