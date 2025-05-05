
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { knowledgeBaseService } from "@/utils/knowledge-base-service";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart4 as BarChartIcon, BarChart as BarChartIcon2, FileText, MessageSquare, Search } from "lucide-react";

interface KnowledgeDocument {
  id: string;
  filename: string;
  filetype: string;
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

export function KnowledgeInsights({ documents, qaPairs }: KnowledgeInsightsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("30days");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const response = await knowledgeBaseService.getInsights(timeframe);
        setInsightsData(response.data);
      } catch (error) {
        console.error("Error fetching insights data:", error);
        toast({
          title: "Error fetching insights",
          description: "Could not load knowledge base insights",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [timeframe, toast]);

  // Generate sample data if not available
  const generateSampleData = () => {
    if (!insightsData) {
      // Sample usage data by document
      const topDocumentsData = documents.slice(0, 5).map((doc, index) => ({
        name: doc.filename.length > 20 ? doc.filename.substring(0, 20) + '...' : doc.filename,
        value: Math.floor(Math.random() * 100) + 10,
      }));

      // Sample category distribution
      const categoryData = Array.from(
        new Set([
          ...documents.map(d => d.category),
          ...qaPairs.map(q => q.category)
        ])
      ).map(cat => ({
        name: cat,
        documents: documents.filter(d => d.category === cat).length,
        qaPairs: qaPairs.filter(q => q.category === cat).length,
      }));

      // Sample queries data
      const queriesData = Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          queries: Math.floor(Math.random() * 50) + 5,
        };
      });

      return {
        topDocuments: topDocumentsData,
        categoryDistribution: categoryData,
        queriesOverTime: queriesData,
        summary: {
          totalDocuments: documents.length,
          totalQaPairs: qaPairs.length,
          totalQueries: 347,
          averageResponseTime: "1.2s",
        }
      };
    }
    
    return insightsData;
  };
  
  const data = generateSampleData();

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
              <h3 className="text-3xl font-bold">{data.summary.totalDocuments}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Q&A Pairs</p>
              <h3 className="text-3xl font-bold">{data.summary.totalQaPairs}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Search className="h-8 w-8 text-green-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Queries</p>
              <h3 className="text-3xl font-bold">{data.summary.totalQueries}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <BarChartIcon className="h-8 w-8 text-orange-500" />
              <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
              <h3 className="text-3xl font-bold">{data.summary.averageResponseTime}</h3>
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
                <BarChart data={data.topDocuments} layout="vertical">
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
                <BarChart data={data.queriesOverTime}>
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
              <BarChart data={data.categoryDistribution}>
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
