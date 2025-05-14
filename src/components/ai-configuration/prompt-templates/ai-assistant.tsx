import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Wand2, Check, MessageSquare, Sparkles, Copy, BookText } from "lucide-react";

// Mock AI service - replace with actual implementation
const mockAiService = {
    async generateSuggestion(prompt: string, currentTemplate?: string): Promise<string> {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return mock responses based on the prompt
        if (prompt.includes("customer service")) {
            return `You are a helpful customer service assistant for {{company_name}}. Your goal is to provide accurate, friendly, and concise information to customers.

When responding to customer inquiries:
1. Address the customer by name if available: "Hello {{customer_name}}!"
2. Be empathetic to their concerns
3. Provide clear, step-by-step solutions when applicable
4. Include relevant {{company_name}} policies when necessary
5. Offer additional help: "Is there anything else I can assist you with?"

Remember to maintain a professional yet friendly tone throughout the conversation.`;
        } else if (prompt.includes("creative")) {
            return `As a creative writing assistant, I'll help you craft engaging and imaginative content.

When you provide a writing prompt, I'll consider:
- The genre ({{genre}})
- Target audience ({{audience}})
- Desired tone ({{tone|lowercase}})
- Length constraints ({{#if max_length}}up to {{max_length}} words{{else}}any length{{/if}})

I'll avoid clichés, focus on originality, and help develop compelling characters and plots. I'll also provide constructive feedback on your own writing if requested.

Let's create something {{tone}} and captivating together!`;
        } else {
            return `You are an AI assistant for {{company_name}}. Your primary goal is to be helpful, harmless, and honest in all interactions.

When responding to user queries:
1. Be concise and accurate
2. Provide relevant information based on {{knowledge_source}}
3. If you don't know something, admit it clearly
4. Maintain a {{tone|lowercase}} tone throughout
5. Ask clarifying questions when needed

Remember to respect user privacy and avoid making assumptions about their identity, beliefs, or situation.`;
        }
    },

    async improveTemplate(template: string): Promise<string> {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return an "improved" version with small enhancements
        return template
            .replace("You are an AI assistant", "You are a helpful AI assistant specialized in {{domain}}")
            .replace("Be concise", "Be concise yet thorough")
            .replace("user queries", "user queries about {{topic}}")
            + "\n\n{{#if include_examples}}Here are some examples of how to respond to common questions:\n1. Question about pricing: Provide current rates and any applicable discounts\n2. Question about availability: Check the current system status before responding\n3. Technical questions: Use simple language and avoid jargon unless the user seems technical{{/if}}";
    }
};

interface AIAssistantProps {
    currentTemplate: string;
    onApplySuggestion: (suggestion: string) => void;
    onSuggestionSelect?: (suggestion: string) => void;
}

