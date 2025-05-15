"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Play, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface ContextRule {
    id: number
    name: string
    description: string | null
    conditions: Record<string, any>[]
    settings: Record<string, any>
    priority: number
    is_active: boolean
}

interface ContextRuleTesterProps {
    rule: ContextRule
    onTest: (ruleId: number, context: Record<string, any>) => Promise<any>
}

export function ContextRuleTester({
    rule,
    onTest,
}: ContextRuleTesterProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [contextData, setContextData] = useState<string>("{}")
    const [testResult, setTestResult] = useState<{ matches: boolean } | null>(null)
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const handleContextDataChange = (data: string) => {
        setContextData(data)
        // Reset test results when data changes
        if (testResult) {
            setTestResult(null)
        }
        if (hasError) {
            setHasError(false)
            setErrorMessage("")
        }
    }

    const handleTest = async () => {
        try {
            setIsLoading(true)
            setHasError(false)
            setErrorMessage("")

            // Validate JSON
            let parsedData: Record<string, any>
            try {
                parsedData = JSON.parse(contextData)
            } catch (err) {
                setHasError(true)
                setErrorMessage("Invalid JSON format. Please check your input.")
                return
            }

            const result = await onTest(rule.id, parsedData)
            setTestResult(result)
        } catch (error) {
            console.error("Failed to test rule:", error)
            setHasError(true)
            setErrorMessage("Failed to test rule. Please try again.")

            toast({
                title: "Error",
                description: "Failed to test context rule.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Test Rule: {rule.name}</span>
                        {testResult && (
                            <Badge variant={testResult.matches ? "success" : "destructive"}>
                                {testResult.matches ? "Matches" : "No Match"}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Enter Context Data (JSON)</h3>
                            <Textarea
                                value={contextData}
                                onChange={(e) => handleContextDataChange(e.target.value)}
                                placeholder='{
  "user": {
    "name": "John",
    "locale": "en-US"
  },
  "session": {
    "isReturning": true
  }
}'
                                rows={10}
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Enter a JSON object representing the context to test against this rule
                            </p>
                        </div>

                        {hasError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}

                        {testResult && (
                            <div className="bg-muted p-4 rounded-md">
                                <div className="flex items-center mb-2">
                                    {testResult.matches ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                    )}
                                    <h3 className="font-medium">
                                        {testResult.matches
                                            ? "Context matches this rule"
                                            : "Context does not match this rule"}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {testResult.matches
                                        ? "All conditions in this rule are satisfied by the provided context."
                                        : "One or more conditions in this rule failed to match the provided context."}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleTest} disabled={isLoading}>
                        <Play className="h-4 w-4 mr-2" />
                        Test Rule
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rule Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                    {rule.conditions.length === 0 ? (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                This rule has no conditions. Add conditions in the Rule Editor tab.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-2">
                            {rule.conditions.map((condition, index) => (
                                <div key={index} className="p-3 border rounded-md">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <Badge variant="outline" className="font-mono">
                                            {condition.field}
                                        </Badge>
                                        <span className="text-sm font-medium">{condition.operator}</span>
                                        {condition.operator !== "exists" && condition.operator !== "not_exists" && (
                                            <Badge variant="secondary" className="font-mono">
                                                {typeof condition.value === 'object'
                                                    ? JSON.stringify(condition.value)
                                                    : String(condition.value)
                                                }
                                            </Badge>
                                        )}
                                        {condition.required && (
                                            <Badge variant="default" className="text-xs">
                                                Required
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 