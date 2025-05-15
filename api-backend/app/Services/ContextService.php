<?php

namespace App\Services;

use App\Models\ContextRule;
use App\Models\ContextSession;
use App\Models\Widget;
use Illuminate\Support\Facades\Log;
use Exception;

class ContextService
{
    /**
     * Get context rules for a user.
     *
     * @param  int  $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRules($userId)
    {
        return ContextRule::where('user_id', $userId)
                        ->orderByPriority()
                        ->get();
    }

    /**
     * Get a context rule by ID.
     *
     * @param  int  $id
     * @param  int  $userId
     * @return \App\Models\ContextRule
     * @throws \Exception
     */
    public function getRule($id, $userId)
    {
        $rule = ContextRule::where('id', $id)
                          ->where('user_id', $userId)
                          ->first();

        if (!$rule) {
            throw new Exception("Context rule not found");
        }

        return $rule;
    }

    /**
     * Create a new context rule.
     *
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\ContextRule
     */
    public function createRule($userId, array $data)
    {
        $rule = new ContextRule();
        $rule->user_id = $userId;
        $rule->name = $data['name'];
        $rule->description = $data['description'] ?? null;
        $rule->conditions = $data['conditions'] ?? [];
        $rule->settings = $data['settings'] ?? [];
        $rule->priority = $data['priority'] ?? 0;
        $rule->is_active = $data['is_active'] ?? true;
        $rule->save();

        return $rule;
    }

    /**
     * Update a context rule.
     *
     * @param  int  $id
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\ContextRule
     * @throws \Exception
     */
    public function updateRule($id, $userId, array $data)
    {
        $rule = $this->getRule($id, $userId);

        if (isset($data['name'])) {
            $rule->name = $data['name'];
        }

        if (isset($data['description'])) {
            $rule->description = $data['description'];
        }

        if (isset($data['conditions'])) {
            $rule->conditions = $data['conditions'];
        }

        if (isset($data['settings'])) {
            $rule->settings = $data['settings'];
        }

        if (isset($data['priority'])) {
            $rule->priority = $data['priority'];
        }

        if (isset($data['is_active'])) {
            $rule->is_active = $data['is_active'];
        }

        $rule->save();

        return $rule;
    }

    /**
     * Delete a context rule.
     *
     * @param  int  $id
     * @param  int  $userId
     * @return bool
     * @throws \Exception
     */
    public function deleteRule($id, $userId)
    {
        $rule = $this->getRule($id, $userId);
        return $rule->delete();
    }

    /**
     * Find the most appropriate context rule for a given context.
     *
     * @param  int  $widgetId
     * @param  array  $context
     * @return \App\Models\ContextRule|null
     */
    public function findRuleForContext($widgetId, array $context = [])
    {
        $widget = Widget::findOrFail($widgetId);

        // Get all rules associated with the widget
        $rules = $widget->contextRules()
                       ->active()
                       ->orderByPriority()
                       ->get();

        if ($rules->isEmpty()) {
            return null;
        }

        // Find the first rule that matches the context
        foreach ($rules as $rule) {
            if ($rule->evaluateCondition($context)) {
                return $rule;
            }
        }

        return null;
    }

