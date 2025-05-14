import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { useToast } from "@/hooks/use-toast";
import { ModelForm } from "@/components/ai-configuration/model-management/model-form";
import AdminLayout from "@/components/layouts/admin-layout";

export default function EditModelPage() {
  const router = useRouter();
  const { id } = router.query;
  const [model, setModel] = useState<AIModelData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchModel() {
      if (!id) return;

      try {
        setIsLoading(true);
        const modelData = await aiModelService.getModel(parseInt(id as string));
        setModel(modelData);
      } catch (error: any) {
        console.error("Failed to fetch model:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load model data",
          variant: "destructive",
        });
        router.push("/ai-configuration/models");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchModel();
    }
  }, [id, router, toast]);

  // Note: We don't need this handleFormSubmit function anymore as it's handled by the ModelForm component
  // The ModelForm component uses useModelForm hook which already handles the form submission

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading model data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ModelForm
        initialModel={model}
        mode="edit"
      />
    </AdminLayout>
  );
}