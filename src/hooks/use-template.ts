import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useGraphQL } from "@/hooks/use-graphql"

interface Template {
    id: number
    name: string
    description: string | null
    content: string
    placeholders: Record<string, TemplateVariable>
    settings: Record<string, any>
    priority: number
    is_active: boolean
    versions?: TemplateVersion[]
}

interface TemplateVariable {
    name: string
    description: string
    default_value: string
    required: boolean
}

interface TemplateVersion {
    id: number
    template_id: number
    content: string
    placeholders: Record<string, TemplateVariable>
    settings: Record<string, any>
    version_name: string
    change_notes: string | null
    created_by: number | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface UseTemplateProps {
    widgetId?: number
    initialTemplateId?: number
}

export function useTemplate({
    widgetId,
    initialTemplateId,
}: UseTemplateProps = {}) {
    const { toast } = useToast()
    const { client } = useGraphQL()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [templates, setTemplates] = useState<Template[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [versions, setVersions] = useState<TemplateVersion[]>([])
    const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null)

    // Load templates
    useEffect(() => {
        async function loadTemplates() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await client.templatesQuery({})

                if (response.data?.templates) {
                    setTemplates(response.data.templates)

                    // Set the initial template if provided
                    if (initialTemplateId && response.data.templates.length) {
                        const initialTemplate = response.data.templates.find(
                            template => template.id === initialTemplateId
                        )
                        if (initialTemplate) {
                            setSelectedTemplate(initialTemplate)
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load templates:", err)
                setError(err instanceof Error ? err : new Error("Failed to load templates"))
            } finally {
                setIsLoading(false)
            }
        }

        loadTemplates()
    }, [client, initialTemplateId])

    // Load widget templates if widgetId is provided
    useEffect(() => {
        if (!widgetId) return

        async function loadWidgetTemplates() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await client.widgetTemplatesQuery({
                    widget_id: widgetId
                })

                if (response.data?.widgetTemplates) {
                    setTemplates(response.data.widgetTemplates)

                    // Set the initial template if provided
                    if (initialTemplateId && response.data.widgetTemplates.length) {
                        const initialTemplate = response.data.widgetTemplates.find(
                            template => template.id === initialTemplateId
                        )
                        if (initialTemplate) {
                            setSelectedTemplate(initialTemplate)
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load widget templates:", err)
                setError(err instanceof Error ? err : new Error("Failed to load widget templates"))
            } finally {
                setIsLoading(false)
            }
        }

        loadWidgetTemplates()
    }, [client, widgetId, initialTemplateId])

    // Load template versions when a template is selected
    useEffect(() => {
        if (!selectedTemplate) {
            setVersions([])
            setSelectedVersion(null)
            return
        }

        async function loadVersions() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await client.templateVersionsQuery({
                    template_id: selectedTemplate.id
                })

                if (response.data?.templateVersions) {
                    setVersions(response.data.templateVersions)

                    // Set the active version if available
                    const activeVersion = response.data.templateVersions.find(
                        version => version.is_active
                    )
                    if (activeVersion) {
                        setSelectedVersion(activeVersion)
                    } else if (response.data.templateVersions.length > 0) {
                        // Otherwise select the most recent version
                        setSelectedVersion(response.data.templateVersions[0])
                    }
                }
            } catch (err) {
                console.error("Failed to load versions:", err)
                setError(err instanceof Error ? err : new Error("Failed to load versions"))
            } finally {
                setIsLoading(false)
            }
        }

        loadVersions()
    }, [client, selectedTemplate])

    // Create a new template
    const createTemplate = async (data: Omit<Template, "id">) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.createTemplateMutation({
                input: data
            })

            if (response.data?.createTemplate) {
                setTemplates([...templates, response.data.createTemplate])
                setSelectedTemplate(response.data.createTemplate)

                toast({
                    title: "Template created",
                    description: "The template was created successfully.",
                })

                return response.data.createTemplate
            }
        } catch (err) {
            console.error("Failed to create template:", err)
            setError(err instanceof Error ? err : new Error("Failed to create template"))

            toast({
                title: "Error",
                description: "Failed to create template.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Update a template
    const updateTemplate = async (id: number, data: Partial<Omit<Template, "id">>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.updateTemplateMutation({
                id,
                input: data
            })

            if (response.data?.updateTemplate) {
                const updatedTemplate = response.data.updateTemplate

                // Update the templates list
                setTemplates(templates.map(template =>
                    template.id === updatedTemplate.id ? updatedTemplate : template
                ))

                // Update the selected template if it's the one being updated
                if (selectedTemplate?.id === updatedTemplate.id) {
                    setSelectedTemplate(updatedTemplate)
                }

                toast({
                    title: "Template updated",
                    description: "The template was updated successfully.",
                })

                return updatedTemplate
            }
        } catch (err) {
            console.error("Failed to update template:", err)
            setError(err instanceof Error ? err : new Error("Failed to update template"))

            toast({
                title: "Error",
                description: "Failed to update template.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a template
    const deleteTemplate = async (id: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.deleteTemplateMutation({
                id
            })

            if (response.data?.deleteTemplate) {
                // Remove the template from the list
                setTemplates(templates.filter(template => template.id !== id))

                // Clear the selected template if it's the one being deleted
                if (selectedTemplate?.id === id) {
                    setSelectedTemplate(null)
                    setVersions([])
                    setSelectedVersion(null)
                }

                toast({
                    title: "Template deleted",
                    description: "The template was deleted successfully.",
                })

                return true
            }
        } catch (err) {
            console.error("Failed to delete template:", err)
            setError(err instanceof Error ? err : new Error("Failed to delete template"))

            toast({
                title: "Error",
                description: "Failed to delete template.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Create a new template version
    const createVersion = async (templateId: number, data: Partial<Omit<TemplateVersion, "id" | "template_id">>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.createTemplateVersionMutation({
                template_id: templateId,
                input: data
            })

            if (response.data?.createTemplateVersion) {
                setVersions([response.data.createTemplateVersion, ...versions])
                setSelectedVersion(response.data.createTemplateVersion)

                toast({
                    title: "Version created",
                    description: "The template version was created successfully.",
                })

                return response.data.createTemplateVersion
            }
        } catch (err) {
            console.error("Failed to create version:", err)
            setError(err instanceof Error ? err : new Error("Failed to create version"))

            toast({
                title: "Error",
                description: "Failed to create version.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Activate a template version
    const activateVersion = async (templateId: number, versionId: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.activateTemplateVersionMutation({
                template_id: templateId,
                version_id: versionId
            })

            if (response.data?.activateTemplateVersion) {
                // Update the versions list
                setVersions(versions.map(version => ({
                    ...version,
                    is_active: version.id === versionId
                })))

                // Update the selected version if it's the one being activated
                if (selectedVersion?.id === versionId) {
                    setSelectedVersion({
                        ...selectedVersion,
                        is_active: true
                    })
                }

                toast({
                    title: "Version activated",
                    description: "The template version was activated successfully.",
                })

                return response.data.activateTemplateVersion
            }
        } catch (err) {
            console.error("Failed to activate version:", err)
            setError(err instanceof Error ? err : new Error("Failed to activate version"))

            toast({
                title: "Error",
                description: "Failed to activate version.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a template version
    const deleteVersion = async (templateId: number, versionId: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.deleteTemplateVersionMutation({
                template_id: templateId,
                version_id: versionId
            })

            if (response.data?.deleteTemplateVersion) {
                // Remove the version from the list
                setVersions(versions.filter(version => version.id !== versionId))

                // Clear the selected version if it's the one being deleted
                if (selectedVersion?.id === versionId) {
                    setSelectedVersion(versions.find(version => version.id !== versionId) || null)
                }

                toast({
                    title: "Version deleted",
                    description: "The template version was deleted successfully.",
                })

                return true
            }
        } catch (err) {
            console.error("Failed to delete version:", err)
            setError(err instanceof Error ? err : new Error("Failed to delete version"))

            toast({
                title: "Error",
                description: "Failed to delete version.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Associate a template with a widget
    const associateWithWidget = async (templateId: number, widgetId: number, settings: Record<string, any> = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.associateTemplateWithWidgetMutation({
                template_id: templateId,
                widget_id: widgetId,
                settings
            })

            if (response.data?.associateTemplateWithWidget) {
                toast({
                    title: "Template associated",
                    description: "The template was associated with the widget successfully.",
                })

                return response.data.associateTemplateWithWidget
            }
        } catch (err) {
            console.error("Failed to associate template:", err)
            setError(err instanceof Error ? err : new Error("Failed to associate template"))

            toast({
                title: "Error",
                description: "Failed to associate template with widget.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Dissociate a template from a widget
    const dissociateFromWidget = async (templateId: number, widgetId: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.dissociateTemplateFromWidgetMutation({
                template_id: templateId,
                widget_id: widgetId
            })

            if (response.data?.dissociateTemplateFromWidget) {
                toast({
                    title: "Template dissociated",
                    description: "The template was dissociated from the widget successfully.",
                })

                return response.data.dissociateTemplateFromWidget
            }
        } catch (err) {
            console.error("Failed to dissociate template:", err)
            setError(err instanceof Error ? err : new Error("Failed to dissociate template"))

            toast({
                title: "Error",
                description: "Failed to dissociate template from widget.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Preview a template with data
    const previewTemplate = async (templateId: number, data: Record<string, any> = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.previewTemplateMutation({
                id: templateId,
                data
            })

            if (response.data?.previewTemplate) {
                return response.data.previewTemplate.rendered
            }
        } catch (err) {
            console.error("Failed to preview template:", err)
            setError(err instanceof Error ? err : new Error("Failed to preview template"))

            toast({
                title: "Error",
                description: "Failed to preview template.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Detect placeholders in content
    const detectPlaceholders = async (content: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.detectPlaceholdersMutation({
                content
            })

            if (response.data?.detectPlaceholders) {
                return response.data.detectPlaceholders.placeholders
            }
        } catch (err) {
            console.error("Failed to detect placeholders:", err)
            setError(err instanceof Error ? err : new Error("Failed to detect placeholders"))

            toast({
                title: "Error",
                description: "Failed to detect placeholders.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return {
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
        associateWithWidget,
        dissociateFromWidget,
        previewTemplate,
        detectPlaceholders,
    }
}