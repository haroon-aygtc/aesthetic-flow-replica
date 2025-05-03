
import { z } from "zod";

// Schema for the form validation
export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  query_type: z.string().nullable(),
  use_case: z.string().nullable(),
  tenant_id: z.string().nullable().transform(val => val ? Number(val) : null),
  priority: z.string().transform(val => Number(val)),
  active: z.boolean(),
  conditions: z.array(
    z.object({
      field: z.string().min(1, "Field is required"),
      operator: z.string().min(1, "Operator is required"),
      value: z.string().min(1, "Value is required"),
    })
  ),
});
