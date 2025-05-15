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
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface BrandingSetting {
    id: number
    name: string
    logo_url: string | null
    colors: Record<string, string>
    typography: Record<string, string>
    elements: Record<string, string>
    is_active: boolean
    is_default: boolean
}

interface BrandingManagerProps {
    settings: BrandingSetting[]
    selectedSetting: BrandingSetting | null
    onSelect: (setting: BrandingSetting | null) => void
    onCreate: (data: Omit<BrandingSetting, "id">) => Promise<BrandingSetting | undefined>
    onUpdate: (id: number, data: Partial<Omit<BrandingSetting, "id">>) => Promise<BrandingSetting | undefined>
    onDelete: (id: number) => Promise<boolean | undefined>
}

export function BrandingManager({
    settings,
    selectedSetting,
    onSelect,
    onCreate,
    onUpdate,
    onDelete,
}: BrandingManagerProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        logo_url: "",
        is_active: true,
        is_default: false,
    })

    const resetForm = () => {
        setFormData({
            name: "",
            logo_url: "",
            is_active: true,
            is_default: false,
        })
    }

    const handleCreateClick = () => {
        resetForm()
        setIsCreating(true)
    }

    const handleEditClick = (setting: BrandingSetting) => {
        setFormData({
            name: setting.name,
            logo_url: setting.logo_url || "",
            is_active: setting.is_active,
            is_default: setting.is_default,
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
                logo_url: formData.logo_url || null,
                colors: {
                    primary: "#0070f3",
                    secondary: "#1a1a1a",
                    accent: "#f5f5f5",
                    background: "#ffffff",
                    text: "#000000",
                },
                typography: {
                    fontFamily: "system-ui, sans-serif",
                    headingFontFamily: "system-ui, sans-serif",
                    fontSize: "16px",
                    headingScale: "1.25",
                },
                elements: {
                    borderRadius: "4px",
                    buttonStyle: "filled",
                    shadows: "medium",
                    spacing: "default",
                },
                is_active: formData.is_active,
                is_default: formData.is_default,
            })

            if (result) {
                setIsCreating(false)
                resetForm()
            }
        } catch (error) {
            console.error("Failed to create branding setting:", error)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedSetting) {
            return
        }

        try {
            const result = await onUpdate(selectedSetting.id, {
                name: formData.name,
                logo_url: formData.logo_url || null,
                is_active: formData.is_active,
                is_default: formData.is_default,
            })

            if (result) {
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Failed to update branding setting:", error)
        }
    }

    const handleDeleteSubmit = async () => {
        if (!selectedSetting) {
            return
        }

        try {
            const result = await onDelete(selectedSetting.id)

            if (result) {
                setIsDeleting(false)
            }
        } catch (error) {
            console.error("Failed to delete branding setting:", error)
        }
    }

    const handleToggleActive = async (setting: BrandingSetting) => {
        try {
            await onUpdate(setting.id, {
                is_active: !setting.is_active,
            })
        } catch (error) {
            console.error("Failed to toggle setting status:", error)
            toast({
                title: "Error",
                description: "Failed to update setting status.",
                variant: "destructive",
            })
        }
    }

    const handleToggleDefault = async (setting: BrandingSetting) => {
        try {
            await onUpdate(setting.id, {
                is_default: !setting.is_default,
            })
        } catch (error) {
            console.error("Failed to toggle default status:", error)
            toast({
                title: "Error",
                description: "Failed to update default status.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h3 className="text-lg font-medium">Branding Settings</h3>
                <Button size="sm" onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Setting
                </Button>
            </div>

            {settings.length === 0 ? (
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-muted p-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                            >
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium mb-2">No Branding Settings</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create your first branding setting to customize the appearance of your AI-powered widgets.
                        </p>
                        <Button onClick={handleCreateClick}>Create Setting</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Logo URL</TableHead>
                                <TableHead>Default</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settings.map((setting) => (
                                <TableRow
                                    key={setting.id}
                                    className={cn(
                                        selectedSetting?.id === setting.id ? "bg-muted/50" : "",
                                        "cursor-pointer"
                                    )}
                                    onClick={() => onSelect(setting)}
                                >
                                    <TableCell className="font-medium">{setting.name}</TableCell>
                                    <TableCell>
                                        {setting.logo_url ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="h-8 w-8 relative">
                                                    <img
                                                        src={setting.logo_url}
                                                        alt={setting.name}
                                                        className="h-full w-full object-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none'
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs truncate max-w-[150px]">{setting.logo_url}</span>
                                            </div>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Switch
                                                checked={setting.is_default}
                                                onCheckedChange={() => handleToggleDefault(setting)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mr-2"
                                            />
                                            {setting.is_default ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Switch
                                                checked={setting.is_active}
                                                onCheckedChange={() => handleToggleActive(setting)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mr-2"
                                            />
                                            <span>{setting.is_active ? "Active" : "Inactive"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(setting)
                                                    handleEditClick(setting)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelect(setting)
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

            {/* Create Setting Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Branding Setting</DialogTitle>
                        <DialogDescription>
                            Add a new branding setting to customize the appearance of your AI-powered widgets.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Setting Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter setting name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo_url">Logo URL</Label>
                                <Input
                                    id="logo_url"
                                    value={formData.logo_url}
                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder="Enter logo URL (optional)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 flex items-end">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_default"
                                            checked={formData.is_default}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                                        />
                                        <Label htmlFor="is_default">Default Setting</Label>
                                    </div>
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

            {/* Edit Setting Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Branding Setting</DialogTitle>
                        <DialogDescription>
                            Update branding setting details. Colors and typography can be edited in the Brand Editor tab.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Setting Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter setting name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-logo_url">Logo URL</Label>
                                <Input
                                    id="edit-logo_url"
                                    value={formData.logo_url}
                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder="Enter logo URL (optional)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 flex items-end">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="edit-is_default"
                                            checked={formData.is_default}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                                        />
                                        <Label htmlFor="edit-is_default">Default Setting</Label>
                                    </div>
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

            {/* Delete Setting Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Branding Setting</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this branding setting? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="font-medium">{selectedSetting?.name}</p>
                        {selectedSetting?.is_default && (
                            <p className="text-sm text-yellow-500 mt-2">
                                Warning: This is your default branding setting. If deleted, another setting will be set as default if available.
                            </p>
                        )}
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