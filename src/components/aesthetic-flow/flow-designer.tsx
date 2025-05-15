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
import { Plus, Edit, Trash2, Check, X, Box, Play } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { FlowCanvas } from "./flow-canvas"

interface FlowItem {
    id: string
    type: string
    position: { x: number, y: number }
    data: Record<string, any>
}

interface Flow {
    id: number
    name: string
    description: string | null
    type: string
    settings: Record<string, any>
    is_active: boolean
}

interface FlowDesignerProps {
    flows: Flow[]
    selectedFlow: Flow | null
    flowItems: FlowItem[]
    onSelect: (flow: Flow) => void
    onUpdateItems: (items: FlowItem[]) => void
    onCreate: (data: Omit<Flow, "id">) => Promise<Flow | undefined>
    onUpdate: (id: number, data: Partial<Omit<Flow, "id">>) => Promise<Flow | undefined>
    onDelete: (id: number) => Promise<boolean | undefined>
    onSave: (items: FlowItem[]) => Promise<boolean | undefined>
}

export function FlowDesigner({
    flows,
    selectedFlow,
    flowItems,
    onSelect,
    onUpdateItems,
    onCreate,
    onUpdate,
    onDelete,
    onSave,
}: FlowDesignerProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "support",
        is_active: true,
    })

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            type: "support",
            is_active: true,
        })
    }

    const handleCreateClick = () => {
        resetForm()
        setIsCreating(true)
    }

    const handleEditClick = (flow: Flow) => {
        setFormData({
            name: flow.name,
            description: flow.description || "",
            type: flow.type,
            is_active: flow.is_active,
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
                type: formData.type,
                settings: {
                    theme: "light",
                    transitions: "fade",
                    timeout: 3000
                },
                is_active: formData.is_active,
            })

            if (result) {
                setIsCreating(false)
                resetForm()
            }
        } catch (error) {
            console.error("Failed to create flow:", error)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedFlow) {
            return
        }

        try {
            const result = await onUpdate(selectedFlow.id, {
                name: formData.name,
                description: formData.description || null,
                type: formData.type,
                is_active: formData.is_active,
            })

            if (result) {
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Failed to update flow:", error)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!selectedFlow) {
            return
        }

        try {
            const result = await onDelete(selectedFlow.id)

            if (result) {
                setIsDeleting(false)
            }
        } catch (error) {
            console.error("Failed to delete flow:", error)
        }
    }

    const handleToggleActive = async (flow: Flow) => {
        try {
            await onUpdate(flow.id, {
                is_active: !flow.is_active,
            })
        } catch (error) {
            console.error("Failed to toggle flow status:", error)
            toast({
                title: "Error",
                description: "Failed to update flow status.",
                variant: "destructive",
            })
        }
    }

    const handleSaveFlowItems = async () => {
        if (!selectedFlow) return

        try {
            await onSave(flowItems)
            toast({
                title: "Flow saved",
                description: "The flow layout was saved successfully.",
            })
        } catch (error) {
            console.error("Failed to save flow items:", error)
            toast({
                title: "Error",
                description: "Failed to save flow layout.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Flow Designer</h3>
                <Button size="sm" onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flow
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    {flows.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                <div className="mb-4 rounded-full bg-muted p-3">
                                    <Box className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-medium mb-2">No Flows</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Create your first flow to design your AI-powered conversation flow.
                                </p>
                                <Button onClick={handleCreateClick}>Create Flow</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[80px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {flows.map((flow) => (
                                        <TableRow
                                            key={flow.id}
                                            className={cn(
                                                selectedFlow?.id === flow.id ? "bg-muted/50" : "",
                                                "cursor-pointer"
                                            )}
                                            onClick={() => onSelect(flow)}
                                        >
                                            <TableCell className="font-medium">{flow.name}</TableCell>
                                            <TableCell>
                                                <span className="capitalize">{flow.type}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Switch
                                                        checked={flow.is_active}
                                                        onCheckedChange={() => handleToggleActive(flow)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mr-2"
                                                    />
                                                    <span>{flow.is_active ? "Active" : "Inactive"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onSelect(flow)
                                                            handleEditClick(flow)
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onSelect(flow)
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
                </div>

                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardContent className="p-6">
                            {selectedFlow ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">{selectedFlow.name}</h3>
                                        <Button size="sm" onClick={handleSaveFlowItems}>
                                            <Play className="mr-2 h-4 w-4" />
                                            Save Flow
                                        </Button>
                                    </div>
                                    <div className="h-[400px] border rounded-md">
                                        <FlowCanvas
                                            flowItems={flowItems}
                                            onChange={onUpdateItems}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <Box className="h-12 w-12 mb-4 text-muted-foreground" />
                                    <h3 className="text-xl font-medium mb-2">No Flow Selected</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Select a flow from the list or create a new one to start designing.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Flow Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Flow</DialogTitle>
                        <DialogDescription>
                            Add a new flow to design your AI-powered conversation flow.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Flow Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter flow name"
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
                                <Label htmlFor="type">Flow Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select flow type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="support">Support</SelectItem>
                                        <SelectItem value="recommendation">Recommendation</SelectItem>
                                        <SelectItem value="onboarding">Onboarding</SelectItem>
                                        <SelectItem value="survey">Survey</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
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

            {/* Edit Flow Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Flow</DialogTitle>
                        <DialogDescription>
                            Update flow details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Flow Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter flow name"
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
                            <div className="space-y-2">
                                <Label htmlFor="edit-type">Flow Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger id="edit-type">
                                        <SelectValue placeholder="Select flow type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="support">Support</SelectItem>
                                        <SelectItem value="recommendation">Recommendation</SelectItem>
                                        <SelectItem value="onboarding">Onboarding</SelectItem>
                                        <SelectItem value="survey">Survey</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
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

            {/* Delete Flow Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Flow</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this flow? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="font-medium">{selectedFlow?.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedFlow?.description}</p>
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