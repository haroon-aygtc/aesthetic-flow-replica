import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useGraphQL } from "@/hooks/use-graphql"

interface ContextRule {
    id: number
    name: string
    description: string | null
    conditions: Record<string, any>[]
    settings: Record<string, any>
    priority: number
    is_active: boolean
}

interface ContextSession {
    session_id: string
    data: Record<string, any>
}

interface UseContextProps {
    widgetId?: number
    initialRuleId?: number
}

export function useContext({
    widgetId,
    initialRuleId,
}: UseContextProps = {}) {
    const { toast } = useToast()
    const { client } = useGraphQL()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [rules, setRules] = useState<ContextRule[]>([])
    const [selectedRule, setSelectedRule] = useState<ContextRule | null>(null)

    // Load rules
    useEffect(() => {
        async function loadRules() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await client.contextRulesQuery({})

                if (response.data?.contextRules) {
                    setRules(response.data.contextRules)

                    // Set the initial rule if provided
                    if (initialRuleId && response.data.contextRules.length) {
                        const initialRule = response.data.contextRules.find(
                            rule => rule.id === initialRuleId
                        )
                        if (initialRule) {
                            setSelectedRule(initialRule)
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load context rules:", err)
                setError(err instanceof Error ? err : new Error("Failed to load context rules"))
            } finally {
                setIsLoading(false)
            }
        }

        loadRules()
    }, [client, initialRuleId])

    // Load widget rules if widgetId is provided
    useEffect(() => {
        if (!widgetId) return

        async function loadWidgetRules() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await client.widgetContextRulesQuery({
                    widget_id: widgetId
                })

                if (response.data?.widgetContextRules) {
                    setRules(response.data.widgetContextRules)

                    // Set the initial rule if provided
                    if (initialRuleId && response.data.widgetContextRules.length) {
                        const initialRule = response.data.widgetContextRules.find(
                            rule => rule.id === initialRuleId
                        )
                        if (initialRule) {
                            setSelectedRule(initialRule)
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load widget context rules:", err)
                setError(err instanceof Error ? err : new Error("Failed to load widget context rules"))
            } finally {
                setIsLoading(false)
            }
        }

        loadWidgetRules()
    }, [client, widgetId, initialRuleId])

    // Create a new context rule
    const createRule = async (data: Omit<ContextRule, "id">) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.createContextRuleMutation({
                input: data
            })

            if (response.data?.createContextRule) {
                setRules([...rules, response.data.createContextRule])
                setSelectedRule(response.data.createContextRule)

                toast({
                    title: "Rule created",
                    description: "The context rule was created successfully.",
                })

                return response.data.createContextRule
            }
        } catch (err) {
            console.error("Failed to create context rule:", err)
            setError(err instanceof Error ? err : new Error("Failed to create context rule"))

            toast({
                title: "Error",
                description: "Failed to create context rule.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Update a context rule
    const updateRule = async (id: number, data: Partial<Omit<ContextRule, "id">>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.updateContextRuleMutation({
                id,
                input: data
            })

            if (response.data?.updateContextRule) {
                const updatedRule = response.data.updateContextRule

                // Update the rules list
                setRules(rules.map(rule =>
                    rule.id === updatedRule.id ? updatedRule : rule
                ))

                // Update the selected rule if it's the one being updated
                if (selectedRule?.id === updatedRule.id) {
                    setSelectedRule(updatedRule)
                }

                toast({
                    title: "Rule updated",
                    description: "The context rule was updated successfully.",
                })

                return updatedRule
            }
        } catch (err) {
            console.error("Failed to update context rule:", err)
            setError(err instanceof Error ? err : new Error("Failed to update context rule"))

            toast({
                title: "Error",
                description: "Failed to update context rule.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a context rule
    const deleteRule = async (id: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.deleteContextRuleMutation({
                id
            })

            if (response.data?.deleteContextRule) {
                // Remove the rule from the list
                setRules(rules.filter(rule => rule.id !== id))

                // Clear the selected rule if it's the one being deleted
                if (selectedRule?.id === id) {
                    setSelectedRule(null)
                }

                toast({
                    title: "Rule deleted",
                    description: "The context rule was deleted successfully.",
                })

                return true
            }
        } catch (err) {
            console.error("Failed to delete context rule:", err)
            setError(err instanceof Error ? err : new Error("Failed to delete context rule"))

            toast({
                title: "Error",
                description: "Failed to delete context rule.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Associate a rule with a widget
    const associateWithWidget = async (ruleId: number, widgetId: number, settings: Record<string, any> = {}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.associateContextRuleWithWidgetMutation({
                rule_id: ruleId,
                widget_id: widgetId,
                settings
            })

            if (response.data?.associateContextRuleWithWidget) {
                toast({
                    title: "Rule associated",
                    description: "The context rule was associated with the widget successfully.",
                })

                return response.data.associateContextRuleWithWidget
            }
        } catch (err) {
            console.error("Failed to associate rule:", err)
            setError(err instanceof Error ? err : new Error("Failed to associate rule"))

            toast({
                title: "Error",
                description: "Failed to associate rule with widget.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Dissociate a rule from a widget
    const dissociateFromWidget = async (ruleId: number, widgetId: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.dissociateContextRuleFromWidgetMutation({
                rule_id: ruleId,
                widget_id: widgetId
            })

            if (response.data?.dissociateContextRuleFromWidget) {
                toast({
                    title: "Rule dissociated",
                    description: "The context rule was dissociated from the widget successfully.",
                })

                return response.data.dissociateContextRuleFromWidget
            }
        } catch (err) {
            console.error("Failed to dissociate rule:", err)
            setError(err instanceof Error ? err : new Error("Failed to dissociate rule"))

            toast({
                title: "Error",
                description: "Failed to dissociate rule from widget.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Test a rule with sample context data
    const testRule = async (ruleId: number, context: Record<string, any>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.testContextRuleMutation({
                id: ruleId,
                context
            })

            if (response.data?.testContextRule) {
                return response.data.testContextRule
            }
        } catch (err) {
            console.error("Failed to test rule:", err)
            setError(err instanceof Error ? err : new Error("Failed to test rule"))

            toast({
                title: "Error",
                description: "Failed to test context rule.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Get session context data
    const getSessionContext = async (sessionId: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.getContextSessionQuery({
                session_id: sessionId
            })

            if (response.data?.contextSession) {
                return response.data.contextSession.data
            }

            return {}
        } catch (err) {
            console.error("Failed to get session context:", err)
            setError(err instanceof Error ? err : new Error("Failed to get session context"))
            return {}
        } finally {
            setIsLoading(false)
        }
    }

    // Store session context data
    const storeSessionContext = async (sessionId: string, data: Record<string, any>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.storeContextSessionMutation({
                session_id: sessionId,
                data
            })

            if (response.data?.storeContextSession) {
                return response.data.storeContextSession
            }
        } catch (err) {
            console.error("Failed to store session context:", err)
            setError(err instanceof Error ? err : new Error("Failed to store session context"))

            toast({
                title: "Error",
                description: "Failed to store session context.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Clear session context data
    const clearSessionContext = async (sessionId: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.clearContextSessionMutation({
                session_id: sessionId
            })

            if (response.data?.clearContextSession) {
                toast({
                    title: "Context cleared",
                    description: "The session context data was cleared successfully.",
                })

                return true
            }
        } catch (err) {
            console.error("Failed to clear session context:", err)
            setError(err instanceof Error ? err : new Error("Failed to clear session context"))

            toast({
                title: "Error",
                description: "Failed to clear session context.",
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
        rules,
        selectedRule,
        setSelectedRule,
        createRule,
        updateRule,
        deleteRule,
        associateWithWidget,
        dissociateFromWidget,
        testRule,
        getSessionContext,
        storeSessionContext,
        clearSessionContext,
    }
} 