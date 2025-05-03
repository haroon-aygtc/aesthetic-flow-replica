
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIModelData, ModelAnalytics, aiModelService } from "@/utils/ai-model-service";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, BarChart2, Clock, Gauge, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModelAnalyticsCardProps {
  selectedModel: AIModelData | null;
}

export function ModelAnalyticsCard({ selectedModel }: ModelAnalyticsCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState("month");
  const [groupBy, setGroupBy] = useState("day");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("usage");

  useEffect(() => {
    if (selectedModel?.id) {
      loadAnalytics();
    }
  }, [selectedModel, period, groupBy]);

  const loadAnalytics = async () => {
    if (!selectedModel?.id) return;
    
    setIsLoading(true);
    try {
      const data = await aiModelService.getModelDetailedAnalytics(
        selectedModel.id,
        period,
        groupBy
      );
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load model analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatChartData = (data: any[]) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => {
      let name;
      
      if (groupBy === 'day' && item.date) {
        name = new Date(item.date).toLocaleDateString();
      } else if (item.query_type) {
        name = item.query_type || 'Unknown';
      } else if (item.use_case) {
        name = item.use_case || 'Unknown';
      } else {
        name = 'Unknown';
      }
      
      return {
        name,
        requests: item.total_requests,
        successRate: Number((item.successful_requests / item.total_requests * 100).toFixed(1)),
        responseTime: Number(item.avg_response_time.toFixed(2)),
        confidenceScore: Number((item.avg_confidence_score * 100).toFixed(1)),
        inputTokens: item.total_input_tokens,
        outputTokens: item.total_output_tokens,
      };
    });
  };

  if (!selectedModel) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Model Analytics
        </CardTitle>
        <CardDescription>
          Monitor model usage, performance, and reliability metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3 justify-between">
            {/* Period Selector */}
            <div className="w-32">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24 Hours</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group By Selector */}
            <div className="w-32">
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Group By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">By Day</SelectItem>
                  <SelectItem value="query_type">By Query Type</SelectItem>
                  <SelectItem value="use_case">By Use Case</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Refresh Button */}
            <Button 
              variant="outline" 
              onClick={loadAnalytics} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? <Spinner size="sm" /> : "Refresh"}
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="min-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Spinner size="lg" />
                </div>
              ) : analyticsData?.analytics ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatChartData(analyticsData.analytics)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="requests" 
                      name="Total Requests" 
                      fill="#8884d8" 
                    />
                    <Bar 
                      dataKey="successRate" 
                      name="Success Rate (%)" 
                      fill="#82ca9d" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-[300px] border rounded-md bg-muted/50">
                  <p className="text-muted-foreground">No analytics data available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="performance" className="min-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Spinner size="lg" />
                </div>
              ) : analyticsData?.analytics ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formatChartData(analyticsData.analytics)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="responseTime" 
                      name="Response Time (s)" 
                      stroke="#8884d8" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="confidenceScore" 
                      name="Confidence Score (%)" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-[300px] border rounded-md bg-muted/50">
                  <p className="text-muted-foreground">No performance data available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tokens" className="min-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Spinner size="lg" />
                </div>
              ) : analyticsData?.analytics ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatChartData(analyticsData.analytics)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="inputTokens" 
                      name="Input Tokens" 
                      fill="#8884d8" 
                      stackId="tokens" 
                    />
                    <Bar 
                      dataKey="outputTokens" 
                      name="Output Tokens" 
                      fill="#82ca9d" 
                      stackId="tokens" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-[300px] border rounded-md bg-muted/50">
                  <p className="text-muted-foreground">No token usage data available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-xs text-muted-foreground">
            {analyticsData && (
              <p>
                Showing {analyticsData.analytics?.length || 0} data points for {selectedModel.name}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
