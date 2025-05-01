
import { AdminLayout } from "@/components/admin-layout";
import { AIModelManager } from "@/components/ai-configuration/ai-model-manager";
import { KnowledgeBaseIntegration } from "@/components/ai-configuration/knowledge-base-integration";
import { PromptTemplateSystem } from "@/components/ai-configuration/prompt-template-system";
import { ResponseFormatter } from "@/components/ai-configuration/response-formatter";
import { BrandingEngine } from "@/components/ai-configuration/branding-engine";
import { FollowUpEngine } from "@/components/ai-configuration/follow-up-engine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Database, FileText, Code, Star, Bell
} from "lucide-react";
import { useState } from "react";

const AIConfiguration = () => {
  const [activeTab, setActiveTab] = useState("models");

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Configure your AI model settings, knowledge base, and response templates
          </p>
        </div>

        <Tabs 
          defaultValue="models" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-8 flex flex-wrap justify-start gap-2">
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              AI Models
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Prompt Templates
            </TabsTrigger>
            <TabsTrigger value="formatter" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Response Formatter
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="followup" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Follow-Up Engine
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="models">
            <AIModelManager />
          </TabsContent>
          
          <TabsContent value="knowledge">
            <KnowledgeBaseIntegration />
          </TabsContent>
          
          <TabsContent value="templates">
            <PromptTemplateSystem />
          </TabsContent>
          
          <TabsContent value="formatter">
            <ResponseFormatter />
          </TabsContent>
          
          <TabsContent value="branding">
            <BrandingEngine />
          </TabsContent>
          
          <TabsContent value="followup">
            <FollowUpEngine />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AIConfiguration;
