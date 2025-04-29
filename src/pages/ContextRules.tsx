
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Bell, Plus, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 chat-content">
        {/* Top navigation */}
        <header className="border-b bg-background sticky top-0 z-30">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-semibold">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="rounded-md border border-input pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
              </Button>
              
              <Button size="icon" variant="ghost">
                <Settings className="h-5 w-5" />
              </Button>
              
              <ThemeToggle />
              
              <Button variant="ghost" className="gap-2">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">Admin User</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Tab navigation */}
        <div className="border-b bg-background">
          <div className="flex overflow-x-auto px-4 md:px-6">
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M2.5 12.5L2.5 2.5L12.5 2.5V7.5V12.5H2.5Z" stroke="currentColor" strokeWidth="1.5"></path>
                </svg>
                Overview
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M7.49996 1.80002C4.35194 1.80002 1.79996 4.352 1.79996 7.50002C1.79996 10.648 4.35194 13.2 7.49996 13.2C10.648 13.2 13.2 10.648 13.2 7.50002C13.2 4.352 10.648 1.80002 7.49996 1.80002ZM0.899963 7.50002C0.899963 3.85494 3.85488 0.900024 7.49996 0.900024C11.145 0.900024 14.1 3.85494 14.1 7.50002C14.1 11.1451 11.145 14.1 7.49996 14.1C3.85488 14.1 0.899963 11.1451 0.899963 7.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  <path d="M7.49996 5.10002C7.77611 5.10002 7.99996 5.32387 7.99996 5.60002V7.50002C7.99996 7.77617 7.77611 8.00002 7.49996 8.00002H5.59996C5.32381 8.00002 5.09996 7.77617 5.09996 7.50002C5.09996 7.22387 5.32381 7.00002 5.59996 7.00002H6.99996V5.60002C6.99996 5.32387 7.22381 5.10002 7.49996 5.10002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Widget Config
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium bg-secondary">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M12.5 2H8V3H12V12H3V8H2V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V2.5C13 2.22386 12.7761 2 12.5 2ZM2.5 2C2.22386 2 2 2.22386 2 2.5V7H3V3H7V2H2.5ZM9 7H12V6H9V7Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  <path d="M7 5.5C7 5.22386 6.77614 5 6.5 5H2.5C2.22386 5 2 5.22386 2 5.5V9.5C2 9.77614 2.22386 10 2.5 10H6.5C6.77614 10 7 9.77614 7 9.5V5.5ZM3 6H6V9H3V6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Context Rules
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M3 2.5C3 2.22386 3.22386 2 3.5 2H11.5C11.7761 2 12 2.22386 12 2.5V13.5C12 13.7761 11.7761 14 11.5 14H3.5C3.22386 14 3 13.7761 3 13.5V2.5ZM4 3V13H11V3H4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  <path d="M5.5 5C5.22386 5 5 5.22386 5 5.5C5 5.77614 5.22386 6 5.5 6H9.5C9.77614 6 10 5.77614 10 5.5C10 5.22386 9.77614 5 9.5 5H5.5ZM5.5 7C5.22386 7 5 7.22386 5 7.5C5 7.77614 5.22386 8 5.5 8H9.5C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7H5.5ZM5.5 9C5.22386 9 5 9.22386 5 9.5C5 9.77614 5.22386 10 5.5 10H9.5C9.77614 10 10 9.77614 10 9.5C10 9.22386 9.77614 9 9.5 9H5.5ZM5.5 11C5.22386 11 5 11.2239 5 11.5C5 11.7761 5.22386 12 5.5 12H9.5C9.77614 12 10 11.7761 10 11.5C10 11.2239 9.77614 11 9.5 11H5.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Templates
              </Button>
            </div>
            <div className="py-4 pr-6">
              <Button variant="ghost" className="gap-2 font-medium">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L7.5 7.20711L12.1464 11.8536C12.3417 12.0488 12.6583 12.0488 12.8536 11.8536C13.0488 11.6583 13.0488 11.3417 12.8536 11.1464L7.85355 6.14645C7.65829 5.95118 7.34171 5.95118 7.14645 6.14645L2.14645 11.1464ZM2.14645 3.85355L7.14645 8.85355C7.34171 9.04882 7.65829 9.04882 7.85355 8.85355L12.8536 3.85355C13.0488 3.65829 13.0488 3.34171 12.8536 3.14645C12.6583 2.95118 12.3417 2.95118 12.1464 3.14645L7.5 7.79289L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Analytics
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="px-4 md:px-6 py-8">
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
        </main>
      </div>
    </div>
  );
};

export default ContextRules;
