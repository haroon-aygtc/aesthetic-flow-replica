import { Button } from "@/components/ui/button";
import { MessageSquare, HelpCircle } from "lucide-react";
import { Suggestion, FollowUpConfigValues } from "./follow-up-schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FollowUpPreviewProps {
  config: FollowUpConfigValues;
  suggestions: Suggestion[];
}

export function FollowUpPreview({ config, suggestions }: FollowUpPreviewProps) {
  const activeSuggestions = suggestions
    .filter((s) => s.active === true)
    .slice(0, parseInt(config.suggestionsCount));

  const renderSuggestion = (suggestion: Suggestion) => {
    switch (suggestion.format) {
      case "link":
        return (
          <a
            href={suggestion.url || "#"}
            className="text-primary underline text-sm hover:text-primary/80 transition-colors"
            key={suggestion.id}
          >
            {suggestion.text}
          </a>
        );

      case "bubble":
        return (
          <div
            key={suggestion.id}
            className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm"
          >
            {suggestion.text}
          </div>
        );

      case "tooltip":
        return (
          <TooltipProvider key={suggestion.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    config.buttonStyle === "rounded" ? "rounded-full" :
                    config.buttonStyle === "square" ? "rounded-none" :
                    ""
                  }
                >
                  {suggestion.text} <HelpCircle className="h-3.5 w-3.5 ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{suggestion.tooltip_text || "Additional information"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );

      case "card":
        return (
          <Popover key={suggestion.id}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className={
                  config.buttonStyle === "rounded" ? "rounded-full" :
                  config.buttonStyle === "square" ? "rounded-none" :
                  ""
                }
              >
                {suggestion.text}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">{suggestion.text}</h4>
                <p className="text-sm text-muted-foreground">
                  Click to learn more about this topic
                </p>
                <Button className="w-full mt-2" size="sm" asChild>
                  <a href={suggestion.url || "#"}>Learn More</a>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        );

      default: // button
        return (
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
        );
    }
  };

  return (
    <div className="border rounded-md p-4 bg-muted/50 space-y-3">
      {config.position === "start" && config.enableFollowUp && (
        <div className="ml-10 flex flex-wrap gap-2 pb-2">
          {activeSuggestions.map(renderSuggestion)}
        </div>
      )}

      <div className="flex gap-2">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm">
            Thank you for your question. Here's information about our product features. Is there anything else you'd like to know?

            {config.position === "inline" && config.enableFollowUp && (
              <span className="block mt-2 flex flex-wrap gap-2">
                {activeSuggestions.map(renderSuggestion)}
              </span>
            )}
          </p>
        </div>
      </div>

      {config.position === "end" && config.enableFollowUp && (
        <div className="ml-10 flex flex-wrap gap-2 pt-1">
          {activeSuggestions.map(renderSuggestion)}
        </div>
      )}
    </div>
  );
}
