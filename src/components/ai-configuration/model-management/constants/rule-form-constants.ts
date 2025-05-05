
// Define query types and operators for the form
export const queryTypes = [
  { value: "general", label: "General" },
  { value: "factual", label: "Factual" },
  { value: "creative", label: "Creative" },
  { value: "technical", label: "Technical" },
];

export const useCases = [
  { value: "customer_support", label: "Customer Support" },
  { value: "content_generation", label: "Content Generation" },
  { value: "data_analysis", label: "Data Analysis" },
  { value: "document_search", label: "Document Search" },
];

export const conditionOperators = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
];

// Common fields that can be used for conditions
export const commonFields = [
  { value: "user_id", label: "User ID" },
  { value: "user_role", label: "User Role" },
  { value: "message_length", label: "Message Length" },
  { value: "topic", label: "Message Topic" },
  { value: "language", label: "Language" },
  { value: "complexity", label: "Complexity" },
];
