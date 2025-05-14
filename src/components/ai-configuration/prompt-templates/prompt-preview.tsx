import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Copy, MessageSquare, User } from "lucide-react";
import { promptTemplatesApi } from "@/api/prompt-templates";
import { useToast } from "@/components/ui/use-toast";

interface PromptPreviewProps {
    templateContent: string;
    variables: Record<string, any>;
}

export function PromptPreview({ templateContent, variables }: PromptPreviewProps) {
    const [preview, setPreview] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const { toast } = useToast();

    const generatePreview = async () => {
        if (!templateContent?.trim()) {
            setError("Template content is empty");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await promptTemplatesApi.previewTemplate(templateContent, variables);
            setPreview(response.data);
            setConversation(prev => [...prev, { role: 'assistant', content: response.data }]);
        } catch (error) {
            console.error('Error generating preview:', error);
            setError('Failed to generate preview. Please check your template syntax.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(preview);
        toast({
            title: "Copied to clipboard",
            description: "The preview content has been copied to your clipboard"
        });
    };

    const handleUserMessage = (message: string) => {
        if (!message.trim()) return;

        // Add user message to conversation
        setConversation(prev => [...prev, { role: 'user', content: message }]);

        // Use the template to generate a response
        promptTemplatesApi.previewTemplate(
            templateContent,
            {
                ...variables,
                user_message: message,
                conversation_history: conversation
            }
        ).then(response => {
            setConversation(prev => [...prev, { role: 'assistant', content: response.data }]);
        }).catch(error => {
            console.error('Error generating response:', error);
            setError('Failed to generate response');
        });
    };

    // Generate preview when component mounts or template/variables change
    useEffect(() => {
        if (templateContent && Object.keys(variables).length > 0) {
            generatePreview();
        }
    }, [templateContent, variables]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b p-3">
                <h3 className="font-medium">Preview</h3>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={generatePreview}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        <span className="ml-2">Refresh</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        disabled={!preview || isLoading}
                    >
                        <Copy className="h-4 w-4" />
                        <span className="ml-2">Copy</span>
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                {error ? (
                    <div className="text-destructive text-sm p-2 border border-destructive/20 rounded-md bg-destructive/10">
                        {error}
                    </div>
                ) : isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ) : conversation.length > 0 ? (
                    <div className="space-y-4">
                        {conversation.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'assistant'
                                    ? 'justify-start'
                                    : 'justify-end'
                                    }`}
                            >
                                <div
                                    className={`rounded-lg p-3 max-w-[80%] ${message.role === 'assistant'
                                        ? 'bg-muted/30 text-foreground'
                                        : 'bg-primary text-primary-foreground'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2 mb-1">
                                        {message.role === 'assistant' ? (
                                            <MessageSquare className="h-4 w-4" />
                                        ) : (
                                            <User className="h-4 w-4" />
                                        )}
                                        <Badge variant="outline">
                                            {message.role === 'assistant' ? 'Assistant' : 'User'}
                                        </Badge>
                                    </div>
                                    <div className="whitespace-pre-wrap text-sm">
                                        {message.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        Fill in the template variables and click "Generate Preview" to see the result
                    </div>
                )}
            </ScrollArea>

            <div className="border-t p-3">
                <div className="flex gap-2">
                    <Input
                        placeholder="Test with a sample user message..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleUserMessage(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                    <Button
                        variant="default"
                        onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            handleUserMessage(input.value);
                            input.value = '';
                        }}
                    >
                        Send
                    </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                    Send a test message to see how the template responds in a conversation
                </div>
            </div>
        </div>
    );
} 