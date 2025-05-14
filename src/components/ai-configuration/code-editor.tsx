import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    placeholder?: string;
    minHeight?: string;
    disabled?: boolean;
}

export function CodeEditor({
    value,
    onChange,
    language = "handlebars",
    placeholder = "Enter your template code here...",
    minHeight = "300px",
    disabled = false
}: CodeEditorProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            const timeout = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timeout);
        }
    }, [copied]);

    const handleCopy = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(value);
            setCopied(true);
        }
    };

    return (
        <div className="relative border rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-2 bg-muted">
                <div className="text-xs font-medium">{language.toUpperCase()}</div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 w-8 p-0"
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="font-mono text-sm bg-background border-0 rounded-none focus-visible:ring-0 resize-none"
                style={{ minHeight }}
                disabled={disabled}
            />
        </div>
    );
}