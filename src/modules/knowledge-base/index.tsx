
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeDocumentList } from "./knowledge-document-list";
import { KnowledgeQAPairs } from "./knowledge-qa-pairs";
import { KnowledgeInsights } from "./knowledge-insights";
import { knowledgeBaseService } from "@/utils/knowledge-base-service";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

export function KnowledgeBaseModule() {
  const [activeTab, setActiveTab] = useState("documents");
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [qaPairs, setQaPairs] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchKnowledgeBaseData = async () => {
      try {
        setIsLoading(true);
        const [docsResponse, qaResponse] = await Promise.all([
          knowledgeBaseService.getDocuments(),
          knowledgeBaseService.getQAPairs()
        ]);

        setDocuments(docsResponse.data || []);
        setQaPairs(qaResponse.data || []);
      } catch (error) {
        console.error("Error fetching knowledge base data:", error);
        toast({
          title: "Error fetching knowledge base data",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeBaseData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="qa">Q&A Pairs</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : (
              <>
                <TabsContent value="documents">
                  <KnowledgeDocumentList documents={documents} onDocumentsChange={setDocuments} />
                </TabsContent>

                <TabsContent value="qa">
                  <KnowledgeQAPairs qaPairs={qaPairs} onQAPairsChange={setQaPairs} />
                </TabsContent>

                <TabsContent value="insights">
                  <KnowledgeInsights documents={documents} qaPairs={qaPairs} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
