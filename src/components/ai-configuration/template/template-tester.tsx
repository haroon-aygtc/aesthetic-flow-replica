"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Play, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface TemplateTesterProps {
    template: Template
    onPreview: (templateId: number, data: Record<string, any>) => Promise<string>
}

export function TemplateTester({
    template,
    onPreview,
}: TemplateTesterProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})
    const [previewResult, setPreviewResult] = useState<string>("")
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    // Initialize placeholder values with defaults
    useEffect(() => {
        const initialValues: Record<string, string> = {}

        if (template.placeholders) {
            Object.entries(template.placeholders).forEach(([key, data]) => {
                initialValues[key] = data.default_value || ""
            })
        }

        setPlaceholderValues(initialValues)
        setPreviewResult("")
        setHasError(false)
        setErrorMessage("")
    }, [template])

    const handleInputChange = (key: string, value: string) => {
        setPlaceholderValues({
            ...placeholderValues,
            [key]: value
        })
    }

    const handleGeneratePreview = async () => {
        // Check if all required placeholders have values
        const missingRequired = Object.entries(template.placeholders || {})
            .filter(([key, data]) => data.required && !placeholderValues[key])
            .map(([key]) => key)

        if (missingRequired.length > 0) {
            setHasError(true)
            setErrorMessage(`Please fill in all required placeholders: ${missingRequired.join(", ")}`)
            return
        }

        try {
            setIsLoading(true)
            setHasError(false)
            setErrorMessage("")

            const result = await onPreview(template.id, placeholderValues)
            setPreviewResult(result)
        } catch (error) {
            console.error("Failed to preview template:", error)
            setHasError(true)
            setErrorMessage("Failed to generate preview. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const hasPlaceholders = template.placeholders && Object.keys(template.placeholders).length > 0

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Test Template</CardTitle>
                    <CardDescription>
                        Fill in placeholder values to see how the template will render
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!hasPlaceholders ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                This template has no placeholders. Go to the Editor tab to add placeholders.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-6">
                            <Tabs defaultValue="input">
                                <TabsList>
                                    <TabsTrigger value="input">Input Values</TabsTrigger>
                                    <TabsTrigger value="preview">Preview Result</TabsTrigger>
                                </TabsList>

                                <TabsContent value="input" className="pt-4 space-y-4">
                                    {hasError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{errorMessage}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(template.placeholders || {}).map(([key, data]) => (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={`placeholder-${key}`} className="flex items-center">
                                                    <span>{{ key }}</span>
                                                    {data.required && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </Label>
                                                {data.description && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {data.description}
                                                    </p>
                                                )}
                                                {key.includes("context") || key.includes("content") || key.includes("description") ? (
                                                    <Textarea
                                                        id={`placeholder-${key}`}
                                                        value={placeholderValues[key] || ""}
                                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                                        placeholder={data.default_value || `Enter value for ${key}`}
                                                        rows={4}
                                                    />
                                                ) : (
                                                    <Input
                                                        id={`placeholder-${key}`}
                                                        value={placeholderValues[key] || ""}
                                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                                        placeholder={data.default_value || `Enter value for ${key}`}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleGeneratePreview}
                                            disabled={isLoading}
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Generate Preview
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="preview" className="pt-4">
                                    {previewResult ? (
                                        <div className="space-y-4">
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm flex items-center">
                                                        <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                                                        Rendered Template
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="whitespace-pre-wrap border rounded-md p-4 bg-muted/30">
                                                        {previewResult}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Button
                                                onClick={handleGeneratePreview}
                                                disabled={isLoading}
                                            >
                                                <Play className="mr-2 h-4 w-4" />
                                                Regenerate Preview
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                Fill in the placeholder values and click "Generate Preview" to see how your template will render.
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 