"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tag, Plus, Save, Wand, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Template {
    id: number
    name: string
    description: string | null
    content: string
    placeholders: Record<string, TemplateVariable>
    settings: Record<string, any>
    priority: number
    is_active: boolean
}

interface TemplateVariable {
    name: string
    description: string
    default_value: string
    required: boolean
}

interface TemplateEditorProps {
    template: Template
    onUpdate: (id: number, data: Partial<Omit<Template, "id">>) => Promise<Template | undefined>
    onCreateVersion: (templateId: number, data: any) => Promise<any>
    detectPlaceholders: (content: string) => Promise<Record<string, TemplateVariable>>
}

export function TemplateEditor({
    template,
    onUpdate,
    onCreateVersion,
    detectPlaceholders,
}: TemplateEditorProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [content, setContent] = useState(template.content)
    const [placeholders, setPlaceholders] = useState<Record<string, TemplateVariable>>(template.placeholders || {})
    const [isEditingPlaceholder, setIsEditingPlaceholder] = useState(false)
    const [currentPlaceholder, setCurrentPlaceholder] = useState<string>("")
    const [placeholderData, setPlaceholderData] = useState<TemplateVariable>({
        name: "",
        description: "",
        default_value: "",
        required: true
    })
    const [showVersionDialog, setShowVersionDialog] = useState(false)
    const [versionName, setVersionName] = useState("")
    const [changeNotes, setChangeNotes] = useState("")
    const [isVersionActive, setIsVersionActive] = useState(false)

    // Update content when template changes
    useEffect(() => {
        setContent(template.content)
        setPlaceholders(template.placeholders || {})
    }, [template])

    const handleUpdateContent = async () => {
        try {
            setIsLoading(true)

            await onUpdate(template.id, {
                content,
                placeholders
            })

            toast({
                title: "Template updated",
                description: "The template content was updated successfully.",
            })
        } catch (error) {
            console.error("Failed to update template content:", error)

            toast({
                title: "Error",
                description: "Failed to update template content.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateVersion = async () => {
        try {
            setIsLoading(true)

            await onCreateVersion(template.id, {
                content,
                placeholders,
                version_name: versionName || `Version ${new Date().toLocaleString()}`,
                change_notes: changeNotes,
                is_active: isVersionActive
            })

            setShowVersionDialog(false)
            setVersionName("")
            setChangeNotes("")
            setIsVersionActive(false)

            toast({
                title: "Version created",
                description: "The template version was created successfully.",
            })
        } catch (error) {
            console.error("Failed to create version:", error)

            toast({
                title: "Error",
                description: "Failed to create version.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAutoDetectPlaceholders = async () => {
        try {
            setIsLoading(true)

            const detectedPlaceholders = await detectPlaceholders(content)

            // Merge with existing placeholders to preserve metadata
            const mergedPlaceholders: Record<string, TemplateVariable> = { ...detectedPlaceholders }

            // Keep existing placeholder data for ones we already have
            Object.keys(mergedPlaceholders).forEach(key => {
                if (placeholders[key]) {
                    mergedPlaceholders[key] = {
                        ...mergedPlaceholders[key],
                        description: placeholders[key].description || mergedPlaceholders[key].description,
                        default_value: placeholders[key].default_value || mergedPlaceholders[key].default_value,
                        required: placeholders[key].required !== undefined ? placeholders[key].required : mergedPlaceholders[key].required
                    }
                }
            })

            setPlaceholders(mergedPlaceholders)

            toast({
                title: "Placeholders detected",
                description: `Detected ${Object.keys(mergedPlaceholders).length} placeholders from template.`,
            })
        } catch (error) {
            console.error("Failed to detect placeholders:", error)

            toast({
                title: "Error",
                description: "Failed to detect placeholders.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditPlaceholder = (name: string) => {
        setCurrentPlaceholder(name)
        setPlaceholderData(placeholders[name])
        setIsEditingPlaceholder(true)
    }

    const handleSavePlaceholder = () => {
        const updatedPlaceholders = { ...placeholders }
        updatedPlaceholders[currentPlaceholder] = placeholderData
        setPlaceholders(updatedPlaceholders)
        setIsEditingPlaceholder(false)
    }

    const handleDeletePlaceholder = (name: string) => {
        const updatedPlaceholders = { ...placeholders }
        delete updatedPlaceholders[name]
        setPlaceholders(updatedPlaceholders)
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="placeholders">Placeholders ({Object.keys(placeholders).length})</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter template content with {{placeholders}}"
                                    rows={15}
                                    className="font-mono"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use double curly braces for placeholders, e.g. {{ name }} or {{ context }}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={handleAutoDetectPlaceholders}
                                disabled={isLoading}
                            >
                                <Wand className="mr-2 h-4 w-4" />
                                Detect Placeholders
                            </Button>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowVersionDialog(true)}
                                    disabled={isLoading}
                                >
                                    Save as Version
                                </Button>
                                <Button
                                    onClick={handleUpdateContent}
                                    disabled={isLoading}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="placeholders" className="pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Template Placeholders</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAutoDetectPlaceholders}
                                disabled={isLoading}
                            >
                                <Wand className="mr-2 h-4 w-4" />
                                Detect Placeholders
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(placeholders).length === 0 ? (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        No placeholders found in template. Add placeholders with double curly braces in the content, e.g. {{ name }}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(placeholders).map(([name, data]) => (
                                        <div
                                            key={name}
                                            className="border rounded-md p-4 space-y-2"
                                            onClick={() => handleEditPlaceholder(name)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Tag className="h-4 w-4 mr-2 text-blue-500" />
                                                    <span className="font-medium">{{ name }}</span>
                                                </div>
                                                <Badge variant={data.required ? "default" : "outline"}>
                                                    {data.required ? "Required" : "Optional"}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {data.description || <span className="italic">No description</span>}
                                            </div>
                                            {data.default_value && (
                                                <div className="text-sm">
                                                    <span className="font-medium">Default:</span> {data.default_value}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button
                                onClick={handleUpdateContent}
                                disabled={isLoading}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Placeholder Dialog */}
            <Dialog open={isEditingPlaceholder} onOpenChange={setIsEditingPlaceholder}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Placeholder</DialogTitle>
                        <DialogDescription>
                            Configure details for the {{ currentPlaceholder }} placeholder.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="placeholder-description">Description</Label>
                            <Input
                                id="placeholder-description"
                                value={placeholderData.description}
                                onChange={(e) => setPlaceholderData({ ...placeholderData, description: e.target.value })}
                                placeholder="Enter a description for this placeholder"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="placeholder-default">Default Value</Label>
                            <Input
                                id="placeholder-default"
                                value={placeholderData.default_value}
                                onChange={(e) => setPlaceholderData({ ...placeholderData, default_value: e.target.value })}
                                placeholder="Enter a default value (optional)"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="placeholder-required"
                                checked={placeholderData.required}
                                onChange={(e) => setPlaceholderData({ ...placeholderData, required: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="placeholder-required">Required</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditingPlaceholder(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSavePlaceholder}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Version Dialog */}
            <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Version</DialogTitle>
                        <DialogDescription>
                            Save your changes as a new version of this template.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="version-name">Version Name</Label>
                            <Input
                                id="version-name"
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                                placeholder="Enter a name for this version (optional)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="change-notes">Change Notes</Label>
                            <Textarea
                                id="change-notes"
                                value={changeNotes}
                                onChange={(e) => setChangeNotes(e.target.value)}
                                placeholder="Describe the changes in this version (optional)"
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="version-active"
                                checked={isVersionActive}
                                onChange={(e) => setIsVersionActive(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="version-active">Make this the active version</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowVersionDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateVersion} disabled={isLoading}>
                            Create Version
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 