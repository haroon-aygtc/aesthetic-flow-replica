"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranding } from "@/hooks/use-branding"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { BrandingManager } from "@/components/ai-configuration/branding/branding-manager"
import { BrandingEditor } from "@/components/ai-configuration/branding/branding-editor"
import { BrandingPreview } from "@/components/ai-configuration/branding/branding-css-preview"
import { WidgetBranding } from "@/components/ai-configuration/branding/widget-branding"

interface BrandingEngineProps {
  widgetId?: number
}

export function BrandingEngine({ widgetId }: BrandingEngineProps) {
  const [activeTab, setActiveTab] = useState("settings")

  const {
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
    associateWithWidget,
    dissociateFromWidget,
    generateCss,
  } = useBranding({ widgetId })

  if (isLoading && settings.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" className="mr-2" />
        <p>Loading branding configuration...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load branding configuration. Please try refreshing the page.
          <p className="mt-2">{error.message}</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branding Engine</CardTitle>
          <CardDescription>
            Configure the visual appearance of your AI-powered widgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="settings">Branding Settings</TabsTrigger>
              <TabsTrigger
                value="editor"
                disabled={!selectedSetting}
              >
                Brand Editor
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                disabled={!selectedSetting}
              >
                Preview
              </TabsTrigger>
              <TabsTrigger value="widget-branding">Widget Branding</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="pt-4">
              <BrandingManager
                settings={settings}
                selectedSetting={selectedSetting}
                onSelect={setSelectedSetting}
                onCreate={createSetting}
                onUpdate={updateSetting}
                onDelete={deleteSetting}
              />
            </TabsContent>

            <TabsContent value="editor" className="pt-4">
              {selectedSetting ? (
                <BrandingEditor
                  setting={selectedSetting}
                  onUpdate={updateSetting}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select a branding setting first to edit its properties.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="preview" className="pt-4">
              {selectedSetting ? (
                <BrandingPreview
                  setting={selectedSetting}
                  generateCss={generateCss}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select a branding setting first to preview it.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="widget-branding" className="pt-4">
              <WidgetBranding
                widgetId={widgetId}
                settings={settings}
                selectedSetting={selectedSetting}
                widgetBranding={widgetBranding}
                widgetCss={widgetCss}
                isLoading={isLoading}
                error={error}
                onAssociate={associateWithWidget}
                onDissociate={dissociateFromWidget}
                onGenerateCss={generateCss}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export function BrandingEngineModule() {
  return (
    <div className="space-y-6">
      <BrandingEngine />
    </div>
  )
}

export default BrandingEngineModule
