"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Plus, Save, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ContextRule {
    id: number
    name: string
    description: string | null
    conditions: Condition[]
    settings: Record<string, any>
    priority: number
    is_active: boolean
}

interface Condition {
    field: string
    operator: string
    value: any
    required?: boolean
}

interface ContextRuleEditorProps {
    rule: ContextRule
    onUpdate: (id: number, data: Partial<Omit<ContextRule, "id">>) => Promise<ContextRule | undefined>
}

const OPERATORS = [
    { value: "==", label: "Equals" },
    { value: "!=", label: "Not Equals" },
    { value: ">", label: "Greater Than" },
    { value: ">=", label: "Greater Than or Equal" },
    { value: "<", label: "Less Than" },
    { value: "<=", label: "Less Than or Equal" },
    { value: "in", label: "In Array" },
    { value: "not_in", label: "Not In Array" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Not Contains" },
    { value: "exists", label: "Exists" },
    { value: "not_exists", label: "Not Exists" },
    { value: "regex", label: "Matches Regex" }
]

export function ContextRuleEditor({
    rule,
    onUpdate,
}: ContextRuleEditorProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [conditions, setConditions] = useState<Condition[]>(rule.conditions || [])
    const [isAddingCondition, setIsAddingCondition] = useState(false)
    const [newCondition, setNewCondition] = useState<Condition>({
        field: "",
        operator: "==",
        value: "",
        required: true
    })

    // Update conditions when rule changes
    useState(() => {
        setConditions(rule.conditions || [])
    })

    const handleSaveConditions = async () => {
        try {
            setIsLoading(true)

            await onUpdate(rule.id, {
                conditions
            })

            toast({
                title: "Conditions updated",
                description: "Context rule conditions have been updated successfully.",
            })
        } catch (error) {
            console.error("Failed to update conditions:", error)

            toast({
                title: "Error",
                description: "Failed to update conditions.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddCondition = () => {
        if (!newCondition.field.trim()) {
            toast({
                title: "Error",
                description: "Field name is required.",
                variant: "destructive",
            })
            return
        }

        setConditions([...conditions, newCondition])
        setNewCondition({
            field: "",
            operator: "==",
            value: "",
            required: true
        })
        setIsAddingCondition(false)
    }

    const handleDeleteCondition = (index: number) => {
        const updatedConditions = [...conditions]
        updatedConditions.splice(index, 1)
        setConditions(updatedConditions)
    }

    const handleUpdateCondition = (index: number, field: keyof Condition, value: any) => {
        const updatedConditions = [...conditions]
        updatedConditions[index] = {
            ...updatedConditions[index],
            [field]: value
        }
        setConditions(updatedConditions)
    }

    const getOperatorLabel = (operatorValue: string) => {
        const operator = OPERATORS.find(op => op.value === operatorValue)
        return operator ? operator.label : operatorValue
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Conditions for: {rule.name}</span>
                        <Button
                            size="sm"
                            onClick={() => setIsAddingCondition(true)}
                            className="ml-auto"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Condition
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {conditions.length === 0 ? (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                This rule has no conditions. Add conditions to make this rule context-aware.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-4">
                            {conditions.map((condition, index) => (
                                <Card key={index} className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={() => handleDeleteCondition(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`field-${index}`}>Field Name</Label>
                                                <Input
                                                    id={`field-${index}`}
                                                    value={condition.field}
                                                    onChange={(e) => handleUpdateCondition(index, "field", e.target.value)}
                                                    placeholder="Field name in context"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`operator-${index}`}>Operator</Label>
                                                <Select
                                                    value={condition.operator}
                                                    onValueChange={(value) => handleUpdateCondition(index, "operator", value)}
                                                >
                                                    <SelectTrigger id={`operator-${index}`}>
                                                        <SelectValue placeholder="Select operator" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {OPERATORS.map((op) => (
                                                            <SelectItem key={op.value} value={op.value}>
                                                                {op.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                {condition.operator !== "exists" && condition.operator !== "not_exists" && (
                                                    <>
                                                        <Label htmlFor={`value-${index}`}>Value</Label>
                                                        <Input
                                                            id={`value-${index}`}
                                                            value={condition.value === null ? "" : condition.value}
                                                            onChange={(e) => handleUpdateCondition(index, "value", e.target.value)}
                                                            placeholder="Comparison value"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center space-x-2">
                                            <Checkbox
                                                id={`required-${index}`}
                                                checked={condition.required}
                                                onCheckedChange={(checked) =>
                                                    handleUpdateCondition(index, "required", checked === true)
                                                }
                                            />
                                            <Label htmlFor={`required-${index}`} className="text-sm">
                                                Field is required (rule will fail if field is missing)
                                            </Label>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSaveConditions} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Conditions
                    </Button>
                </CardFooter>
            </Card>

            {/* Add Condition Dialog */}
            <Dialog open={isAddingCondition} onOpenChange={setIsAddingCondition}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Condition</DialogTitle>
                        <DialogDescription>
                            Define a new condition for this context rule.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-field">Field Name</Label>
                            <Input
                                id="new-field"
                                value={newCondition.field}
                                onChange={(e) => setNewCondition({ ...newCondition, field: e.target.value })}
                                placeholder="Field name in context"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                The name of the field in the context object to evaluate
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-operator">Operator</Label>
                            <Select
                                value={newCondition.operator}
                                onValueChange={(value) => setNewCondition({ ...newCondition, operator: value })}
                            >
                                <SelectTrigger id="new-operator">
                                    <SelectValue placeholder="Select operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPERATORS.map((op) => (
                                        <SelectItem key={op.value} value={op.value}>
                                            {op.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {newCondition.operator !== "exists" && newCondition.operator !== "not_exists" && (
                            <div className="space-y-2">
                                <Label htmlFor="new-value">Value</Label>
                                <Input
                                    id="new-value"
                                    value={newCondition.value}
                                    onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                                    placeholder="Comparison value"
                                />
                                <p className="text-xs text-muted-foreground">
                                    The value to compare against the field value
                                </p>
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="new-required"
                                checked={newCondition.required}
                                onCheckedChange={(checked) =>
                                    setNewCondition({ ...newCondition, required: checked === true })
                                }
                            />
                            <Label htmlFor="new-required" className="text-sm">
                                Field is required (rule will fail if field is missing)
                            </Label>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddingCondition(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleAddCondition}>
                            Add Condition
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 