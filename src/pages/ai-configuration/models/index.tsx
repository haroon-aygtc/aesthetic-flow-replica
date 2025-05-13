import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { ModelsTable } from "@/components/ai-configuration/model-management/models-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/layouts/admin-layout";

export default function ModelsPage() {
  const [models, setModels] = useState<AIModelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modelToDelete, setModelToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        const modelsData = await aiModelService.getModels();
        setModels(modelsData);
      } catch (error: any) {
        console.error("Failed to fetch models:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load models",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [toast]);

  // Handle model deletion
  const handleDeleteModel = async (id: number) => {
    setModelToDelete(id);
  };

  const confirmDelete = async () => {
    if (!modelToDelete) return;

    try {
      await aiModelService.deleteModel(modelToDelete);
      setModels(models.filter((model) => model.id !== modelToDelete));
      toast({
        title: "Success",
        description: "Model deleted successfully",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Failed to delete model:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete model",
        variant: "destructive",
      });
    } finally {
      setModelToDelete(null);
    }
  };

  // Handle setting a model as default
  const handleSetDefaultModel = async (id: number) => {
    try {
      await aiModelService.setDefaultModel(id);
      
      // Update local state to reflect the change
      setModels(models.map(model => ({
        ...model,
        is_default: model.id === id
      })));
      
      toast({
        title: "Success",
        description: "Default model updated successfully",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Failed to set default model:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set default model",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <ModelsTable
            models={models}
            isLoading={isLoading}
            onDelete={handleDeleteModel}
            onSetDefault={handleSetDefaultModel}
          />
        </div>
        
        <AlertDialog open={modelToDelete !== null} onOpenChange={() => setModelToDelete(null)}>
          <AlertDialogContent className="animate-scale">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the model
                and any associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
} 