    /**
     * Evaluate a set of context rules against context data.
     *
     * @param  array  $rules
     * @param  array  $context
     * @return bool
     */
    public function evaluateContextRules(array $rules, array $context): bool
    {
        // If no rules, return true
        if (empty($rules)) {
            return true;
        }

        // Get rule IDs or use rule definitions directly
        $ruleIds = array_filter($rules, function($item) {
            return is_numeric($item);
        });

        $inlineRules = array_filter($rules, function($item) {
            return is_array($item);
        });

        // No rules defined, return true
        if (empty($ruleIds) && empty($inlineRules)) {
            return true;
        }

        // Process rules from database
        foreach ($ruleIds as $ruleId) {
            try {
                $rule = ContextRule::findOrFail($ruleId);
                if (!$rule->evaluateCondition($context)) {
                    return false;
                }
            } catch (Exception $e) {
                Log::error('Error evaluating context rule: ' . $e->getMessage());
                // Continue with other rules even if one fails to load
            }
        }

        // Process inline rules
        foreach ($inlineRules as $rule) {
            if (!$this->evaluateInlineRule($rule, $context)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate an inline rule definition against context data.
     *
     * @param  array  $rule
     * @param  array  $context
     * @return bool
     */
    private function evaluateInlineRule(array $rule, array $context): bool
    {
        if (empty($rule['condition'])) {
            return true;
        }

        $condition = $rule['condition'];
        $operator = $condition['operator'] ?? '==';
        $field = $condition['field'] ?? null;
        $value = $condition['value'] ?? null;

        if ($field === null) {
            return true;
        }

        $contextValue = $context[$field] ?? null;

        switch ($operator) {
            case '==':
                return $contextValue == $value;
            case '!=':
                return $contextValue != $value;
            case '>':
                return $contextValue > $value;
            case '>=':
                return $contextValue >= $value;
            case '<':
                return $contextValue < $value;
            case '<=':
                return $contextValue <= $value;
            case 'in':
                return in_array($contextValue, is_array($value) ? $value : [$value]);
            case 'not_in':
                return !in_array($contextValue, is_array($value) ? $value : [$value]);
            case 'contains':
                return is_string($contextValue) && is_string($value) && strpos($contextValue, $value) !== false;
            case 'not_contains':
                return is_string($contextValue) && is_string($value) && strpos($contextValue, $value) === false;
            default:
                return false;
        }
    }

    /**
     * Associate a context rule with a widget.
     *
     * @param  int  $ruleId
     * @param  int  $widgetId
     * @param  int  $userId
     * @param  array  $settings
     * @return \App\Models\Widget
     * @throws \Exception
     */
    public function associateRuleWithWidget($ruleId, $widgetId, $userId, array $settings = [])
    {
        $rule = $this->getRule($ruleId, $userId);
        $widget = Widget::findOrFail($widgetId);

        // Check if widget belongs to user
        if ($widget->user_id !== $userId) {
            throw new Exception("Widget not found");
        }

        $widget->contextRules()->sync([$ruleId => ['settings' => $settings]], false);

        return $widget;
    }

    /**
     * Dissociate a context rule from a widget.
     *
     * @param  int  $ruleId
     * @param  int  $widgetId
     * @param  int  $userId
     * @return \App\Models\Widget
     * @throws \Exception
     */
    public function dissociateRuleFromWidget($ruleId, $widgetId, $userId)
    {
        $rule = $this->getRule($ruleId, $userId);
        $widget = Widget::findOrFail($widgetId);

        // Check if widget belongs to user
        if ($widget->user_id !== $userId) {
            throw new Exception("Widget not found");
        }

        $widget->contextRules()->detach($ruleId);

        return $widget;
    }

    /**
     * Store context session data.
     *
     * @param  string  $sessionId
     * @param  array  $data
     * @return ContextSession
     */
    public function storeContextSession(string $sessionId, array $data): ContextSession
    {
        $session = ContextSession::firstOrNew(['session_id' => $sessionId]);
        $session->data = array_merge($session->data ?? [], $data);
        $session->save();

        return $session;
    }

    /**
     * Get context session data.
     *
     * @param  string  $sessionId
     * @return array
     */
    public function getContextSession(string $sessionId): array
    {
        $session = ContextSession::where('session_id', $sessionId)->first();
        return $session ? $session->data : [];
    }

    /**
     * Clear context session data.
     *
     * @param  string  $sessionId
     * @return bool
     */
    public function clearContextSession(string $sessionId): bool
    {
        return ContextSession::where('session_id', $sessionId)->delete() > 0;
    }

    /**
     * Update the expiration of a context session.
     *
     * @param  string  $sessionId
     * @param  \DateTime|string  $expiresAt
     * @return bool
     */
    public function updateSessionExpiration(string $sessionId, $expiresAt): bool
    {
        $session = ContextSession::where('session_id', $sessionId)->first();

        if (!$session) {
            return false;
        }

        $session->expires_at = $expiresAt;
        return $session->save();
    }

    /**
     * Clean up expired sessions.
     *
     * @return int Number of deleted sessions
     */
    public function cleanupExpiredSessions(): int
    {
        return ContextSession::where('expires_at', '<', now())->delete();
    }
}
