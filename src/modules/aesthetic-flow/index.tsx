"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { FlowDesigner } from "@/components/aesthetic-flow/flow-designer"
import { FlowSettings } from "@/components/aesthetic-flow/flow-settings"
import { FlowPreview } from "@/components/aesthetic-flow/flow-preview"
import { useFlow } from "@/hooks/use-flow"

interface AestheticFlowProps {
    widgetId?: number
}

export function AestheticFlow({ widgetId }: AestheticFlowProps) {
    const [activeTab, setActiveTab] = useState("designer")

    const {
        isLoading,
        error,
        flows,
        selectedFlow,
        setSelectedFlow,
        flowItems,
        setFlowItems,
        createFlow,
        updateFlow,
        deleteFlow,
        saveFlowItems,
    } = useFlow({ widgetId })

    if (isLoading && flows.length === 0) {
        return (
            <div className="flex justify-center items-center p-12">
                <Spinner size="lg" className="mr-2" />
                <p>Loading flow designer...</p>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load flow configuration. Please try refreshing the page.
                    <p className="mt-2">{error.message}</p>
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Aesthetic Flow</CardTitle>
                    <CardDescription>
                        Design visual flows for your AI-powered conversations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="designer" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="designer">Flow Designer</TabsTrigger>
                            <TabsTrigger value="settings" disabled={!selectedFlow}>
                                Flow Settings
                            </TabsTrigger>
                            <TabsTrigger value="preview" disabled={!selectedFlow}>
                                Preview
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="designer" className="pt-4">
                            <FlowDesigner
                                flows={flows}
                                selectedFlow={selectedFlow}
                                flowItems={flowItems}
                                onSelect={setSelectedFlow}
                                onUpdateItems={setFlowItems}
                                onCreate={createFlow}
                                onUpdate={updateFlow}
                                onDelete={deleteFlow}
                                onSave={saveFlowItems}
                            />
                        </TabsContent>

                        <TabsContent value="settings" className="pt-4">
                            {selectedFlow ? (
                                <FlowSettings
                                    flow={selectedFlow}
                                    onUpdate={updateFlow}
                                />
                            ) : (
                                <Alert>
                                    <AlertDescription>
                                        Please select a flow first to edit its settings.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>

                        <TabsContent value="preview" className="pt-4">
                            {selectedFlow ? (
                                <FlowPreview
                                    flow={selectedFlow}
                                    flowItems={flowItems}
                                />
                            ) : (
                                <Alert>
                                    <AlertDescription>
                                        Please select a flow first to preview it.
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