
import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ContextRules = () => {
  const [isKnowledgeBaseEnabled, setIsKnowledgeBaseEnabled] = useState(false);

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Context Rules</h1>
            <p className="text-muted-foreground">Define and manage context rules to control AI responses</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Rule
          </Button>
        </div>
        
        <Tabs defaultValue="create-rule" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="rules-list">Rules List</TabsTrigger>
            <TabsTrigger value="create-rule">Create Rule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rules-list" className="space-y-4">
            <p>No rules have been created yet.</p>
            <Button variant="outline">Create your first rule</Button>
          </TabsContent>
          
          <TabsContent value="create-rule">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">Create Context Rule</h2>
                  <p className="text-sm text-muted-foreground">Define a new context rule to control AI responses</p>
                </div>
                
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ruleName">Rule Name</Label>
                    <Input 
                      id="ruleName" 
                      placeholder="E.g., UAE Government Information" 
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the purpose of this context rule" 
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contextType">Context Type</Label>
                    <Select>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Business" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="keywords" 
                        placeholder="Add keyword or phrase" 
                        className="max-w-md"
                      />
                      <Button type="button" size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Keywords help trigger this rule when user queries match
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excludedTopics">Excluded Topics</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="excludedTopics" 
                        placeholder="Add topic to exclude" 
                        className="max-w-md"
                      />
                      <Button type="button" size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Topics that should be avoided in responses
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="responseFilters">Response Filters</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="responseFilters" 
                        placeholder="Add response filter" 
                        className="max-w-md"
                      />
                      <Button type="button" size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Define filters to modify how responses are generated
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Switch 
                      id="active" 
                      checked={true}
                    />
                    <Label htmlFor="active" className="font-medium">Active</Label>
                  </div>
                  
                  <div className="space-y-2 border-t pt-6 mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                          <path d="M1.5 0C0.671573 0 0 0.671574 0 1.5V6C0 6.55228 0.447715 7 1 7H7C7.55228 7 8 6.55228 8 6V1C8 0.447715 7.55228 0 7 0H1.5ZM1 6V1.5C1 1.22386 1.22386 1 1.5 1H7V6H1ZM1.5 8C0.671573 8 0 8.67157 0 9.5V13.5C0 14.3284 0.671573 15 1.5 15H5.5C6.32843 15 7 14.3284 7 13.5V9.5C7 8.67157 6.32843 8 5.5 8H1.5ZM1 9.5C1 9.22386 1.22386 9 1.5 9H5.5C5.77614 9 6 9.22386 6 9.5V13.5C6 13.7761 5.77614 14 5.5 14H1.5C1.22386 14 1 13.7761 1 13.5V9.5ZM9 1C9 0.447715 9.44772 0 10 0H14C14.5523 0 15 0.447715 15 1V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V1ZM10 1H14V5H10V1ZM9 9.5C9 8.67157 9.67157 8 10.5 8H13.5C14.3284 8 15 8.67157 15 9.5V13.5C15 14.3284 14.3284 15 13.5 15H10.5C9.67157 15 9 14.3284 9 13.5V9.5ZM10.5 9C10.2239 9 10 9.22386 10 9.5V13.5C10 13.7761 10.2239 14 10.5 14H13.5C13.7761 14 14 13.7761 14 13.5V9.5C14 9.22386 13.7761 9 13.5 9H10.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                        <Label htmlFor="knowledgeBaseIntegration" className="font-medium">Knowledge Base Integration</Label>
                      </div>
                      <Switch 
                        id="knowledgeBaseIntegration" 
                        checked={isKnowledgeBaseEnabled}
                        onCheckedChange={setIsKnowledgeBaseEnabled}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enable to use your knowledge base documents for this context rule
                    </p>
                    
                    {isKnowledgeBaseEnabled && (
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm mb-2">Select knowledge base sources to use:</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="kb-source-1" className="rounded" />
                            <label htmlFor="kb-source-1" className="text-sm">Product Documentation</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="kb-source-2" className="rounded" />
                            <label htmlFor="kb-source-2" className="text-sm">FAQs</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="kb-source-3" className="rounded" />
                            <label htmlFor="kb-source-3" className="text-sm">Support Articles</label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-start pt-4">
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ContextRules;
