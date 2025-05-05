
<?php
namespace App\Services;

use App\Models\AIModel;
use App\Models\ModelActivationRule;
use Illuminate\Support\Facades\Log;

class AIModelSelector
{
    /**
     * Select the most appropriate model based on context
     *
     * @param array $context
     * @return AIModel|null
     */
    public function selectModel(array $context = [])
    {
        try {
            // Extract context parameters
            $queryType = $context['query_type'] ?? null;
            $useCase = $context['use_case'] ?? null;
            $tenantId = $context['tenant_id'] ?? null;
            
            // Find matching rules ordered by priority
            $rules = ModelActivationRule::where('active', true)
                ->when($queryType, function ($query) use ($queryType) {
                    return $query->where(function($q) use ($queryType) {
                        $q->where('query_type', $queryType)
                          ->orWhereNull('query_type');
                    });
                })
                ->when($useCase, function ($query) use ($useCase) {
                    return $query->where(function($q) use ($useCase) {
                        $q->where('use_case', $useCase)
                          ->orWhereNull('use_case');
                    });
                })
                ->when($tenantId, function ($query) use ($tenantId) {
                    return $query->where(function($q) use ($tenantId) {
                        $q->where('tenant_id', $tenantId)
                          ->orWhereNull('tenant_id');
                    });
                })
                ->orderBy('priority')
                ->get();

            // Check each rule's conditions
            foreach ($rules as $rule) {
                if ($this->evaluateConditions($rule->conditions, $context)) {
                    $model = AIModel::where('id', $rule->model_id)
                        ->where('active', true)
                        ->first();
                    
                    if ($model) {
                        return $model;
                    }
                }
            }

            // Fall back to default model if no rules match
            return AIModel::where('is_default', true)
                ->where('active', true)
                ->first();
        } catch (\Exception $e) {
            Log::error('Error in AI model selection: ' . $e->getMessage());
            return AIModel::where('is_default', true)
                ->where('active', true)
                ->first();
        }
    }

    /**
     * Evaluate custom conditions against context
     *
     * @param array|null $conditions
     * @param array $context
     * @return bool
     */
    private function evaluateConditions(?array $conditions, array $context): bool
    {
        if (empty($conditions)) {
            return true;
        }

        // Simple condition evaluation 
        foreach ($conditions as $condition) {
            $field = $condition['field'] ?? null;
            $operator = $condition['operator'] ?? 'equals';
            $value = $condition['value'] ?? null;
            
            if (!$field || !isset($context[$field])) {
                continue;
            }

            $contextValue = $context[$field];

            switch ($operator) {
                case 'equals':
                    if ($contextValue != $value) return false;
                    break;
                case 'not_equals':
                    if ($contextValue == $value) return false;
                    break;
                case 'contains':
                    if (!str_contains($contextValue, $value)) return false;
                    break;
                case 'not_contains':
                    if (str_contains($contextValue, $value)) return false;
                    break;
                case 'greater_than':
                    if ($contextValue <= $value) return false;
                    break;
                case 'less_than':
                    if ($contextValue >= $value) return false;
                    break;
            }
        }

        return true;
    }

    /**
     * Get fallback chain for a model
     *
     * @param AIModel $model
     * @return array
     */
    public function getFallbackChain(AIModel $model): array
    {
        $chain = [$model->id => $model];
        $currentModel = $model;
        $maxDepth = 5; // Prevent infinite loops
        $depth = 0;

        while ($currentModel->fallback_model_id && $depth < $maxDepth) {
            $fallbackModel = AIModel::where('id', $currentModel->fallback_model_id)
                ->where('active', true)
                ->first();
            
            if (!$fallbackModel || isset($chain[$fallbackModel->id])) {
                break;
            }
            
            $chain[$fallbackModel->id] = $fallbackModel;
            $currentModel = $fallbackModel;
            $depth++;
        }

        return array_values($chain);
    }
}
