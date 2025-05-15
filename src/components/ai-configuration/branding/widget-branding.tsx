"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, CheckCircle, Info, Paintbrush, Palette, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

interface WidgetBrandingProps {
  widgetId?: number
  settings: BrandingSetting[]
  selectedSetting: BrandingSetting | null
  widgetBranding: Record<string, any> | null
  widgetCss: string | null
  isLoading: boolean
  error: Error | null
  onAssociate: (settingId: number, widgetId: number) => Promise<any>
  onDissociate: (settingId: number, widgetId: number) => Promise<any>
  onGenerateCss: (settingId: number) => Promise<string | null>
}

export function WidgetBranding({
  widgetId,
  settings,
  selectedSetting,
  widgetBranding,
  widgetCss,
  isLoading,
  error,
  onAssociate,
  onDissociate,
  onGenerateCss,
}: WidgetBrandingProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("settings")
  const [isApplying, setIsApplying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [previewCss, setPreviewCss] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)

  if (!widgetId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Widget Branding</CardTitle>
          <CardDescription>
            Apply branding settings to a specific widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No widget selected</AlertTitle>
            <AlertDescription>
              Please select a widget to manage its branding settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const handleApplyBranding = async () => {
    if (!selectedSetting || !widgetId) return

    try {
      setIsApplying(true)
      await onAssociate(selectedSetting.id, widgetId)
      toast({
        title: "Branding applied",
        description: `${selectedSetting.name} has been applied to this widget.`,
      })
    } catch (err) {
      console.error("Failed to apply branding:", err)
      toast({
        title: "Error",
        description: "Failed to apply branding to widget.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemoveBranding = async () => {
    if (!widgetBranding || !widgetId) return

    try {
      setIsRemoving(true)
      await onDissociate(widgetBranding.id, widgetId)
      toast({
        title: "Branding removed",
        description: "Branding has been removed from this widget.",
      })
    } catch (err) {
      console.error("Failed to remove branding:", err)
      toast({
        title: "Error",
        description: "Failed to remove branding from widget.",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  const handlePreviewBranding = async () => {
    if (!selectedSetting) return

    try {
      setIsGeneratingPreview(true)
      const css = await onGenerateCss(selectedSetting.id)
      setPreviewCss(css)
    } catch (err) {
      console.error("Failed to generate preview:", err)
      toast({
        title: "Error",
        description: "Failed to generate branding preview.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widget Branding</CardTitle>
        <CardDescription>
          Apply branding settings to this widget
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="settings">
              <Palette className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Paintbrush className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {widgetBranding ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Branding Applied</AlertTitle>
                  <AlertDescription>
                    This widget is using the "{widgetBranding.name}" branding settings.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Colors</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(widgetBranding.colors || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: value as string }}
                          />
                          <span className="text-xs">{key}: {value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Typography</h3>
                    <div className="space-y-1">
                      {Object.entries(widgetBranding.typography || {}).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={handleRemoveBranding}
                  disabled={isRemoving}
                >
                  {isRemoving && <Spinner className="mr-2 h-4 w-4" />}
                  Remove Branding
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Branding Applied</AlertTitle>
                  <AlertDescription>
                    This widget is using the default styling. Select a branding setting to apply.
                  </AlertDescription>
                </Alert>

                {settings.length === 0 ? (
                  <Alert variant="default" className="bg-muted">
                    <AlertTitle>No Branding Settings Available</AlertTitle>
                    <AlertDescription>
                      Create a branding setting first before applying it to this widget.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      {settings.map((setting) => (
                        <div
                          key={setting.id}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-accent",
                            selectedSetting?.id === setting.id && "border-primary bg-accent"
                          )}
                          onClick={() => selectedSetting?.id !== setting.id && setSelectedSetting(setting)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: setting.colors.primary }}
                            />
                            <div>
                              <div className="font-medium">{setting.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {setting.is_default && "Default • "}
                                {Object.keys(setting.colors).length} colors, {Object.keys(setting.typography).length} typography settings
                              </div>
                            </div>
                          </div>
                          {selectedSetting?.id === setting.id && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleApplyBranding}
                        disabled={!selectedSetting || isApplying}
                      >
                        {isApplying && <Spinner className="mr-2 h-4 w-4" />}
                        Apply Branding
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handlePreviewBranding}
                        disabled={!selectedSetting || isGeneratingPreview}
                      >
                        {isGeneratingPreview ? (
                          <Spinner className="mr-2 h-4 w-4" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Preview
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>CSS Preview</AlertTitle>
                <AlertDescription>
                  This is a preview of the CSS that will be applied to the widget.
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="p-4 rounded-md bg-muted overflow-auto max-h-[300px] text-xs">
                  <code>{previewCss || widgetCss || "No CSS available. Generate a preview first."}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
