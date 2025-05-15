"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Search, Trash2, Save, Database } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SessionContextManagerProps {
    getSessionContext: (sessionId: string) => Promise<Record<string, any>>
    storeSessionContext: (sessionId: string, data: Record<string, any>) => Promise<any>
    clearSessionContext: (sessionId: string) => Promise<boolean | undefined>
}

export function SessionContextManager({
    getSessionContext,
    storeSessionContext,
    clearSessionContext,
}: SessionContextManagerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState("")
    const [contextData, setContextData] = useState<string>("{}")
    const [sessionContextData, setSessionContextData] = useState<Record<string, any> | null>(null)
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const handleSessionIdChange = (id: string) => {
        setSessionId(id)
        // Reset when session ID changes
        if (sessionContextData) {
            setSessionContextData(null)
        }
    }

    const handleContextDataChange = (data: string) => {
        setContextData(data)
        if (hasError) {
            setHasError(false)
            setErrorMessage("")
        }
    }

    const handleGetSessionContext = async () => {
        if (!sessionId.trim()) {
            setHasError(true)
            setErrorMessage("Session ID is required.")
            return
        }

        try {
            setIsLoading(true)
            setHasError(false)
            setErrorMessage("")

            const data = await getSessionContext(sessionId)
            setSessionContextData(data)
            setContextData(JSON.stringify(data, null, 2))
        } catch (error) {
            console.error("Failed to get session context:", error)
            setHasError(true)
            setErrorMessage("Failed to get session context data. Please check the session ID and try again.")

            toast({
                title: "Error",
                description: "Failed to get session context data.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleStoreSessionContext = async () => {
        if (!sessionId.trim()) {
            setHasError(true)
            setErrorMessage("Session ID is required.")
            return
        }

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
                setIsLoading(false)
                return
            }

            await storeSessionContext(sessionId, parsedData)
            setSessionContextData(parsedData)

            toast({
                title: "Success",
                description: "Session context data stored successfully.",
            })
        } catch (error) {
            console.error("Failed to store session context:", error)
            setHasError(true)
            setErrorMessage("Failed to store session context data. Please try again.")

            toast({
                title: "Error",
                description: "Failed to store session context data.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearSessionContext = async () => {
        if (!sessionId.trim()) {
            setHasError(true)
            setErrorMessage("Session ID is required.")
            return
        }

        try {
            setIsLoading(true)
            setHasError(false)
            setErrorMessage("")

            const result = await clearSessionContext(sessionId)

            if (result) {
                setSessionContextData(null)
                setContextData("{}")

                toast({
                    title: "Success",
                    description: "Session context data cleared successfully.",
                })
            } else {
                toast({
                    title: "No Data",
                    description: "No context data found for this session ID.",
                })
            }
        } catch (error) {
            console.error("Failed to clear session context:", error)
            setHasError(true)
            setErrorMessage("Failed to clear session context data. Please try again.")

            toast({
                title: "Error",
                description: "Failed to clear session context data.",
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
                    <CardTitle>Session Context Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="retrieve">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="retrieve">Retrieve Context</TabsTrigger>
                            <TabsTrigger value="update">Update Context</TabsTrigger>
                        </TabsList>

                        <TabsContent value="retrieve" className="pt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="session-id">Session ID</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="session-id"
                                            value={sessionId}
                                            onChange={(e) => handleSessionIdChange(e.target.value)}
                                            placeholder="Enter session ID"
                                        />
                                        <Button
                                            onClick={handleGetSessionContext}
                                            disabled={isLoading}
                                        >
                                            <Search className="h-4 w-4 mr-2" />
                                            Retrieve
                                        </Button>
                                    </div>
                                </div>

                                {hasError && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                {sessionContextData !== null && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Session Context Data</h3>
                                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-80">
                                            <pre className="text-sm font-mono whitespace-pre-wrap">
                                                {JSON.stringify(sessionContextData, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={handleClearSessionContext}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Clear Context
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {sessionContextData === null && !hasError && (
                                    <div className="py-8 text-center">
                                        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            Enter a session ID and click Retrieve to view context data
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="update" className="pt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="update-session-id">Session ID</Label>
                                    <Input
                                        id="update-session-id"
                                        value={sessionId}
                                        onChange={(e) => handleSessionIdChange(e.target.value)}
                                        placeholder="Enter session ID"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="context-data">Context Data (JSON)</Label>
                                    <Textarea
                                        id="context-data"
                                        value={contextData}
                                        onChange={(e) => handleContextDataChange(e.target.value)}
                                        placeholder='{
  "user": {
    "name": "John",
    "preferences": {
      "language": "en-US",
      "theme": "dark"
    }
  },
  "session": {
    "startTime": "2023-08-15T12:00:00Z",
    "isReturning": true,
    "queryCount": 5
  }
}'
                                        rows={10}
                                        className="font-mono"
                                    />
                                </div>

                                {hasError && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="justify-end">
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={handleClearSessionContext}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Context
                        </Button>
                        <Button
                            onClick={handleStoreSessionContext}
                            disabled={isLoading}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Context
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
} 