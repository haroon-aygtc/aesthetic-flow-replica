
import { AdminLayout } from "@/components/admin-layout";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ResponseFormatter = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Response Formatter</h1>
          <p className="text-muted-foreground">
            Configure how AI responses are formatted and presented
          </p>
        </div>
        
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertTitle>Module in development</AlertTitle>
          <AlertDescription>
            The Response Formatter module is currently being restored. Please check back later.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Markdown Settings</CardTitle>
              <CardDescription>Configure markdown rendering options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to configure how markdown is rendered in AI responses.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Response Templates</CardTitle>
              <CardDescription>Create templates for common responses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to create and manage templates for common AI responses.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>Add custom styling to AI responses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to add custom CSS styling to AI responses.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Preview how responses will look</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will provide a preview of how AI responses will look with your configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ResponseFormatter;