export function AIAssistant({ currentTemplate, onApplySuggestion, onSuggestionSelect }: AIAssistantProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [suggestion, setSuggestion] = useState("");
    const [activeTab, setActiveTab] = useState<"generate" | "improve" | "examples">("generate");

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const result = await mockAiService.generateSuggestion(prompt, currentTemplate);
            setSuggestion(result);
        } catch (error) {
            console.error("Error generating suggestion:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImprove = async () => {
        if (!currentTemplate.trim()) {
            setSuggestion("Please enter a template to improve.");
            return;
        }

        setIsImproving(true);
        try {
            const result = await mockAiService.improveTemplate(currentTemplate);
            setSuggestion(result);
        } catch (error) {
            console.error("Error improving template:", error);
        } finally {
            setIsImproving(false);
        }
    };

    const handleApplySuggestion = () => {
        if (suggestion.trim()) {
            onApplySuggestion(suggestion);
            if (onSuggestionSelect) {
                onSuggestionSelect(suggestion);
            }
        }
    };

    const examples = [
        {
            name: "Customer Service Template",
            description: "A template for customer support conversations",
            content: `You are a customer service representative for {{company_name}}. Your goal is to help customers resolve their issues efficiently and with a positive attitude.

Please follow these guidelines:
1. Greet the customer warmly: "Hello {{customer_name}}, thank you for contacting {{company_name}} support."
2. Address their concern directly and empathetically
3. Provide clear solutions or next steps
4. Ask if they need further assistance
5. End with a friendly closing: "Thank you for choosing {{company_name}}!"

Remember to keep responses concise, helpful, and in a {{tone}} tone.`
        },
        {
            name: "FAQ Assistant Template",
            description: "Structured template for answering frequently asked questions",
            content: `I'm an FAQ assistant for {{product_name}}. I'll provide clear and concise answers to your questions about our product.

When answering, I will:
- Start with a direct answer to your question
- Provide additional context if relevant
- Include links to documentation when helpful
- Suggest related features you might be interested in

{{#if technical_user}}
I'll include technical details appropriate for developers or power users.
{{else}}
I'll use simple, non-technical language.
{{/if}}`
        },
        {
            name: "Creative Writing Coach",
            description: "Helps with creative writing and storytelling",
            content: `I'm your creative writing coach focused on {{genre}} writing. I can help with:

- Generating story ideas based on your interests
- Developing compelling characters
- Crafting engaging dialogue
- Building immersive settings
- Polishing your narrative structure

I'll tailor my feedback to {{skill_level}} writers and focus on {{focus_area}} as you requested.

{{#if want_examples}}
Here are some examples to inspire you:
1. Character introduction: "The old man entered the room, his weathered hands trembling slightly as he removed his hat."
2. Setting description: "The forest whispered secrets as darkness fell, branches creaking like old floorboards."
{{/if}}

How would you like to begin our creative journey today?`
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Wand2 className="h-5 w-5 mr-2" />
                        AI Template Assistant
                    </CardTitle>
                    <CardDescription>
                        Get help generating or improving your prompt templates
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="generate">Generate</TabsTrigger>
                            <TabsTrigger value="improve">Improve</TabsTrigger>
                            <TabsTrigger value="examples">Examples</TabsTrigger>
                        </TabsList>

                        <TabsContent value="generate">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="prompt" className="text-sm font-medium">
                                        Describe what you want your template to do
                                    </label>
                                    <Textarea
                                        id="prompt"
                                        placeholder="E.g., Create a template for a customer service assistant that helps with product inquiries"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        rows={5}
                                        className="resize-none"
                                    />
                                </div>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt.trim()}
                                    className="w-full"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate Template
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="improve">
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Let AI analyze your current template and suggest improvements.
                                </p>
                                <Button
                                    onClick={handleImprove}
                                    disabled={isImproving || !currentTemplate.trim()}
                                    className="w-full"
                                >
                                    {isImproving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Improving...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="h-4 w-4 mr-2" />
                                            Improve Current Template
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="examples">
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-4">
                                    {examples.map((example, index) => (
                                        <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-base">{example.name}</CardTitle>
                                                <CardDescription className="text-xs">{example.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        setSuggestion(example.content);
                                                    }}
                                                >
                                                    <BookText className="h-4 w-4 mr-2" />
                                                    Load Example
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        AI Suggestion
                    </CardTitle>
                    <CardDescription>
                        Review and apply the template suggestion
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {suggestion ? (
                        <>
                            <div className="border rounded-md p-4 bg-muted/30">
                                <div className="flex items-start space-x-4 mb-4">
                                    <Avatar className="h-8 w-8 bg-primary/20">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium">AI Assistant</h4>
                                        <p className="text-xs text-muted-foreground">Template suggestion</p>
                                    </div>
                                </div>
                                <Separator className="my-2" />
                                <ScrollArea className="h-[300px] mt-2">
                                    <div className="whitespace-pre-wrap text-sm font-mono">
                                        {suggestion}
                                    </div>
                                </ScrollArea>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        navigator.clipboard.writeText(suggestion);
                                    }}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleApplySuggestion}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Apply
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-center p-8">
                            {(isGenerating || isImproving) ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                                    <p>Thinking...</p>
                                </div>
                            ) : (
                                <>
                                    <p>
                                        {activeTab === "generate"
                                            ? "Enter a description and click 'Generate Template'"
                                            : activeTab === "improve"
                                                ? "Click 'Improve Current Template' to get suggestions"
                                                : "Select an example to view a template"}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 