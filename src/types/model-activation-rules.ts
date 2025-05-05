
export interface RuleCondition {
  field: string;
  operator: string;
  value: string;
}

export interface ModelActivationRule {
  id: number;
  model_id: number;
  name: string;
  query_type: string | null;
  use_case: string | null;
  tenant_id: number | null;
  active: boolean;
  priority: number;
  conditions: RuleCondition[];
}

export interface ModelActivationRuleFormValues {
  name: string;
  query_type: string | null;
  use_case: string | null;
  tenant_id: string | null;  // String in form, will be converted to number
  priority: string;          // String in form, will be converted to number
  active: boolean;
  conditions: RuleCondition[];
}
