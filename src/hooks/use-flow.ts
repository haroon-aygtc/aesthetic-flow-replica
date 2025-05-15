import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface FlowItem {
    id: string
    type: string
    position: { x: number, y: number }
    data: Record<string, any>
}

interface Flow {
    id: number
    name: string
    description: string | null
    type: string
    settings: Record<string, any>
    is_active: boolean
}

interface UseFlowProps {
    widgetId?: number
    initialFlowId?: number
}

export function useFlow({
    widgetId,
    initialFlowId,
}: UseFlowProps = {}) {
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [flows, setFlows] = useState<Flow[]>([])
    const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
    const [flowItems, setFlowItems] = useState<FlowItem[]>([])

    // Mock data for demonstration - would be replaced with actual API calls
    useEffect(() => {
        const loadFlows = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Mock data loading delay
                await new Promise(resolve => setTimeout(resolve, 800))

                const mockFlows: Flow[] = [
                    {
                        id: 1,
                        name: "Customer Support Flow",
                        description: "Flow for handling customer support inquiries",
                        type: "support",
                        settings: {
                            theme: "light",
                            transitions: "fade",
                            timeout: 3000
                        },
                        is_active: true
                    },
                    {
                        id: 2,
                        name: "Product Recommendation",
                        description: "Flow for recommending products based on preferences",
                        type: "recommendation",
                        settings: {
                            theme: "dark",
                            transitions: "slide",
                            timeout: 5000
                        },
                        is_active: false
                    }
                ]

                setFlows(mockFlows)

                // Set the initial flow if provided
                if (initialFlowId && mockFlows.length) {
                    const initialFlow = mockFlows.find(flow => flow.id === initialFlowId)
                    if (initialFlow) {
                        setSelectedFlow(initialFlow)
                        loadFlowItems(initialFlowId)
                    }
                }
            } catch (err) {
                console.error("Failed to load flows:", err)
                setError(err instanceof Error ? err : new Error("Failed to load flows"))
            } finally {
                setIsLoading(false)
            }
        }

        loadFlows()
    }, [initialFlowId])

    // Mock function to load flow items for a specific flow
    const loadFlowItems = async (flowId: number) => {
        try {
            setIsLoading(true)

            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 500))

            // Mock data
            const mockItems: FlowItem[] = [
                {
                    id: "node-1",
                    type: "input",
                    position: { x: 250, y: 25 },
                    data: { label: "Start", description: "Entry point" }
                },
                {
                    id: "node-2",
                    type: "default",
                    position: { x: 250, y: 125 },
                    data: { label: "Process", description: "Process the request" }
                },
                {
                    id: "node-3",
                    type: "output",
                    position: { x: 250, y: 225 },
                    data: { label: "Response", description: "Generate AI response" }
                }
            ]

            setFlowItems(mockItems)
        } catch (err) {
            console.error("Failed to load flow items:", err)
            setError(err instanceof Error ? err : new Error("Failed to load flow items"))
        } finally {
            setIsLoading(false)
        }
    }

    // Select a flow and load its items
    const handleSelectFlow = (flow: Flow) => {
        setSelectedFlow(flow)
        loadFlowItems(flow.id)
    }

    // Create a new flow
    const createFlow = async (data: Omit<Flow, "id">) => {
        try {
            setIsLoading(true)
            setError(null)

            // Mock API call delay
            await new Promise(resolve => setTimeout(resolve, 800))

            // Generate a mock ID
            const newFlow = {
                ...data,
                id: Math.max(0, ...flows.map(f => f.id)) + 1
            }

            setFlows([...flows, newFlow])
            setSelectedFlow(newFlow)
            setFlowItems([])

            toast({
                title: "Flow created",
                description: "The flow was created successfully.",
            })

            return newFlow
        } catch (err) {
            console.error("Failed to create flow:", err)
            setError(err instanceof Error ? err : new Error("Failed to create flow"))

            toast({
                title: "Error",
                description: "Failed to create flow.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Update an existing flow
    const updateFlow = async (id: number, data: Partial<Omit<Flow, "id">>) => {
        try {
            setIsLoading(true)
            setError(null)

            // Mock API call delay
            await new Promise(resolve => setTimeout(resolve, 500))

            // Update the flow
            const updatedFlow = {
                ...flows.find(f => f.id === id),
                ...data,
                id
            } as Flow

            // Update the flows list
            setFlows(flows.map(flow =>
                flow.id === id ? updatedFlow : flow
            ))

            // Update the selected flow if it's the one being updated
            if (selectedFlow?.id === id) {
                setSelectedFlow(updatedFlow)
            }

            toast({
                title: "Flow updated",
                description: "The flow was updated successfully.",
            })

            return updatedFlow
        } catch (err) {
            console.error("Failed to update flow:", err)
            setError(err instanceof Error ? err : new Error("Failed to update flow"))

            toast({
                title: "Error",
                description: "Failed to update flow.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a flow
    const deleteFlow = async (id: number) => {
        try {
            setIsLoading(true)
            setError(null)

            // Mock API call delay
            await new Promise(resolve => setTimeout(resolve, 600))

            // Remove the flow from the list
            setFlows(flows.filter(flow => flow.id !== id))

            // Clear the selected flow if it's the one being deleted
            if (selectedFlow?.id === id) {
                setSelectedFlow(null)
                setFlowItems([])
            }

            toast({
                title: "Flow deleted",
                description: "The flow was deleted successfully.",
            })

            return true
        } catch (err) {
            console.error("Failed to delete flow:", err)
            setError(err instanceof Error ? err : new Error("Failed to delete flow"))

            toast({
                title: "Error",
                description: "Failed to delete flow.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Save flow items
    const saveFlowItems = async (items: FlowItem[]) => {
        if (!selectedFlow) return

        try {
            setIsLoading(true)
            setError(null)

            // Mock API call delay
            await new Promise(resolve => setTimeout(resolve, 500))

            // Update flow items
            setFlowItems(items)

            toast({
                title: "Flow saved",
                description: "The flow layout was saved successfully.",
            })

            return true
        } catch (err) {
            console.error("Failed to save flow items:", err)
            setError(err instanceof Error ? err : new Error("Failed to save flow items"))

            toast({
                title: "Error",
                description: "Failed to save flow layout.",
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
        flows,
        selectedFlow,
        setSelectedFlow: handleSelectFlow,
        flowItems,
        setFlowItems,
        createFlow,
        updateFlow,
        deleteFlow,
        saveFlowItems,
    }
} 