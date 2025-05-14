import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AIModelData, aiModelService } from "@/utils/ai-model-service";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { CheckCircle, Edit, MoreVertical, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModelSelectionItemProps {
  model: AIModelData;
  isSelected: boolean;
  onEdit: () => void;
  onDelete?: (id: number) => void;
  onToggleActive?: (id: number, active: boolean) => void;
  onSetDefault?: (id: number) => void;
  useFullPageEditor?: boolean;
}

export function ModelSelectionItem({
  model,
  isSelected,
  onEdit,
  onDelete,
  onToggleActive,
  onSetDefault,
  useFullPageEditor = false
}: ModelSelectionItemProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Only render controls for models with valid IDs (not the "None" option)
  const shouldRenderControls = model.id !== null;

  // Handle toggle active state
  const handleToggleActive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!model.id || isUpdating) return;

    if (onToggleActive) {
      onToggleActive(model.id, !model.active);
    } else {
      setIsUpdating(true);
      try {
        await aiModelService.toggleModelActivation(model.id, !model.active);
        toast({
          title: model.active ? "Model Deactivated" : "Model Activated",
          description: `${model.name} has been ${model.active ? 'deactivated' : 'activated'}.`
        });
        // Force refresh - in a real implementation you'd update the state
        window.location.reload();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update model status",
          variant: "destructive"
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Handle set as default
  const handleSetDefault = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!model.id || isUpdating || model.is_default) return;

    if (onSetDefault) {
      onSetDefault(model.id);
    } else {
      setIsUpdating(true);
      try {
        await aiModelService.setDefaultModel(model.id);
        toast({
          title: "Default Model Updated",
          description: `${model.name} is now the default model.`
        });
        // Force refresh - in a real implementation you'd update the state
        window.location.reload();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to set default model",
          variant: "destructive"
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!model.id) return;

    if (onDelete) {
      onDelete(model.id);
    } else {
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    if (!model.id) return;

    setIsUpdating(true);
    try {
      await aiModelService.deleteModel(model.id);
      toast({
        title: "Model Deleted",
        description: `${model.name} has been deleted successfully.`
      });
      // Force refresh - in a real implementation you'd update the state
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete model",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setShowDeleteDialog(false);
    }
  };

  // Render the actions dropdown
  const renderControls = () => {
    if (!shouldRenderControls) return null;

    return (
      <div className="absolute top-2 right-2 z-10">
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Edit Option */}
            {useFullPageEditor ? (
              <DropdownMenuItem asChild>
                <Link
                  to={`/dashboard/model-management/edit/${model.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="flex items-center cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}

            {/* Set as Default Option - Only for non-default models */}
            {!model.is_default && model.active && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSetDefault(e);
                }}
              >
                <Star className="mr-2 h-4 w-4 text-amber-500" />
                Set as Default
              </DropdownMenuItem>
            )}

            {/* Default Model Indicator */}
            {model.is_default && (
              <DropdownMenuItem disabled>
                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                Default Model
              </DropdownMenuItem>
            )}

            {/* Delete Option - Only for non-default models */}
            {!model.is_default && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="relative">
      <RadioGroupItem
        value={String(model.id)}
        id={`model-${model.id}`}
        className="peer sr-only"
      />
      <Label
        htmlFor={`model-${model.id}`}
        className="flex flex-col h-full p-4 border rounded-md cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
      >
        {/* Model Name and Provider Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-lg">{model.name}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">{model.description}</p>

        {/* Model Details */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-2">
          <div className="flex justify-between">
            <span>Model: {model.settings?.model_name || "Default"}</span>
            <span>Temp: {model.settings?.temperature || "0.7"}</span>
          </div>
          <div className="flex justify-between">
            <span>Max Tokens: {model.settings?.max_tokens || "Default"}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            {model.is_default && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">Default</span>
            )}
            {!model.active && (
              <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs">Inactive</span>
            )}
          </div>

          {/* Provider and Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs bg-secondary px-2 py-1 rounded-full">{model.provider}</span>
            {shouldRenderControls && (
              <Switch
                size="sm"
                checked={model.active !== false}
                onCheckedChange={(e) => {}}
                onClick={handleToggleActive}
                disabled={isUpdating || model.is_default}
                className="data-[state=checked]:bg-green-500 h-5 w-9"
              />
            )}
          </div>
        </div>
        {renderControls()}
      </Label>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{model.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
