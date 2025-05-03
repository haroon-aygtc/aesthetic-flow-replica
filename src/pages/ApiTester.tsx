
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { EndpointList } from "@/components/api-tester/endpoint-list";
import { RequestEditor } from "@/components/api-tester/request-editor";
import { ResponseViewer } from "@/components/api-tester/response-viewer";
import { apiTestService, ApiRoute, ApiTestRequest, ApiTestResponse } from "@/utils/api-test-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function ApiTester() {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRoute, setSelectedRoute] = useState<ApiRoute | undefined>();
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>();
  const [requestLoading, setRequestLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiTestResponse | undefined>();

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const allRoutes = await apiTestService.getApiRoutes();
        setRoutes(allRoutes);
      } catch (error) {
        console.error('Failed to fetch API routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleSelectEndpoint = (route: ApiRoute, method: string) => {
    setSelectedRoute(route);
    setSelectedMethod(method);
    setResponse(undefined);
  };

  const handleExecuteRequest = async (request: ApiTestRequest) => {
    setRequestLoading(true);
    try {
      const result = await apiTestService.executeTest(request);
      setResponse(result);
    } catch (error) {
      console.error('Request execution failed:', error);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Tester</h1>
          <p className="text-muted-foreground">
            Test API endpoints and view responses in real-time.
          </p>
        </div>
        <Separator />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            {loading ? (
              <div className="h-96 flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Loading API endpoints...</p>
              </div>
            ) : (
              <EndpointList 
                routes={routes} 
                onSelectEndpoint={handleSelectEndpoint} 
              />
            )}
          </div>
          
          <div className="space-y-6 lg:col-span-2">
            <RequestEditor 
              selectedRoute={selectedRoute}
              selectedMethod={selectedMethod}
              onExecute={handleExecuteRequest}
              isLoading={requestLoading}
            />
            
            <ResponseViewer 
              response={response} 
              isLoading={requestLoading} 
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
