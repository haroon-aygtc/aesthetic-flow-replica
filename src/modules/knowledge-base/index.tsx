import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

import { KnowledgeDocumentList } from "./knowledge-document-list";
import { QAPairList } from "./qa-pair-list";
import { WebsiteSourceList } from "./website-source-list";
import { KnowledgeInsights } from "./knowledge-insights";
import {
  knowledgeBaseService,
  KnowledgeDocument,
  QAPair,
  WebsiteSource
} from "@/utils/knowledge-base-service";

export function KnowledgeBaseModule() {
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [websiteSources, setWebsiteSources] = useState<WebsiteSource[]>([]);
  const [loading, setLoading] = useState({
    documents: true,
    qaPairs: true,
    websiteSources: true
  });
  const { toast } = useToast();

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === "documents" && loading.documents) {
          const response = await knowledgeBaseService.getDocuments();
          // Ensure we only include valid document objects
          const validDocuments = Array.isArray(response.data.data)
            ? response.data.data.filter(doc => doc && doc.id && doc.name)
            : [];
          setDocuments(validDocuments);
          setLoading(prev => ({ ...prev, documents: false }));
        } else if (activeTab === "qa-pairs" && loading.qaPairs) {
          const response = await knowledgeBaseService.getQAPairs();
          // Ensure we only include valid QA pairs
          const validQAPairs = Array.isArray(response.data.data)
            ? response.data.data.filter(pair => pair && pair.id && pair.question && pair.answer)
            : [];
          setQAPairs(validQAPairs);
          setLoading(prev => ({ ...prev, qaPairs: false }));
        } else if (activeTab === "websites" && loading.websiteSources) {
          const response = await knowledgeBaseService.getWebsiteSources();
          // Ensure we only include valid website sources
          const validSources = Array.isArray(response.data.data)
            ? response.data.data.filter(source => source && source.id && source.url)
            : [];
          setWebsiteSources(validSources);
          setLoading(prev => ({ ...prev, websiteSources: false }));
        }
      } catch (error) {
        console.error("Error loading knowledge base data:", error);
        toast({
          title: "Error",
          description: "Failed to load knowledge base data. Please try refreshing the page.",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, [activeTab, loading, toast]);

  return (
    <Card>
      <Tabs defaultValue="documents" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="qa-pairs">Q&A Pairs</TabsTrigger>
          <TabsTrigger value="websites">Websites</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <CardContent>
          <TabsContent value="documents" className="mt-0">
            {loading.documents ? (
              <DocumentsSkeleton />
            ) : (
              <KnowledgeDocumentList
                documents={documents}
                onDocumentsChange={setDocuments}
              />
            )}
          </TabsContent>

          <TabsContent value="qa-pairs" className="mt-0">
            {loading.qaPairs ? (
              <QAPairsSkeleton />
            ) : (
              <QAPairList qaPairs={qaPairs} onQAPairsChange={setQAPairs} />
            )}
          </TabsContent>

          <TabsContent value="websites" className="mt-0">
            {loading.websiteSources ? (
              <WebsiteSourcesSkeleton />
            ) : (
              <WebsiteSourceList
                sources={websiteSources}
                onSourcesChange={setWebsiteSources}
              />
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <KnowledgeInsights
              documents={documents}
              qaPairs={qaPairs}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

// Skeleton loaders
function DocumentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

function QAPairsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}

function WebsiteSourcesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
