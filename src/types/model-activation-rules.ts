
export interface RuleCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface ModelActivationRule {
  id?: number;
  model_id: number;
  name: string;
  query_type?: string;
  use_case?: string;
  tenant_id?: number;
  active: boolean;
  priority: number;
  conditions?: RuleCondition[];
}
