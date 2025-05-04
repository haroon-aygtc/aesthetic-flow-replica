
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function KnowledgeBaseModule() {
  const [activeTab, setActiveTab] = useState("documents");
  
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Module in development</AlertTitle>
        <AlertDescription>
          The Knowledge Base module is currently under development. Please check back later.
        </AlertDescription>
      </Alert>
      
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
            
            <TabsContent value="documents" className="space-y-4">
              <p className="text-muted-foreground">
                Upload and manage documents that will serve as a knowledge base for your AI.
              </p>
            </TabsContent>
            
            <TabsContent value="qa">
              <p className="text-muted-foreground">
                Create question and answer pairs to supplement your knowledge base.
              </p>
            </TabsContent>
            
            <TabsContent value="insights">
              <p className="text-muted-foreground">
                View insights about how your knowledge base is being used and which documents are most relevant.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
