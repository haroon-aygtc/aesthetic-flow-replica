
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { ModelActivationRule } from "@/types/model-activation-rules";

interface ModelActivationRuleTableProps {
  rules: ModelActivationRule[];
  onToggleActive: (rule: ModelActivationRule) => void;
  onEdit: (rule: ModelActivationRule) => void;
  onDelete: (ruleId: number) => void;
}

export function ModelActivationRuleTable({
  rules,
  onToggleActive,
  onEdit,
  onDelete
}: ModelActivationRuleTableProps) {
  // Safety check to ensure rules is always an array
  const safeRules = Array.isArray(rules) ? rules : [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Conditions</TableHead>
          <TableHead className="w-[100px]">Priority</TableHead>
          <TableHead className="w-[80px]">Status</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {safeRules.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell className="font-medium">{rule.name}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {rule.query_type && (
                  <Badge variant="outline" className="bg-primary/10">
                    Query: {rule.query_type}
                  </Badge>
                )}
                {rule.use_case && (
                  <Badge variant="outline" className="bg-primary/10">
                    Use case: {rule.use_case}
                  </Badge>
                )}
                {rule.tenant_id && (
                  <Badge variant="outline" className="bg-primary/10">
                    Tenant: {rule.tenant_id}
                  </Badge>
                )}
                {rule.conditions && rule.conditions.length > 0 && (
                  <Badge variant="outline" className="bg-secondary/50">
                    +{rule.conditions.length} conditions
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                <ArrowUpDown className="h-3 w-3 mr-1" /> {rule.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Switch
                checked={rule.active}
                onCheckedChange={() => onToggleActive(rule)}
                aria-label={`Toggle rule ${rule.name}`}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(rule)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onDelete(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
