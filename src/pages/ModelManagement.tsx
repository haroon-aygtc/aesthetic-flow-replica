
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { 
  AIModelData, 
  aiModelService 
} from "@/utils/ai-model-service";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight,
  Plus, 
  Settings, 
  Book, 
  BarChart3, 
  Trash
} from "lucide-react";
import { ModelSelectionPanel } from "@/modules/model-management/components/model-selection-panel";
import { ModelConfigurationPanel } from "@/modules/model-management/components/model-configuration-panel";
import { ModelActivationRules } from "@/components/ai-configuration/model-management/activation-rules/model-activation-rules";
import { ModelAnalytics } from "@/components/ai-configuration/model-management/model-analytics";
import { AIModelForm } from "@/components/ai-configuration/model-management/ai-model-form";

const ModelManagement = () => {
  const [models, setModels] = useState<AIModelData[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("configuration");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<AIModelData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModelId && models.length) {
      const model = models.find(m => m.id === selectedModelId) || null;
      setSelectedModel(model);
    } else {
      setSelectedModel(null);
    }
  }, [selectedModelId, models]);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const loadedModels = await aiModelService.getModels();
      setModels(loadedModels);
      
      // Select the first model by default or the default model if available
      if (loadedModels.length > 0 && !selectedModelId) {
        const defaultModel = loadedModels.find(m => m.is_default);
        setSelectedModelId(defaultModel?.id || loadedModels[0].id!);
      }
    } catch (error) {
      console.error("Failed to load AI models:", error);
      toast({
        title: "Error",
        description: "Failed to load AI models. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateModel = (updatedModel: AIModelData) => {
    const updatedModels = models.map(m => 
      m.id === updatedModel.id ? updatedModel : m
    );
    setModels(updatedModels);
    setSelectedModel(updatedModel);
    toast({
      title: "Model Updated",
      description: `${updatedModel.name} has been successfully updated.`
    });
  };

  const handleCreateModel = async (modelData: AIModelData) => {
    try {
      const newModel = await aiModelService.createModel(modelData);
      setModels([...models, newModel]);
      setSelectedModelId(newModel.id!);
      setIsModelDialogOpen(false);
      toast({
        title: "Success",
        description: `Model "${newModel.name}" has been created.`
      });
    } catch (error) {
      console.error("Failed to create model:", error);
      toast({
        title: "Error",
        description: "Failed to create the model. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRuleUpdate = () => {
    // Refresh the model data after rule updates
    if (selectedModelId) {
      loadModelDetails(selectedModelId);
    }
  };

  const loadModelDetails = async (modelId: number) => {
    try {
      const model = await aiModelService.getModel(modelId);
      handleUpdateModel(model);
    } catch (error) {
      console.error("Failed to load model details:", error);
    }
  };

  const handleDeleteClick = (model: AIModelData) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!modelToDelete) return;
    
    try {
      await aiModelService.deleteModel(modelToDelete.id!);
      setModels(models.filter(m => m.id !== modelToDelete.id));
      
      // If we deleted the selected model, select another one
      if (selectedModelId === modelToDelete.id) {
        const nextModel = models.find(m => m.id !== modelToDelete.id);
        setSelectedModelId(nextModel?.id || null);
      }
      
      toast({
        title: "Model Deleted",
        description: `${modelToDelete.name} has been successfully deleted.`
      });
    } catch (error) {
      console.error("Failed to delete model:", error);
      toast({
        title: "Error",
        description: "Failed to delete the model. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Model Management</h1>
          <p className="text-muted-foreground">
            Configure AI models, activation rules, fallback settings, and analyze performance
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Advanced Model Management</h2>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Model Selection */}
            <Card className="md:col-span-3">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">AI Models</h2>
                  <Button size="sm" onClick={() => setIsModelDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="py-8 flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <ModelSelectionPanel 
                    models={models} 
                    selectedModelId={selectedModelId} 
                    onModelSelect={setSelectedModelId}
                    onDelete={handleDeleteClick}
                  />
                )}
              </CardContent>
            </Card>

            {/* Model Configuration Tabs */}
            <div className="md:col-span-9">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
                    <Spinner size="lg" />
                  </CardContent>
                </Card>
              ) : !selectedModel ? (
                <Card>
                  <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                      <h3 className="font-medium mb-2">Select a model</h3>
                      <p className="text-muted-foreground">Choose an AI model from the list to configure it</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="configuration" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configuration
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Activation Rules
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="configuration" className="space-y-6">
                    <ModelConfigurationPanel
                      selectedModel={selectedModel}
                      onUpdateModel={handleUpdateModel}
                    />
                  </TabsContent>
                  
                  <TabsContent value="rules">
                    <ModelActivationRules
                      selectedModel={selectedModel}
                      onRuleUpdate={handleRuleUpdate}
                    />
                  </TabsContent>
                  
                  <TabsContent value="analytics">
                    <ModelAnalytics selectedModel={selectedModel} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Model Dialog */}
      <AIModelForm 
        open={isModelDialogOpen}
        onOpenChange={setIsModelDialogOpen}
        onSave={handleCreateModel}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the model "{modelToDelete?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ModelManagement;
