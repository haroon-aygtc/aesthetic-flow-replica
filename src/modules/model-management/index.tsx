
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ModelManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Model Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage your AI models and their settings
        </p>
      </div>
      
      <Tabs defaultValue="models" className="w-full">
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="activation-rules">Activation Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Models</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Currently no models are configured. Click "Add Model" to create your first model.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activation-rules" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Define rules for when specific models should be activated.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View analytics and usage statistics for your AI models.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
