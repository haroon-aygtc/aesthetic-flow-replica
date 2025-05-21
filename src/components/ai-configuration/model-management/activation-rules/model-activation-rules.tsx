import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, AlertCircle, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData } from "@/utils/ai-model-service";
import { ModelActivationRuleForm } from "../model-activation-rule-form";
import { ModelActivationRuleTable } from "./model-activation-rule-table";
import { EmptyRulesPlaceholder } from "./empty-rules-placeholder";
import { DeleteRuleDialog } from "./delete-rule-dialog";
import { useActivationRules } from "./use-activation-rules";

interface ModelActivationRulesProps {
  selectedModel: AIModelData;
  onRuleUpdate: () => void;
}

export function ModelActivationRules({
  selectedModel,
  onRuleUpdate,
}: ModelActivationRulesProps) {
  const {
    rules,
    isLoading,
    isCreating,
    setIsCreating,
    editingRule,
    setEditingRule,
    deleteRuleId,
    setDeleteRuleId,
    handleToggleActive,
    handleDelete,
    handleSaveRule,
    error,
    refreshRules,
  } = useActivationRules(selectedModel, onRuleUpdate);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Activation Rules
            </CardTitle>
            <CardDescription>
              Define when this model should be automatically selected based on
              user input and context
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreating(true)} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" /> Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive font-medium">Error loading rules</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refreshRules()}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        ) : rules.length === 0 ? (
          <EmptyRulesPlaceholder onCreateRule={() => setIsCreating(true)} />
        ) : (
          <ModelActivationRuleTable
            rules={rules}
            onToggleActive={handleToggleActive}
            onEdit={setEditingRule}
            onDelete={setDeleteRuleId}
          />
        )}
      </CardContent>

      {/* Create/Edit Rule Dialog */}
      {(isCreating || editingRule) && (
        <ModelActivationRuleForm
          modelId={selectedModel.id}
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => {
            setIsCreating(false);
            setEditingRule(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteRuleDialog
        open={deleteRuleId !== null}
        onOpenChange={() => setDeleteRuleId(null)}
        onDelete={handleDelete}
      />
    </Card>
  );
}
