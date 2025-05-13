import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AIModelData, aiModelService } from "@/utils/ai-model-service"
import { ModelBasicInfoFields } from "@/components/ai-configuration/model-management/model-basic-info-fields"
import { ModelApiKeyField } from "@/components/ai-configuration/model-management/model-api-key-field"
import { ModelSettingsFields } from "@/components/ai-configuration/model-management/model-settings-fields"
import { ModelDefaultToggle } from "@/components/ai-configuration/model-management/model-default-toggle"
import { ModelActiveToggle } from "@/components/ai-configuration/model-management/model-active-toggle"
import { useModelForm } from "@/hooks/use-model-form"

export function ModelEditPage() {
  const navigate = useNavigate()
  const { modelId } = useParams()
  const { toast } = useToast()
  const [isLoadingModel, setIsLoadingModel] = useState(!!modelId)
  
  // Use our shared model form hook
  const {
    form,
    isLoading,
    isFetchingModels,
    fetchedModels,
    handleFetchModels,
    handleFormSubmit,
    setModel
  } = useModelForm({
    onSubmitSuccess: () => {
      console.log("Navigating back to model management after success");
      navigate("/dashboard/model-management");
    }
  })
  
  // Load model data if editing existing model
  useEffect(() => {
    async function loadModel() {
      if (!modelId) return
      
      try {
        setIsLoadingModel(true)
        const modelData = await aiModelService.getModel(Number(modelId))
        setModel(modelData)
        
        // Set form values
        form.reset({
          name: modelData.name || "",
          provider: modelData.provider || "",
          description: modelData.description || "",
          api_key: modelData.api_key || "",
          is_default: modelData.is_default || false,
          active: modelData.active !== false,
          fallback_model_id: modelData.fallback_model_id || null,
          confidence_threshold: modelData.confidence_threshold || 0.7,
          settings: {
            model_name: modelData.settings?.model_name || "",
            temperature: modelData.settings?.temperature || 0.7,
            max_tokens: modelData.settings?.max_tokens || 2048,
          }
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load model data",
          variant: "destructive"
        })
        navigate("/dashboard/model-management")
      } finally {
        setIsLoadingModel(false)
      }
    }
    
    loadModel()
  }, [modelId, form, toast, navigate, setModel])
  
  if (isLoadingModel) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/dashboard/model-management")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Models
          </Button>
          <h1 className="text-2xl font-bold">
            {modelId ? "Edit AI Model" : "Add New AI Model"}
          </h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Model Configuration</CardTitle>
          <CardDescription>
            Configure the AI model settings and connection details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModelBasicInfoFields />
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>API Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModelApiKeyField 
                      onFetchModels={handleFetchModels} 
                      isFetching={isFetchingModels}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Model Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModelSettingsFields 
                    fetchedModels={fetchedModels}
                    isLoadingModels={isFetchingModels}
                    autoUpdateModelName={true}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Additional Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <ModelDefaultToggle />
                    <ModelActiveToggle />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard/model-management")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || isFetchingModels}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {modelId ? "Save Changes" : "Create Model"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 