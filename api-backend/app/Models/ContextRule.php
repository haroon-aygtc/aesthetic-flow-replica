<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ContextRule extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'conditions',
        'settings',
        'priority',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'conditions' => 'array',
        'settings' => 'array',
        'priority' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the context rule.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the widgets associated with the context rule.
     */
    public function widgets(): BelongsToMany
    {
        return $this->belongsToMany(Widget::class, 'widget_context_rule')
                    ->withPivot('settings')
                    ->withTimestamps();
    }

    /**
     * Scope a query to only include active rules.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order by priority.
     */
    public function scopeOrderByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }

    /**
     * Evaluate if this rule's conditions match the provided context.
     *
     * @param array $context
     * @return bool
     */
    public function evaluateCondition(array $context): bool
    {
        if (empty($this->conditions)) {
            return true;
        }

        $allConditionsMet = true;

        foreach ($this->conditions as $condition) {
            if (!isset($condition['operator']) || !isset($condition['field'])) {
                continue;
            }

            $operator = $condition['operator'];
            $field = $condition['field'];
            $value = $condition['value'] ?? null;
            $contextValue = $context[$field] ?? null;

            // If the field doesn't exist in the context and is required, condition fails
            if ($contextValue === null && ($condition['required'] ?? false)) {
                return false;
            }

            // Skip this condition if the field doesn't exist
            if ($contextValue === null && !($condition['required'] ?? false)) {
                continue;
            }

            $conditionMet = false;

            switch ($operator) {
                case '==':
                    $conditionMet = $contextValue == $value;
                    break;
                case '!=':
                    $conditionMet = $contextValue != $value;
                    break;
                case '>':
                    $conditionMet = $contextValue > $value;
                    break;
                case '>=':
                    $conditionMet = $contextValue >= $value;
                    break;
                case '<':
                    $conditionMet = $contextValue < $value;
                    break;
                case '<=':
                    $conditionMet = $contextValue <= $value;
                    break;
                case 'in':
                    $conditionMet = in_array($contextValue, is_array($value) ? $value : [$value]);
                    break;
                case 'not_in':
                    $conditionMet = !in_array($contextValue, is_array($value) ? $value : [$value]);
                    break;
                case 'contains':
                    $conditionMet = is_string($contextValue) && is_string($value) &&
                                   strpos($contextValue, $value) !== false;
                    break;
                case 'not_contains':
                    $conditionMet = is_string($contextValue) && is_string($value) &&
                                   strpos($contextValue, $value) === false;
                    break;
                case 'exists':
                    $conditionMet = $contextValue !== null;
                    break;
                case 'not_exists':
                    $conditionMet = $contextValue === null;
                    break;
                case 'regex':
                    $conditionMet = is_string($contextValue) && is_string($value) &&
                                   preg_match($value, $contextValue);
                    break;
                default:
                    // Unknown operator
                    $conditionMet = false;
            }

            if (!$conditionMet) {
                $allConditionsMet = false;
                break;
            }
        }

        return $allConditionsMet;
    }
}
