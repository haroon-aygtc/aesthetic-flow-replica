import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { ModelForm } from "@/components/ai-configuration/model-management/model-form";
import AdminLayout from "@/components/layouts/admin-layout";

export default function NewModelPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleFormSubmit = async (data: AIModelData) => {
    try {
      await aiModelService.createModel(data);
      toast({
        title: "Success",
        description: "New AI model created successfully",
        variant: "success",
      });
      router.push("/ai-configuration/models");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create model",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <ModelForm 
        mode="create"
      />
    </AdminLayout>
  );
} 