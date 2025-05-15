"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTemplate } from "@/hooks/use-template"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { TemplateManager } from "@/components/ai-configuration/template/template-manager"
import { TemplateEditor } from "@/components/ai-configuration/template/template-editor"
import { TemplateVersionHistory } from "@/components/ai-configuration/template/version-history"
import { TemplateTester } from "@/components/ai-configuration/template/template-tester"

interface TemplateModuleProps {
    widgetId?: number
}

export function TemplateModule({ widgetId }: TemplateModuleProps) {
    const [activeTab, setActiveTab] = useState("templates")

    const {
        isLoading,
        error,
        templates,
        selectedTemplate,
        setSelectedTemplate,
        versions,
        selectedVersion,
        setSelectedVersion,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        createVersion,
        activateVersion,
        deleteVersion,
        previewTemplate,
        detectPlaceholders,
    } = useTemplate({ widgetId })

    if (isLoading && templates.length === 0) {
        return (
            <div className="flex justify-center items-center p-12">
                <Spinner size="lg" className="mr-2" />
                <p>Loading template configuration...</p>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load template configuration. Please try refreshing the page.
                    <p className="mt-2">{error.message}</p>
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Prompt Template Module</CardTitle>
                    <CardDescription>
                        Define reusable templates for AI responses with dynamic placeholders
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="templates">Templates</TabsTrigger>
                            <TabsTrigger
                                value="editor"
                                disabled={!selectedTemplate}
                            >
                                Editor
                            </TabsTrigger>
                            <TabsTrigger
                                value="versions"
                                disabled={!selectedTemplate}
                            >
                                Version History
                            </TabsTrigger>
                            <TabsTrigger
                                value="test"
                                disabled={!selectedTemplate}
                            >
                                Test Template
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="templates" className="pt-4">
                            <TemplateManager
                                templates={templates}
                                selectedTemplate={selectedTemplate}
                                onSelect={setSelectedTemplate}
                                onCreate={createTemplate}
                                onUpdate={updateTemplate}
                                onDelete={deleteTemplate}
                            />
                        </TabsContent>

                        <TabsContent value="editor" className="pt-4">
                            {selectedTemplate ? (
                                <TemplateEditor
                                    template={selectedTemplate}
                                    onUpdate={updateTemplate}
                                    onCreateVersion={createVersion}
                                    detectPlaceholders={detectPlaceholders}
                                />
                            ) : (
                                <Alert>
                                    <AlertDescription>
                                        Please select a template first to view and edit its content.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>

                        <TabsContent value="versions" className="pt-4">
                            {selectedTemplate ? (
                                <TemplateVersionHistory
                                    template={selectedTemplate}
                                    versions={versions}
                                    selectedVersion={selectedVersion}
                                    onSelectVersion={setSelectedVersion}
                                    onActivateVersion={activateVersion}
                                    onDeleteVersion={deleteVersion}
                                />
                            ) : (
                                <Alert>
                                    <AlertDescription>
                                        Please select a template first to view its version history.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>

                        <TabsContent value="test" className="pt-4">
                            {selectedTemplate ? (
                                <TemplateTester
                                    template={selectedTemplate}
                                    onPreview={previewTemplate}
                                />
                            ) : (
                                <Alert>
                                    <AlertDescription>
                                        Please select a template first to test it.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
} 