import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { AIModelData } from "@/utils/ai-model-service";

interface ModelAnalytics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  tokensUsed: number;
  costEstimate: number;
  fallbackRate: number;
  requestsOverTime: {
    date: string;
    requests: number;
    failures: number;
  }[];
  useCaseDistribution: {
    useCase: string;
    requests: number;
  }[];
  confidenceScoreDistribution: {
    range: string;
    count: number;
  }[];
  errorMessages: {
    error: string;
    count: number;
  }[];
}

interface ModelAnalyticsProps {
  selectedModel: AIModelData | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFF', '#FF85C0'];

export function ModelAnalytics({ selectedModel }: ModelAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ModelAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState("7d"); // 7d, 30d, 90d
  const { toast } = useToast();

  useEffect(() => {
    if (selectedModel?.id) {
      loadAnalytics(selectedModel.id, period);
    } else {
      setAnalytics(null);
    }
  }, [selectedModel, period]);

  const loadAnalytics = async (modelId: number, timePeriod: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/models/${modelId}?period=${timePeriod}`)
        .catch(error => {
          console.error("Network error loading analytics:", error);
          throw new Error("Network error while loading analytics");
        });
        
      if (!response.ok) {
        throw new Error(`Failed to load analytics: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      // Check if the response has a data property
      const data = responseData && responseData.data ? responseData.data : responseData;

      // Create a default analytics object with all required properties
      const defaultAnalytics: ModelAnalytics = {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        tokensUsed: 0,
        costEstimate: 0,
        fallbackRate: 0,
        requestsOverTime: [],
        useCaseDistribution: [],
        confidenceScoreDistribution: [],
        errorMessages: []
      };

      // Merge the received data with the default values to ensure all properties exist
      setAnalytics({ ...defaultAnalytics, ...data });
    } catch (error) {
      console.error("Error loading model analytics:", error);
      toast({
        title: "Analytics Error",
        description: "The analytics feature may not be fully implemented or there may be no data available yet.",
        variant: "destructive"
      });
      
      // Set empty analytics to show "no data" state instead of loading spinner
      setAnalytics({
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        tokensUsed: 0,
        costEstimate: 0,
        fallbackRate: 0,
        requestsOverTime: [],
        useCaseDistribution: [],
        confidenceScoreDistribution: [],
        errorMessages: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedModel) return null;

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercent = (num: number) => {
    return `${Math.round(num * 100)}%`;
  };

  const formatMs = (num: number) => {
    return `${Math.round(num)}ms`;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Model Analytics
            </CardTitle>
            <CardDescription>
              Performance metrics and usage statistics for this model
            </CardDescription>
          </div>

          <Tabs value={period} onValueChange={handlePeriodChange} className="mt-2 sm:mt-0">
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : !analytics ? (
          <div className="py-20 text-center">
            <BarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No analytics data available</h3>
            <p className="text-muted-foreground mt-1">
              Start using this model to generate analytics data
            </p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">Total Requests</div>
                <div className="text-2xl font-bold mt-1">{formatNumber(analytics.totalRequests)}</div>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">Success Rate</div>
                <div className="text-2xl font-bold mt-1">{formatPercent(analytics.successRate)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Fallback Rate: {formatPercent(analytics.fallbackRate)}
                </div>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">Avg Response Time</div>
                <div className="text-2xl font-bold mt-1">{formatMs(analytics.averageResponseTime)}</div>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">Tokens Used</div>
                <div className="text-2xl font-bold mt-1">{formatNumber(analytics.tokensUsed)}</div>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">Est. Cost</div>
                <div className="text-2xl font-bold mt-1">${(analytics.costEstimate || 0).toFixed(2)}</div>
              </div>
            </div>

            {/* Charts */}
            <Tabs defaultValue="requests" className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="requests">Requests Over Time</TabsTrigger>
                <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
                <TabsTrigger value="confidence">Confidence Scores</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="pt-4">
                <h4 className="text-sm font-medium mb-4">Requests & Failures Over Time</h4>
                {analytics.requestsOverTime.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No request data available for this period</p>
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={analytics.requestsOverTime}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#8884d8" name="Requests" />
                        <Line yAxisId="right" type="monotone" dataKey="failures" stroke="#ff5252" name="Failures" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="use-cases" className="pt-4">
                <h4 className="text-sm font-medium mb-4">Distribution by Use Case</h4>
                {analytics.useCaseDistribution.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No use case data available for this period</p>
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={analytics.useCaseDistribution}
                        margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="useCase" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="requests" name="Requests" fill="#8884d8" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="confidence" className="pt-4">
                <h4 className="text-sm font-medium mb-4">Confidence Score Distribution</h4>
                {analytics.confidenceScoreDistribution.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No confidence score data available for this period</p>
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analytics.confidenceScoreDistribution}
                          nameKey="range"
                          dataKey="count"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `${entry.range}: ${entry.count}`}
                        >
                          {analytics.confidenceScoreDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="errors" className="pt-4">
                <h4 className="text-sm font-medium mb-4">Common Error Messages</h4>
                {analytics.errorMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No errors recorded for this period</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analytics.errorMessages.map((error, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                        <div className="text-sm">{error.error}</div>
                        <Badge variant="outline">{error.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
