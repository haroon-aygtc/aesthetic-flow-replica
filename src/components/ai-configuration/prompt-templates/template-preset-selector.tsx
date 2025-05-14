import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TemplatePreset {
    id: string;
    name: string;
    description: string;
    templateType: string;
    icon: string;
}

interface TemplatePresetSelectorProps {
    templateType: string;
    onPresetSelect: (presetId: string) => void;
}

export function TemplatePresetSelector({ templateType, onPresetSelect }: TemplatePresetSelectorProps) {
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

    // Filter presets based on the template type
    const filteredPresets = TEMPLATE_PRESETS.filter(
        preset => preset.templateType === templateType || preset.templateType === 'all'
    );

    const handleSelectPreset = (presetId: string) => {
        setSelectedPresetId(presetId);
        onPresetSelect(presetId);
    };

    if (filteredPresets.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium">Preset Templates</h3>
            <div className="text-sm text-muted-foreground mb-2">
                Start with a pre-built template or create your own from scratch
            </div>

            <ScrollArea className="max-h-72">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredPresets.map((preset) => (
                        <Card
                            key={preset.id}
                            className={cn(
                                "cursor-pointer transition-all hover:border-primary",
                                selectedPresetId === preset.id && "border-primary bg-primary/5"
                            )}
                            onClick={() => handleSelectPreset(preset.id)}
                        >
                            <CardHeader className="p-3">
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <CardTitle className="text-base">{preset.name}</CardTitle>
                                    </div>
                                    {selectedPresetId === preset.id && (
                                        <Check className="h-5 w-5 text-primary" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <CardDescription>{preset.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="p-3 pt-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectPreset(preset.id);
                                    }}
                                >
                                    Use this preset
                                    <ChevronRight className="ml-1 h-3 w-3" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

// Preset templates by category
const TEMPLATE_PRESETS: TemplatePreset[] = [
    // Customer Support Templates
    {
        id: "cs-general",
        name: "General Support",
        description: "A versatile template for handling general customer inquiries and providing assistance.",
        templateType: "customer_support",
        icon: "💬"
    },
    {
        id: "cs-troubleshooting",
        name: "Troubleshooting Guide",
        description: "Step-by-step guidance for resolving customer issues and technical problems.",
        templateType: "customer_support",
        icon: "🔧"
    },
    {
        id: "cs-faq",
        name: "FAQ Assistant",
        description: "Quickly answer common questions using a knowledge base of frequently asked questions.",
        templateType: "customer_support",
        icon: "❓"
    },

    // General Assistant Templates
    {
        id: "ga-helpful",
        name: "Helpful Assistant",
        description: "A friendly, conversational assistant that provides helpful responses to diverse inquiries.",
        templateType: "general_assistant",
        icon: "🤖"
    },
    {
        id: "ga-expert",
        name: "Expert Advisor",
        description: "A knowledgeable assistant that provides detailed, authoritative information.",
        templateType: "general_assistant",
        icon: "🧠"
    },
    {
        id: "ga-simple",
        name: "Simple Assistant",
        description: "A straightforward assistant that provides brief, direct answers to questions.",
        templateType: "general_assistant",
        icon: "📝"
    },

    // Creative Writing Templates
    {
        id: "cw-storyteller",
        name: "Storyteller",
        description: "Craft engaging narratives with rich characters and compelling plots.",
        templateType: "creative_writing",
        icon: "📚"
    },
    {
        id: "cw-blogger",
        name: "Blog Writer",
        description: "Generate informative and engaging blog content on various topics.",
        templateType: "creative_writing",
        icon: "✍️"
    },
    {
        id: "cw-copywriter",
        name: "Copywriting Expert",
        description: "Create persuasive marketing copy and compelling sales messaging.",
        templateType: "creative_writing",
        icon: "📣"
    },

    // Technical Support Templates
    {
        id: "ts-software",
        name: "Software Support",
        description: "Technical guidance for software issues, bugs, and feature questions.",
        templateType: "technical_support",
        icon: "💻"
    },
    {
        id: "ts-hardware",
        name: "Hardware Troubleshooting",
        description: "Step-by-step diagnostics and solutions for hardware-related problems.",
        templateType: "technical_support",
        icon: "🔌"
    },
    {
        id: "ts-developer",
        name: "Developer Assistant",
        description: "Technical support focused on API usage, code examples, and development issues.",
        templateType: "technical_support",
        icon: "👨‍💻"
    },

    // Custom Templates
    {
        id: "custom-basic",
        name: "Basic Framework",
        description: "A simple template framework that you can easily customize to your needs.",
        templateType: "custom",
        icon: "🧩"
    },
    {
        id: "custom-blank",
        name: "Blank Canvas",
        description: "Start with a completely blank template and build from scratch.",
        templateType: "custom",
        icon: "📄"
    }
]; 