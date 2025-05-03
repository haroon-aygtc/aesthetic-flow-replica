
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { AIModelData } from "@/utils/ai-model-service";
import { ModelActivationRuleForm } from "../model-activation-rule-form";
import { ModelActivationRuleTable } from "./model-activation-rule-table";
import { EmptyRulesPlaceholder } from "./empty-rules-placeholder";
import { DeleteRuleDialog } from "./delete-rule-dialog";
import { useActivationRules } from "./use-activation-rules";

interface ModelActivationRulesProps {
  selectedModel: AIModelData | null;
  onRuleUpdate: () => void;
}

export function ModelActivationRules({ selectedModel, onRuleUpdate }: ModelActivationRulesProps) {
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
    handleSaveRule
  } = useActivationRules(selectedModel, onRuleUpdate);

  if (!selectedModel) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Model Activation Rules
            </CardTitle>
            <CardDescription>
              Define when this model should be automatically selected based on context
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
          modelId={selectedModel.id!}
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
