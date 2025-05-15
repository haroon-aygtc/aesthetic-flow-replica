import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { knowledgeBaseService } from "@/utils/knowledge-base-service";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart4 as BarChartIcon, BarChart as BarChartIcon2, FileText, MessageSquare, Search } from "lucide-react";

interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  status: string;
  created_at: string;
  category: string;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
}

interface KnowledgeInsightsProps {
  documents: KnowledgeDocument[];
  qaPairs: QAPair[];
}

export function KnowledgeInsights(_props: KnowledgeInsightsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("30days");
  const { toast } = useToast();

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      const response = await knowledgeBaseService.getInsights(timeframe);

      // Validate the response data structure
      if (!response.data || !response.data.data) {
        throw new Error('Invalid insights data format received from API');
      }

      setInsightsData(response.data);
    } catch (error) {
      console.error("Error fetching insights data:", error);

      // Clear any previous data to avoid showing stale information
      setInsightsData(null);

      // Show detailed error message to the user
      toast({
        title: "Error fetching insights",
        description: error instanceof Error
          ? `Could not load knowledge base insights: ${error.message}`
          : "Could not load knowledge base insights. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use useCallback to memoize the fetchInsights function
  const memoizedFetchInsights = useCallback(fetchInsights, [timeframe, toast]);

  useEffect(() => {
    memoizedFetchInsights();
  }, [memoizedFetchInsights]);

  // If no insights data is available, show a message
  if (!insightsData && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">No insights data available.</p>
        <Button onClick={() => fetchInsights()}>Refresh Data</Button>
      </div>
    );
  }

  const data = insightsData?.data || {};
  const summary = data?.summary || {};

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Knowledge Base Insights</h2>
        <Select
          value={timeframe}
          onValueChange={setTimeframe}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
              <h3 className="text-3xl font-bold">{summary.totalDocuments || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Q&A Pairs</p>
              <h3 className="text-3xl font-bold">{summary.totalQaPairs || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Search className="h-8 w-8 text-green-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Queries</p>
              <h3 className="text-3xl font-bold">{summary.totalQueries || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <BarChartIcon className="h-8 w-8 text-orange-500" />
              <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
              <h3 className="text-3xl font-bold">{summary.averageResponseTime || '0ms'}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon2 className="h-5 w-5" />
              <span>Top Documents by Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topDocuments || []}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" />
              <span>Queries Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.queriesOverTime || []}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="queries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            <span>Category Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryDistribution || []}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="documents" name="Documents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qaPairs" name="Q&A Pairs" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => window.print()}>
          Export Report
        </Button>
      </div>
    </div>
  );
}
