
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { UseFormWatch } from "react-hook-form";
import { BrandingFormSchema } from "./branding-schema";
import { z } from "zod";

type BrandingPreviewProps = {
  watch: UseFormWatch<z.infer<typeof BrandingFormSchema>>;
};

export function BrandingPreview({ watch }: BrandingPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Brand Preview</CardTitle>
        <CardDescription>
          See how your AI assistant's personality will appear to users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-md p-4 border">
          <div className="flex gap-2 items-center mb-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            <span className="text-xs">AI Assistant Sample Response</span>
          </div>
          <p className="text-sm">
            Hello! I'm your assistant from {watch("brandName") || "[Your Brand]"}. I'm here to help you with any questions you might have about our products and services. Please let me know how I can assist you today!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
