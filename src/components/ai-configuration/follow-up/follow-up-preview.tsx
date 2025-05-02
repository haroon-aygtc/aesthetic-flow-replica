
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Suggestion } from "./follow-up-schema";
import { FollowUpConfigValues } from "./follow-up-schema";

interface FollowUpPreviewProps {
  config: FollowUpConfigValues;
  suggestions: Suggestion[];
}

export function FollowUpPreview({ config, suggestions }: FollowUpPreviewProps) {
  return (
    <div className="border rounded-md p-4 bg-muted/50 space-y-3">
      <div className="flex gap-2">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm">
            Thank you for your question. Here's information about our product features. Is there anything else you'd like to know?
          </p>
        </div>
      </div>
      
      {config.enableFollowUp && (
        <div className="ml-10 flex flex-wrap gap-2 pt-1">
          {suggestions
            .filter((s) => s.active)
            .slice(0, parseInt(config.suggestionsCount))
            .map((suggestion) => (
              <Button 
                key={suggestion.id} 
                variant={config.suggestionsStyle === "outline" ? "outline" : "secondary"} 
                size="sm"
                className={
                  config.buttonStyle === "rounded" ? "rounded-full" :
                  config.buttonStyle === "square" ? "rounded-none" :
                  config.buttonStyle === "minimal" ? "bg-transparent hover:bg-secondary/80" :
                  ""
                }
              >
                {suggestion.text}
              </Button>
            ))
          }
        </div>
      )}
    </div>
  );
}
