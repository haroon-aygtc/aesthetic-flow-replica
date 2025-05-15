"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock, CheckCircle2, Trash2, HistoryIcon, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

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

interface TemplateVersion {
    id: number
    template_id: number
    content: string
    placeholders: Record<string, any>
    settings: Record<string, any>
    version_name: string
    change_notes: string | null
    created_by: number | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface TemplateVersionHistoryProps {
    template: Template
    versions: TemplateVersion[]
    selectedVersion: TemplateVersion | null
    onSelectVersion: (version: TemplateVersion) => void
    onActivateVersion: (templateId: number, versionId: number) => Promise<any>
    onDeleteVersion: (templateId: number, versionId: number) => Promise<boolean | undefined>
}

export function TemplateVersionHistory({
    template,
    versions,
    selectedVersion,
    onSelectVersion,
    onActivateVersion,
    onDeleteVersion,
}: TemplateVersionHistoryProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showViewDialog, setShowViewDialog] = useState(false)

    const handleActivateVersion = async (version: TemplateVersion) => {
        if (version.is_active) return

        try {
            setIsLoading(true)
            await onActivateVersion(template.id, version.id)
        } catch (error) {
            console.error("Failed to activate version:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteClick = (version: TemplateVersion) => {
        onSelectVersion(version)
        setShowDeleteDialog(true)
    }

    const handleViewClick = (version: TemplateVersion) => {
        onSelectVersion(version)
        setShowViewDialog(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedVersion) return

        try {
            setIsLoading(true)
            const result = await onDeleteVersion(template.id, selectedVersion.id)
            if (result) {
                setShowDeleteDialog(false)
            }
        } catch (error) {
            console.error("Failed to delete version:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Version History</h3>
                </div>
            </div>

            {versions.length === 0 ? (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No versions found for this template. Create a version by saving changes from the Editor tab.
                    </AlertDescription>
                </Alert>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Template Versions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Date Created</TableHead>
                                    <TableHead>Change Notes</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {versions.map((version) => (
                                    <TableRow
                                        key={version.id}
                                        className={cn(
                                            selectedVersion?.id === version.id ? "bg-muted/50" : "",
                                            "cursor-pointer"
                                        )}
                                        onClick={() => onSelectVersion(version)}
                                    >
                                        <TableCell className="font-medium">{version.version_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {format(new Date(version.created_at), "MMM d, yyyy h:mm a")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {version.change_notes || <span className="text-muted-foreground italic">No notes</span>}
                                        </TableCell>
                                        <TableCell>
                                            {version.is_active ? (
                                                <Badge>Active</Badge>
                                            ) : (
                                                <Badge variant="outline">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleViewClick(version)
                                                    }}
                                                    title="View Content"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {!version.is_active && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleActivateVersion(version)
                                                        }}
                                                        disabled={isLoading}
                                                        title="Activate Version"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {!version.is_active && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteClick(version)
                                                        }}
                                                        disabled={isLoading}
                                                        title="Delete Version"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* View Version Dialog */}
            {selectedVersion && (
                <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{selectedVersion.version_name}</DialogTitle>
                            <DialogDescription>
                                {selectedVersion.change_notes ? (
                                    selectedVersion.change_notes
                                ) : (
                                    "No change notes for this version."
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <div className="border rounded-md p-4 bg-muted/30 font-mono text-sm whitespace-pre-wrap">
                                {selectedVersion.content}
                            </div>
                            {Object.keys(selectedVersion.placeholders || {}).length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2">Placeholders:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(selectedVersion.placeholders || {}).map((key) => (
                                            <Badge key={key} variant="secondary">
                                                {{ key }}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            {!selectedVersion.is_active && (
                                <Button
                                    onClick={() => handleActivateVersion(selectedVersion)}
                                    disabled={isLoading}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Make Active
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Version Dialog */}
            {selectedVersion && (
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Version</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this version? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p><strong>Version:</strong> {selectedVersion.version_name}</p>
                            {selectedVersion.change_notes && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    <strong>Notes:</strong> {selectedVersion.change_notes}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={isLoading}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
} 