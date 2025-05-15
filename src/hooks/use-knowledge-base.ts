import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useGraphQL } from "@/hooks/use-graphql"

interface KnowledgeBase {
    id: number
    name: string
    description: string | null
    settings: Record<string, any>
    is_active: boolean
}

interface KnowledgeBaseSource {
    id: number
    knowledge_base_id: number
    source_type: "database" | "file" | "website" | "qa_pair"
    name: string
    description: string | null
    settings: Record<string, any>
    metadata: Record<string, any>
    is_active: boolean
    priority: number
}

interface KnowledgeBaseEntry {
    id: number
    knowledge_base_source_id: number
    content: string
    embedding_vector: string | null
    metadata: Record<string, any>
}

interface UseKnowledgeBaseProps {
    widgetId?: number
    initialKnowledgeBaseId?: number
}

export function useKnowledgeBase({
    widgetId,
    initialKnowledgeBaseId,
}: UseKnowledgeBaseProps = {}) {
    const { toast } = useToast()
    const { client } = useGraphQL()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
    const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null)
    const [sources, setSources] = useState<KnowledgeBaseSource[]>([])
    const [selectedSource, setSelectedSource] = useState<KnowledgeBaseSource | null>(null)
    const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([])

    // Load knowledge bases
    useEffect(() => {
        async function loadKnowledgeBases() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await client.knowledgeBasesQuery({})

                if (response.data?.knowledgeBases) {
                    setKnowledgeBases(response.data.knowledgeBases)

                    // Set the initial knowledge base if provided
                    if (initialKnowledgeBaseId && response.data.knowledgeBases.length) {
                        const initialKB = response.data.knowledgeBases.find(
                            kb => kb.id === initialKnowledgeBaseId
                        )
                        if (initialKB) {
                            setSelectedKnowledgeBase(initialKB)
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load knowledge bases:", err)
                setError(err instanceof Error ? err : new Error("Failed to load knowledge bases"))
            } finally {
                setIsLoading(false)
            }
        }

        loadKnowledgeBases()
    }, [client, initialKnowledgeBaseId])

    // Load sources when a knowledge base is selected
    useEffect(() => {
        async function loadSources() {
            if (!selectedKnowledgeBase) return

            try {
                setIsLoading(true)
                setError(null)

                const response = await client.knowledgeBaseSourcesQuery({
                    knowledge_base_id: selectedKnowledgeBase.id
                })

                if (response.data?.knowledgeBaseSources) {
                    setSources(response.data.knowledgeBaseSources)
                }
            } catch (err) {
                console.error("Failed to load sources:", err)
                setError(err instanceof Error ? err : new Error("Failed to load sources"))
            } finally {
                setIsLoading(false)
            }
        }

        loadSources()
    }, [client, selectedKnowledgeBase])

    // Load entries when a source is selected
    useEffect(() => {
        async function loadEntries() {
            if (!selectedSource) return

            try {
                setIsLoading(true)
                setError(null)

                const response = await client.knowledgeBaseEntriesQuery({
                    knowledge_base_source_id: selectedSource.id
                })

                if (response.data?.knowledgeBaseEntries) {
                    setEntries(response.data.knowledgeBaseEntries)
                }
            } catch (err) {
                console.error("Failed to load entries:", err)
                setError(err instanceof Error ? err : new Error("Failed to load entries"))
            } finally {
                setIsLoading(false)
            }
        }

        loadEntries()
    }, [client, selectedSource])

    // Create a new knowledge base
    const createKnowledgeBase = async (data: Omit<KnowledgeBase, "id">) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.createKnowledgeBaseMutation({
                input: data
            })

            if (response.data?.createKnowledgeBase) {
                setKnowledgeBases([...knowledgeBases, response.data.createKnowledgeBase])
                setSelectedKnowledgeBase(response.data.createKnowledgeBase)

                toast({
                    title: "Knowledge base created",
                    description: "The knowledge base was created successfully.",
                })

                return response.data.createKnowledgeBase
            }
        } catch (err) {
            console.error("Failed to create knowledge base:", err)
            setError(err instanceof Error ? err : new Error("Failed to create knowledge base"))

            toast({
                title: "Error",
                description: "Failed to create knowledge base.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Update a knowledge base
    const updateKnowledgeBase = async (id: number, data: Partial<Omit<KnowledgeBase, "id">>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.updateKnowledgeBaseMutation({
                id,
                input: data
            })

            if (response.data?.updateKnowledgeBase) {
                const updatedKB = response.data.updateKnowledgeBase

                // Update the knowledge bases list
                setKnowledgeBases(knowledgeBases.map(kb =>
                    kb.id === updatedKB.id ? updatedKB : kb
                ))

                // Update the selected knowledge base if it's the one being updated
                if (selectedKnowledgeBase?.id === updatedKB.id) {
                    setSelectedKnowledgeBase(updatedKB)
                }

                toast({
                    title: "Knowledge base updated",
                    description: "The knowledge base was updated successfully.",
                })

                return updatedKB
            }
        } catch (err) {
            console.error("Failed to update knowledge base:", err)
            setError(err instanceof Error ? err : new Error("Failed to update knowledge base"))

            toast({
                title: "Error",
                description: "Failed to update knowledge base.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a knowledge base
    const deleteKnowledgeBase = async (id: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.deleteKnowledgeBaseMutation({
                id
            })

            if (response.data?.deleteKnowledgeBase) {
                // Remove the knowledge base from the list
                setKnowledgeBases(knowledgeBases.filter(kb => kb.id !== id))

                // Clear the selected knowledge base if it's the one being deleted
                if (selectedKnowledgeBase?.id === id) {
                    setSelectedKnowledgeBase(null)
                    setSources([])
                    setSelectedSource(null)
                    setEntries([])
                }

                toast({
                    title: "Knowledge base deleted",
                    description: "The knowledge base was deleted successfully.",
                })

                return true
            }
        } catch (err) {
            console.error("Failed to delete knowledge base:", err)
            setError(err instanceof Error ? err : new Error("Failed to delete knowledge base"))

            toast({
                title: "Error",
                description: "Failed to delete knowledge base.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Create a new source
    const createSource = async (data: Omit<KnowledgeBaseSource, "id" | "knowledge_base_id">) => {
        if (!selectedKnowledgeBase) {
            throw new Error("No knowledge base selected")
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await client.createKnowledgeBaseSourceMutation({
                input: {
                    ...data,
                    knowledge_base_id: selectedKnowledgeBase.id
                }
            })

            if (response.data?.createKnowledgeBaseSource) {
                setSources([...sources, response.data.createKnowledgeBaseSource])
                setSelectedSource(response.data.createKnowledgeBaseSource)

                toast({
                    title: "Source created",
                    description: "The source was created successfully.",
                })

                return response.data.createKnowledgeBaseSource
            }
        } catch (err) {
            console.error("Failed to create source:", err)
            setError(err instanceof Error ? err : new Error("Failed to create source"))

            toast({
                title: "Error",
                description: "Failed to create source.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Update a source
    const updateSource = async (id: number, data: Partial<Omit<KnowledgeBaseSource, "id" | "knowledge_base_id">>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.updateKnowledgeBaseSourceMutation({
                id,
                input: data
            })

            if (response.data?.updateKnowledgeBaseSource) {
                const updatedSource = response.data.updateKnowledgeBaseSource

                // Update the sources list
                setSources(sources.map(source =>
                    source.id === updatedSource.id ? updatedSource : source
                ))

                // Update the selected source if it's the one being updated
                if (selectedSource?.id === updatedSource.id) {
                    setSelectedSource(updatedSource)
                }

                toast({
                    title: "Source updated",
                    description: "The source was updated successfully.",
                })

                return updatedSource
            }
        } catch (err) {
            console.error("Failed to update source:", err)
            setError(err instanceof Error ? err : new Error("Failed to update source"))

            toast({
                title: "Error",
                description: "Failed to update source.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a source
    const deleteSource = async (id: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.deleteKnowledgeBaseSourceMutation({
                id
            })

            if (response.data?.deleteKnowledgeBaseSource) {
                // Remove the source from the list
                setSources(sources.filter(source => source.id !== id))

                // Clear the selected source if it's the one being deleted
                if (selectedSource?.id === id) {
                    setSelectedSource(null)
                    setEntries([])
                }

                toast({
                    title: "Source deleted",
                    description: "The source was deleted successfully.",
                })

                return true
            }
        } catch (err) {
            console.error("Failed to delete source:", err)
            setError(err instanceof Error ? err : new Error("Failed to delete source"))

            toast({
                title: "Error",
                description: "Failed to delete source.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Create a new entry
    const createEntry = async (data: Omit<KnowledgeBaseEntry, "id" | "knowledge_base_source_id">) => {
        if (!selectedSource) {
            throw new Error("No source selected")
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await client.createKnowledgeBaseEntryMutation({
                input: {
                    ...data,
                    knowledge_base_source_id: selectedSource.id
                }
            })

            if (response.data?.createKnowledgeBaseEntry) {
                setEntries([...entries, response.data.createKnowledgeBaseEntry])

                toast({
                    title: "Entry created",
                    description: "The entry was created successfully.",
                })

                return response.data.createKnowledgeBaseEntry
            }
        } catch (err) {
            console.error("Failed to create entry:", err)
            setError(err instanceof Error ? err : new Error("Failed to create entry"))

            toast({
                title: "Error",
                description: "Failed to create entry.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Update an entry
    const updateEntry = async (id: number, data: Partial<Omit<KnowledgeBaseEntry, "id" | "knowledge_base_source_id">>) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.updateKnowledgeBaseEntryMutation({
                id,
                input: data
            })

            if (response.data?.updateKnowledgeBaseEntry) {
                const updatedEntry = response.data.updateKnowledgeBaseEntry

                // Update the entries list
                setEntries(entries.map(entry =>
                    entry.id === updatedEntry.id ? updatedEntry : entry
                ))

                toast({
                    title: "Entry updated",
                    description: "The entry was updated successfully.",
                })

                return updatedEntry
            }
        } catch (err) {
            console.error("Failed to update entry:", err)
            setError(err instanceof Error ? err : new Error("Failed to update entry"))

            toast({
                title: "Error",
                description: "Failed to update entry.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Delete an entry
    const deleteEntry = async (id: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await client.deleteKnowledgeBaseEntryMutation({
                id
            })

            if (response.data?.deleteKnowledgeBaseEntry) {
                // Remove the entry from the list
                setEntries(entries.filter(entry => entry.id !== id))

                toast({
                    title: "Entry deleted",
                    description: "The entry was deleted successfully.",
                })

                return true
            }
        } catch (err) {
            console.error("Failed to delete entry:", err)
            setError(err instanceof Error ? err : new Error("Failed to delete entry"))

            toast({
                title: "Error",
                description: "Failed to delete entry.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Upload a document
    const uploadDocument = async (file: File, sourceName: string, description?: string) => {
        if (!selectedKnowledgeBase) {
            throw new Error("No knowledge base selected")
        }

        try {
            setIsLoading(true)
            setError(null)

            const formData = new FormData()
            formData.append('file', file)
            formData.append('knowledge_base_id', selectedKnowledgeBase.id.toString())
            formData.append('source_name', sourceName)

            if (description) {
                formData.append('description', description)
            }

            const response = await fetch('/api/knowledge-base/bases/upload-document', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const data = await response.json()

            if (data.source) {
                setSources([...sources, data.source])

                toast({
                    title: "Document uploaded",
                    description: "The document was uploaded successfully and queued for processing.",
                })

                return data.source
            }
        } catch (err) {
            console.error("Failed to upload document:", err)
            setError(err instanceof Error ? err : new Error("Failed to upload document"))

            toast({
                title: "Error",
                description: "Failed to upload document.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Process a document source
    const processDocument = async (sourceId: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch(`/api/knowledge-base/sources/${sourceId}/process`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error(`Processing failed: ${response.statusText}`)
            }

            const data = await response.json()

            toast({
                title: "Document processing",
                description: "The document processing has been queued.",
            })

            return data
        } catch (err) {
            console.error("Failed to process document:", err)
            setError(err instanceof Error ? err : new Error("Failed to process document"))

            toast({
                title: "Error",
                description: "Failed to process document.",
                variant: "destructive",
            })

            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Search knowledge base
    const searchKnowledge = async (query: string, maxResults: number = 5) => {
        if (!widgetId) {
            throw new Error("No widget ID provided")
        }

        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/knowledge-base/knowledge-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    widget_id: widgetId,
                    max_results: maxResults,
                }),
            })

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`)
            }

            const data = await response.json()

            return data.results
        } catch (err) {
            console.error("Failed to search knowledge base:", err)
            setError(err instanceof Error ? err : new Error("Failed to search knowledge base"))
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        error,
        knowledgeBases,
        selectedKnowledgeBase,
        setSelectedKnowledgeBase,
        sources,
        selectedSource,
        setSelectedSource,
        entries,
        createKnowledgeBase,
        updateKnowledgeBase,
        deleteKnowledgeBase,
        createSource,
        updateSource,
        deleteSource,
        createEntry,
        updateEntry,
        deleteEntry,
        uploadDocument,
        processDocument,
        searchKnowledge,
    }
} 