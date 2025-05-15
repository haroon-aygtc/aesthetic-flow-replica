import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useGraphQL } from "@/hooks/use-graphql"

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

interface UseBrandingProps {
    widgetId?: number
    initialSettingId?: number
}

export function useBranding({
    widgetId,
    initialSettingId,
}: UseBrandingProps = {}) {
    const { toast } = useToast()
    const { client } = useGraphQL()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [settings, setSettings] = useState<BrandingSetting[]>([])
    const [selectedSetting, setSelectedSetting] = useState<BrandingSetting | null>(null)
    const [widgetBranding, setWidgetBranding] = useState<Record<string, any> | null>(null)
    const [widgetCss, setWidgetCss] = useState<string | null>(null)

    // Load settings
    useEffect(() => {
        async function loadSettings() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await client.brandingSettingsQuery({})

                if (response.data?.brandingSettings) {
                    setSettings(response.data.brandingSettings)

                    // Set the initial setting if provided
                    if (initialSettingId && response.data.brandingSettings.length) {
                        const initialSetting = response.data.brandingSettings.find(
                            setting => setting.id === initialSettingId
                        )
                        if (initialSetting) {
                            setSelectedSetting(initialSetting)
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load branding settings:", err)
                setError(err instanceof Error ? err : new Error("Failed to load branding settings"))
            } finally {
                setIsLoading(false)
            }
        }

        loadSettings()
    }, [client, initialSettingId])

    // Load widget branding if widgetId is provided
    useEffect(() => {
        if (!widgetId) return

        async function loadWidgetBranding() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await client.widgetBrandingQuery({
                    widget_id: widgetId
                })

                if (response.data?.widgetBranding) {
                    setWidgetBranding(response.data.widgetBranding)
                }

                // Also load the CSS
                const cssResponse = await client.widgetBrandingCssQuery({
                    widget_id: widgetId
                })

                if (cssResponse.data?.widgetBrandingCss?.css) {
                    setWidgetCss(cssResponse.data.widgetBrandingCss.css)
                }
            } catch (err) {
                console.error("Failed to load widget branding:", err)
                setError(err instanceof Error ? err : new Error("Failed to load widget branding"))
            } finally {
                setIsLoading(false)
            }
        }

        loadWidgetBranding()
    }, [client, widgetId])

    // Create a new branding setting
    const createSetting = async (data: Omit<BrandingSetting, "id">) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.createBrandingSettingMutation({
                input: data
            })

            if (response.data?.createBrandingSetting) {
                setSettings([...settings, response.data.createBrandingSetting])
                setSelectedSetting(response.data.createBrandingSetting)

                toast({
                    title: "Setting created",
                    description: "The branding setting was created successfully.",
                })

                return response.data.createBrandingSetting
            }
        } catch (err) {
            console.error("Failed to create branding setting:", err)
            setError(err instanceof Error ? err : new Error("Failed to create branding setting"))

            toast({
                title: "Error",
                description: "Failed to create branding setting.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Update a branding setting
    const updateSetting = async (id: number, data: Partial<Omit<BrandingSetting, "id">>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.updateBrandingSettingMutation({
                id,
                input: data
            })

            if (response.data?.updateBrandingSetting) {
                const updatedSetting = response.data.updateBrandingSetting

                // Update the settings list
                setSettings(settings.map(setting =>
                    setting.id === updatedSetting.id ? updatedSetting : setting
                ))

                // Update the selected setting if it's the one being updated
                if (selectedSetting?.id === updatedSetting.id) {
                    setSelectedSetting(updatedSetting)
                }

                toast({
                    title: "Setting updated",
                    description: "The branding setting was updated successfully.",
                })

                return updatedSetting
            }
        } catch (err) {
            console.error("Failed to update branding setting:", err)
            setError(err instanceof Error ? err : new Error("Failed to update branding setting"))

            toast({
                title: "Error",
                description: "Failed to update branding setting.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a branding setting
    const deleteSetting = async (id: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.deleteBrandingSettingMutation({
                id
            })

            if (response.data?.deleteBrandingSetting) {
                // Remove the setting from the list
                setSettings(settings.filter(setting => setting.id !== id))

                // Clear the selected setting if it's the one being deleted
                if (selectedSetting?.id === id) {
                    setSelectedSetting(null)
                }

                toast({
                    title: "Setting deleted",
                    description: "The branding setting was deleted successfully.",
                })

                return true
            }
        } catch (err) {
            console.error("Failed to delete branding setting:", err)
            setError(err instanceof Error ? err : new Error("Failed to delete branding setting"))

            toast({
                title: "Error",
                description: "Failed to delete branding setting.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Get default branding setting
    const getDefaultSetting = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.defaultBrandingSettingQuery({})

            if (response.data?.defaultBrandingSetting) {
                return response.data.defaultBrandingSetting
            }

            return null
        } catch (err) {
            console.error("Failed to get default branding setting:", err)
            setError(err instanceof Error ? err : new Error("Failed to get default branding setting"))
            return null
        } finally {
            setIsLoading(false)
        }
    }

    // Associate a setting with a widget
    const associateWithWidget = async (settingId: number, widgetId: number, overrides: Record<string, any> = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.associateBrandingWithWidgetMutation({
                setting_id: settingId,
                widget_id: widgetId,
                overrides
            })

            if (response.data?.associateBrandingWithWidget) {
                // Refresh widget branding
                const brandingResponse = await client.widgetBrandingQuery({
                    widget_id: widgetId
                })

                if (brandingResponse.data?.widgetBranding) {
                    setWidgetBranding(brandingResponse.data.widgetBranding)
                }

                // Also refresh the CSS
                const cssResponse = await client.widgetBrandingCssQuery({
                    widget_id: widgetId
                })

                if (cssResponse.data?.widgetBrandingCss?.css) {
                    setWidgetCss(cssResponse.data.widgetBrandingCss.css)
                }

                toast({
                    title: "Branding applied",
                    description: "The branding setting was applied to the widget successfully.",
                })

                return response.data.associateBrandingWithWidget
            }
        } catch (err) {
            console.error("Failed to associate setting:", err)
            setError(err instanceof Error ? err : new Error("Failed to associate setting"))

            toast({
                title: "Error",
                description: "Failed to apply branding to widget.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Dissociate a setting from a widget
    const dissociateFromWidget = async (settingId: number, widgetId: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.dissociateBrandingFromWidgetMutation({
                setting_id: settingId,
                widget_id: widgetId
            })

            if (response.data?.dissociateBrandingFromWidget) {
                // Reset widget branding
                setWidgetBranding(null)
                setWidgetCss(null)

                toast({
                    title: "Branding removed",
                    description: "The branding setting was removed from the widget successfully.",
                })

                return response.data.dissociateBrandingFromWidget
            }
        } catch (err) {
            console.error("Failed to dissociate setting:", err)
            setError(err instanceof Error ? err : new Error("Failed to dissociate setting"))

            toast({
                title: "Error",
                description: "Failed to remove branding from widget.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Generate CSS for a setting
    const generateCss = async (settingId: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.brandingSettingCssQuery({
                id: settingId
            })

            if (response.data?.brandingSettingCss?.css) {
                return response.data.brandingSettingCss.css
            }

            return null
        } catch (err) {
            console.error("Failed to generate CSS:", err)
            setError(err instanceof Error ? err : new Error("Failed to generate CSS"))
            return null
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        settings,
        selectedSetting,
        setSelectedSetting,
        widgetBranding,
        widgetCss,
        createSetting,
        updateSetting,
        deleteSetting,
        getDefaultSetting,
        associateWithWidget,
        dissociateFromWidget,
        generateCss,
    }
} 