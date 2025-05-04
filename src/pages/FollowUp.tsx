
import { AdminLayout } from "@/components/admin-layout";
import { Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FollowUp = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Follow-Up Engine</h1>
          <p className="text-muted-foreground">
            Configure automated follow-up interactions with users
          </p>
        </div>
        
        <Alert>
          <Rocket className="h-4 w-4" />
          <AlertTitle>Module in development</AlertTitle>
          <AlertDescription>
            The Follow-Up Engine module is currently being restored. Please check back later.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Follow-Up Rules</CardTitle>
              <CardDescription>Configure when follow-ups are triggered</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to configure when follow-ups are triggered based on user interactions.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Create templates for follow-up messages</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to create and manage templates for follow-up messages.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
              <CardDescription>Configure timing of follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will allow you to configure when follow-ups are sent.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View performance of follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will provide analytics on the performance of your follow-up messages.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FollowUp;
