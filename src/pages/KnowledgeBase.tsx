
import { AdminLayout } from "@/components/admin-layout";
import { Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const KnowledgeBase = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage knowledge sources for your AI chatbot
          </p>
        </div>
        
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>Module in development</AlertTitle>
          <AlertDescription>
            The Knowledge Base module is currently being restored. Please check back later.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Sources</CardTitle>
              <CardDescription>Upload and manage document sources</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to upload and manage document sources such as PDFs, Word documents, and more.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>URL Scraping</CardTitle>
              <CardDescription>Import knowledge from websites</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to scrape website content to use as knowledge sources.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Graph</CardTitle>
              <CardDescription>Visualize connections between knowledge entities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will provide a visual representation of your knowledge sources and their connections.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure how knowledge base is used</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to configure how the knowledge base is used in your AI chat system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default KnowledgeBase;
