
import { AdminLayout } from "@/components/admin-layout";
import { Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Branding = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Branding Engine</h1>
          <p className="text-muted-foreground">
            Configure your AI assistant's personality and branding
          </p>
        </div>
        
        <Alert>
          <Award className="h-4 w-4" />
          <AlertTitle>Module in development</AlertTitle>
          <AlertDescription>
            The Branding module is currently being restored. Please check back later.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personality</CardTitle>
              <CardDescription>Configure your AI assistant's personality</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to configure your AI assistant's personality traits.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Voice & Tone</CardTitle>
              <CardDescription>Configure your AI's communication style</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to configure how your AI assistant communicates.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Visual Branding</CardTitle>
              <CardDescription>Configure your AI's visual appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to configure your AI assistant's visual appearance.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Preview your branded AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will provide a preview of your AI assistant with your branding configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Branding;
