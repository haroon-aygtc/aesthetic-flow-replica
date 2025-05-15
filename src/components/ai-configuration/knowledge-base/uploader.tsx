"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { FileUp, AlertCircle, CheckCircle } from "lucide-react"

interface KnowledgeBase {
    id: number
    name: string
    description: string | null
    settings: Record<string, any>
    is_active: boolean
}

interface KnowledgeBaseUploaderProps {
    knowledgeBase: KnowledgeBase
    onUpload: (file: File, sourceName: string, description?: string) => Promise<any>
}

export function KnowledgeBaseUploader({
    knowledgeBase,
    onUpload,
}: KnowledgeBaseUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [sourceName, setSourceName] = useState("")
    const [description, setDescription] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            // If source name is empty, use the file name without extension as the default
            if (!sourceName) {
                const fileName = selectedFile.name
                const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.')
                setSourceName(nameWithoutExtension || fileName)
            }
            setUploadSuccess(false)
            setUploadError(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!file) {
            setUploadError("Please select a file to upload")
            return
        }

        if (!sourceName) {
            setUploadError("Please provide a name for the source")
            return
        }

        try {
            setIsUploading(true)
            setUploadProgress(0)
            setUploadError(null)

            // Simulate progress for better UX 
            // In a real implementation, you'd use xhr or fetch with progress tracking
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = Math.min(prev + 5, 90)
                    return newProgress
                })
            }, 100)

            await onUpload(file, sourceName, description || undefined)

            clearInterval(progressInterval)
            setUploadProgress(100)
            setUploadSuccess(true)

            toast({
                title: "Upload successful",
                description: "Your document has been uploaded and is being processed.",
            })

            // Reset form after successful upload
            setTimeout(() => {
                setFile(null)
                setSourceName("")
                setDescription("")
                setUploadProgress(0)
                setIsUploading(false)
            }, 2000)
        } catch (error) {
            setUploadError((error as Error).message || "Failed to upload file")
            setUploadProgress(0)
            setIsUploading(false)

            toast({
                title: "Upload failed",
                description: (error as Error).message || "Failed to upload file",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Document</CardTitle>
                        <CardDescription>
                            Upload documents to add to the knowledge base "{knowledgeBase.name}".
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="file">Select File</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                    className="flex-1"
                                />
                                <div className="w-[200px] text-sm text-muted-foreground">
                                    {file && (
                                        <>
                                            {file.name} ({Math.round(file.size / 1024)} KB)
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Supported file types: PDF, DOC, DOCX, TXT, CSV, XLSX, XLS (max 10MB)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="source-name">Source Name</Label>
                            <Input
                                id="source-name"
                                value={sourceName}
                                onChange={(e) => setSourceName(e.target.value)}
                                placeholder="Enter a name for this source"
                                disabled={isUploading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="source-description">Description (Optional)</Label>
                            <Textarea
                                id="source-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter a description for this source"
                                disabled={isUploading}
                                rows={3}
                            />
                        </div>

                        {uploadError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Upload Error</AlertTitle>
                                <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                        )}

                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}

                        {uploadSuccess && (
                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-600">Upload Successful</AlertTitle>
                                <AlertDescription className="text-green-700">
                                    Your document has been uploaded and is being processed.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isUploading || !file}>
                            {isUploading ? (
                                <>Uploading...</>
                            ) : (
                                <>
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Upload Document
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            <div className="text-sm text-muted-foreground">
                <h4 className="font-medium mb-2">File Processing Information</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Large files may take a few minutes to process after uploading.</li>
                    <li>Text from uploaded documents will be extracted and added to the knowledge base.</li>
                    <li>For best results, ensure your documents contain high-quality, well-structured text.</li>
                    <li>Text extraction works best with searchable PDFs and modern document formats.</li>
                </ul>
            </div>
        </div>
    )
} 