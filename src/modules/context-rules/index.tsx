"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContext } from "@/hooks/use-context"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { ContextRuleManager } from "@/components/ai-configuration/context/context-rule-manager"
import { ContextRuleEditor } from "@/components/ai-configuration/context/context-rule-editor"
import { ContextRuleTester } from "@/components/ai-configuration/context/context-rule-tester"
import { SessionContextManager } from "@/components/ai-configuration/context/session-context-manager"

interface ContextModuleProps {
  widgetId?: number
}

export function ContextRulesModule({ widgetId }: ContextModuleProps) {
  const [activeTab, setActiveTab] = useState("rules")

  const {
    isLoading,
    error,
    rules,
    selectedRule,
    setSelectedRule,
    createRule,
    updateRule,
    deleteRule,
    testRule,
    getSessionContext,
    storeSessionContext,
    clearSessionContext,
  } = useContext({ widgetId })

  if (isLoading && rules.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" className="mr-2" />
        <p>Loading context configuration...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load context configuration. Please try refreshing the page.
          <p className="mt-2">{error.message}</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Context Module</CardTitle>
          <CardDescription>
            Configure context-based rules for smarter AI responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rules" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger
                value="editor"
                disabled={!selectedRule}
              >
                Rule Editor
              </TabsTrigger>
              <TabsTrigger
                value="testing"
                disabled={!selectedRule}
              >
                Rule Testing
              </TabsTrigger>
              <TabsTrigger value="sessions">Session Context</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="pt-4">
              <ContextRuleManager
                rules={rules}
                selectedRule={selectedRule}
                onSelect={setSelectedRule}
                onCreate={createRule}
                onUpdate={updateRule}
                onDelete={deleteRule}
              />
            </TabsContent>

            <TabsContent value="editor" className="pt-4">
              {selectedRule ? (
                <ContextRuleEditor
                  rule={selectedRule}
                  onUpdate={updateRule}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select a rule first to edit its conditions.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="testing" className="pt-4">
              {selectedRule ? (
                <ContextRuleTester
                  rule={selectedRule}
                  onTest={testRule}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select a rule first to test it with sample data.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="pt-4">
              <SessionContextManager
                getSessionContext={getSessionContext}
                storeSessionContext={storeSessionContext}
                clearSessionContext={clearSessionContext}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
