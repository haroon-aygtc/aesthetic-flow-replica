"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useKnowledgeBase } from "@/hooks/use-knowledge-base"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { KnowledgeBaseManager } from "@/components/ai-configuration/knowledge-base/knowledge-base-manager"
import { KnowledgeBaseSourceManager } from "@/components/ai-configuration/knowledge-base/source-manager"
import { KnowledgeBaseEntryManager } from "@/components/ai-configuration/knowledge-base/entry-manager"
import { KnowledgeBaseUploader } from "@/components/ai-configuration/knowledge-base/uploader"

interface KnowledgeBaseModuleProps {
  widgetId?: number
}

export function KnowledgeBaseModule({ widgetId }: KnowledgeBaseModuleProps) {
  const [activeTab, setActiveTab] = useState("knowledge-bases")

  const {
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
  } = useKnowledgeBase({ widgetId })

  if (isLoading && knowledgeBases.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" className="mr-2" />
        <p>Loading knowledge base configuration...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load knowledge base configuration. Please try refreshing the page.
          <p className="mt-2">{error.message}</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Module</CardTitle>
          <CardDescription>
            Configure your knowledge base to provide accurate and consistent responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="knowledge-bases" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="knowledge-bases">Knowledge Bases</TabsTrigger>
              <TabsTrigger
                value="sources"
                disabled={!selectedKnowledgeBase}
              >
                Sources
              </TabsTrigger>
              <TabsTrigger
                value="entries"
                disabled={!selectedSource}
              >
                Entries
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                disabled={!selectedKnowledgeBase}
              >
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="knowledge-bases" className="pt-4">
              <KnowledgeBaseManager
                knowledgeBases={knowledgeBases}
                selectedKnowledgeBase={selectedKnowledgeBase}
                onSelect={setSelectedKnowledgeBase}
                onCreate={createKnowledgeBase}
                onUpdate={updateKnowledgeBase}
                onDelete={deleteKnowledgeBase}
              />
            </TabsContent>

            <TabsContent value="sources" className="pt-4">
              {selectedKnowledgeBase ? (
                <KnowledgeBaseSourceManager
                  sources={sources}
                  selectedSource={selectedSource}
                  onSelect={setSelectedSource}
                  onCreate={createSource}
                  onUpdate={updateSource}
                  onDelete={deleteSource}
                  onProcess={processDocument}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select a knowledge base first to view its sources.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="entries" className="pt-4">
              {selectedSource ? (
                <KnowledgeBaseEntryManager
                  entries={entries}
                  selectedSource={selectedSource}
                  onCreate={createEntry}
                  onUpdate={updateEntry}
                  onDelete={deleteEntry}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select a source first to view its entries.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="upload" className="pt-4">
              {selectedKnowledgeBase ? (
                <KnowledgeBaseUploader
                  knowledgeBase={selectedKnowledgeBase}
                  onUpload={uploadDocument}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select a knowledge base first to upload documents.
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
