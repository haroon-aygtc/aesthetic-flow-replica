import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { PlusCircle, Trash2, GripVertical, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface PromptVariable {
    name: string;
    type: "text" | "number" | "boolean" | "select" | "context";
    description?: string;
    defaultValue?: any;
    options?: any[];
    required: boolean;
}

interface PromptVariablesBuilderProps {
    variables: PromptVariable[];
    onChange: (variables: PromptVariable[]) => void;
    disabled?: boolean;
}

export function PromptVariablesBuilder({
    variables,
    onChange,
    disabled = false,
}: PromptVariablesBuilderProps) {
    const [showNewVariableForm, setShowNewVariableForm] = useState(false);
    const [newVariable, setNewVariable] = useState<PromptVariable>({
        name: "",
        type: "text",
        description: "",
        defaultValue: "",
        options: [],
        required: false,
    });

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(variables);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onChange(items);
    };

    const addVariable = () => {
        if (!newVariable.name.trim()) return;

        // Create a cleaned variable object based on type
        const cleanedVariable: PromptVariable = {
            ...newVariable,
            name: newVariable.name.trim(),
            description: newVariable.description?.trim() || "",
        };

        // Type-specific handling
        if (newVariable.type === "boolean") {
            cleanedVariable.defaultValue = Boolean(newVariable.defaultValue);
            delete cleanedVariable.options;
        } else if (newVariable.type === "number") {
            cleanedVariable.defaultValue = newVariable.defaultValue
                ? Number(newVariable.defaultValue)
                : 0;
            delete cleanedVariable.options;
        } else if (newVariable.type === "select") {
            // Ensure options is an array
            if (!Array.isArray(cleanedVariable.options) || cleanedVariable.options.length === 0) {
                cleanedVariable.options = ["Option 1"];
            }

            // Set default value to first option if not set
            if (!cleanedVariable.defaultValue) {
                cleanedVariable.defaultValue = cleanedVariable.options[0];
            }
        } else if (newVariable.type === "context") {
            // Context variables don't need default values or options
            delete cleanedVariable.defaultValue;
            delete cleanedVariable.options;
        }

        onChange([...variables, cleanedVariable]);

        // Reset form
        setNewVariable({
            name: "",
            type: "text",
            description: "",
            defaultValue: "",
            options: [],
            required: false,
        });
        setShowNewVariableForm(false);
    };

    const updateVariable = (index: number, field: keyof PromptVariable, value: any) => {
        const updatedVariables = [...variables];

        if (field === "type") {
            // Handle type change - reset type-specific fields
            if (value === "boolean") {
                updatedVariables[index] = {
                    ...updatedVariables[index],
                    type: value,
                    defaultValue: false,
                    options: undefined,
                };
            } else if (value === "number") {
                updatedVariables[index] = {
                    ...updatedVariables[index],
                    type: value,
                    defaultValue: 0,
                    options: undefined,
                };
            } else if (value === "select") {
                updatedVariables[index] = {
                    ...updatedVariables[index],
                    type: value,
                    defaultValue: "",
                    options: ["Option 1"],
                };
            } else if (value === "context") {
                updatedVariables[index] = {
                    ...updatedVariables[index],
                    type: value,
                    defaultValue: undefined,
                    options: undefined,
                };
            } else {
                // text type
                updatedVariables[index] = {
                    ...updatedVariables[index],
                    type: value,
                    defaultValue: "",
                    options: undefined,
                };
            }
        } else {
            // For other fields, just update the value
            updatedVariables[index] = {
                ...updatedVariables[index],
                [field]: value,
            };
        }

        onChange(updatedVariables);
    };

    const removeVariable = (index: number) => {
        const updatedVariables = [...variables];
        updatedVariables.splice(index, 1);
        onChange(updatedVariables);
    };

    const addOption = (variableIndex: number) => {
        const updatedVariables = [...variables];
        if (!updatedVariables[variableIndex].options) {
            updatedVariables[variableIndex].options = [];
        }
        updatedVariables[variableIndex].options!.push(`Option ${updatedVariables[variableIndex].options!.length + 1}`);
        onChange(updatedVariables);
    };

    const updateOption = (variableIndex: number, optionIndex: number, value: string) => {
        const updatedVariables = [...variables];
        updatedVariables[variableIndex].options![optionIndex] = value;
        onChange(updatedVariables);
    };

    const removeOption = (variableIndex: number, optionIndex: number) => {
        const updatedVariables = [...variables];
        updatedVariables[variableIndex].options!.splice(optionIndex, 1);
        onChange(updatedVariables);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Prompt Variables</CardTitle>
                {!showNewVariableForm && (
                    <Button
                        onClick={() => setShowNewVariableForm(true)}
                        disabled={disabled}
                        variant="outline"
                        size="sm"
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Variable
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    {showNewVariableForm && (
                        <Card className="mb-4 border-dashed border-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">New Variable</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-variable-name">Variable Name</Label>
                                        <Input
                                            id="new-variable-name"
                                            value={newVariable.name}
                                            onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                                            placeholder="e.g., customer_name"
                                            disabled={disabled}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-variable-type">Variable Type</Label>
                                        <Select
                                            value={newVariable.type}
                                            onValueChange={(value) =>
                                                setNewVariable({
                                                    ...newVariable,
                                                    type: value as PromptVariable["type"],
                                                    // Reset type-specific values
                                                    defaultValue: value === "boolean" ? false : value === "number" ? 0 : "",
                                                    options: value === "select" ? ["Option 1"] : undefined,
                                                })
                                            }
                                            disabled={disabled}
                                        >
                                            <SelectTrigger id="new-variable-type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="boolean">Boolean</SelectItem>
                                                <SelectItem value="select">Select</SelectItem>
                                                <SelectItem value="context">Context</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-variable-description">Description</Label>
                                    <Textarea
                                        id="new-variable-description"
                                        value={newVariable.description}
                                        onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                                        placeholder="Describe what this variable is used for"
                                        disabled={disabled}
                                    />
                                </div>

                                {newVariable.type !== "context" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="new-variable-default">Default Value</Label>
                                        {newVariable.type === "boolean" ? (
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="new-variable-default"
                                                    checked={Boolean(newVariable.defaultValue)}
                                                    onCheckedChange={(checked) =>
                                                        setNewVariable({ ...newVariable, defaultValue: checked })
                                                    }
                                                    disabled={disabled}
                                                />
                                                <Label htmlFor="new-variable-default">
                                                    {Boolean(newVariable.defaultValue) ? "True" : "False"}
                                                </Label>
                                            </div>
                                        ) : newVariable.type === "select" ? (
                                            <div className="space-y-2">
                                                <Select
                                                    value={newVariable.defaultValue?.toString() || ""}
                                                    onValueChange={(value) =>
                                                        setNewVariable({ ...newVariable, defaultValue: value })
                                                    }
                                                    disabled={disabled}
                                                >
                                                    <SelectTrigger id="new-variable-default">
                                                        <SelectValue placeholder="Select default" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {newVariable.options?.map((option, index) => (
                                                            <SelectItem key={index} value={option.toString()}>
                                                                {option.toString()}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <div className="space-y-2 border rounded-md p-3">
                                                    <Label>Options</Label>
                                                    {newVariable.options?.map((option, index) => (
                                                        <div key={index} className="flex space-x-2">
                                                            <Input
                                                                value={option}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(newVariable.options || [])];
                                                                    newOptions[index] = e.target.value;
                                                                    setNewVariable({ ...newVariable, options: newOptions });
                                                                }}
                                                                disabled={disabled}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const newOptions = [...(newVariable.options || [])];
                                                                    newOptions.splice(index, 1);
                                                                    setNewVariable({ ...newVariable, options: newOptions });
                                                                }}
                                                                disabled={disabled || newVariable.options!.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newOptions = [...(newVariable.options || [])];
                                                            newOptions.push(`Option ${newOptions.length + 1}`);
                                                            setNewVariable({ ...newVariable, options: newOptions });
                                                        }}
                                                        disabled={disabled}
                                                    >
                                                        <PlusCircle className="h-4 w-4 mr-2" />
                                                        Add Option
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Input
                                                id="new-variable-default"
                                                type={newVariable.type === "number" ? "number" : "text"}
                                                value={newVariable.defaultValue?.toString() || ""}
                                                onChange={(e) => {
                                                    const value = newVariable.type === "number"
                                                        ? Number(e.target.value)
                                                        : e.target.value;
                                                    setNewVariable({ ...newVariable, defaultValue: value });
                                                }}
                                                placeholder={`Default ${newVariable.type} value`}
                                                disabled={disabled}
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="new-variable-required"
                                        checked={newVariable.required}
                                        onCheckedChange={(checked) =>
                                            setNewVariable({ ...newVariable, required: checked })
                                        }
                                        disabled={disabled}
                                    />
                                    <Label htmlFor="new-variable-required">Required</Label>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowNewVariableForm(false);
                                            setNewVariable({
                                                name: "",
                                                type: "text",
                                                description: "",
                                                defaultValue: "",
                                                options: [],
                                                required: false,
                                            });
                                        }}
                                        disabled={disabled}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={addVariable}
                                        disabled={disabled || !newVariable.name.trim()}
                                    >
                                        Add Variable
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {variables.length === 0 && !showNewVariableForm ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No variables defined yet. Click "Add Variable" to create one.
                        </div>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="variables">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-4"
                                    >
                                        {variables.map((variable, index) => (
                                            <Draggable
                                                key={`${variable.name}-${index}`}
                                                draggableId={`${variable.name}-${index}`}
                                                index={index}
                                                isDragDisabled={disabled}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="border rounded-md p-4"
                                                    >
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex items-center">
                                                                <div {...provided.dragHandleProps} className="mr-2">
                                                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                                <div className="font-medium">
                                                                    {variable.name}{" "}
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-2">
                                                                        {variable.type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-1">
                                                                {variable.description && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button variant="ghost" size="icon">
                                                                                    <Info className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p className="max-w-xs">{variable.description}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeVariable(index)}
                                                                    disabled={disabled}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`variable-name-${index}`}>Name</Label>
                                                                <Input
                                                                    id={`variable-name-${index}`}
                                                                    value={variable.name}
                                                                    onChange={(e) => updateVariable(index, "name", e.target.value)}
                                                                    disabled={disabled}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor={`variable-type-${index}`}>Type</Label>
                                                                <Select
                                                                    value={variable.type}
                                                                    onValueChange={(value) =>
                                                                        updateVariable(index, "type", value as PromptVariable["type"])
                                                                    }
                                                                    disabled={disabled}
                                                                >
                                                                    <SelectTrigger id={`variable-type-${index}`}>
                                                                        <SelectValue placeholder="Select type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="text">Text</SelectItem>
                                                                        <SelectItem value="number">Number</SelectItem>
                                                                        <SelectItem value="boolean">Boolean</SelectItem>
                                                                        <SelectItem value="select">Select</SelectItem>
                                                                        <SelectItem value="context">Context</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 space-y-2">
                                                            <Label htmlFor={`variable-description-${index}`}>Description</Label>
                                                            <Textarea
                                                                id={`variable-description-${index}`}
                                                                value={variable.description || ""}
                                                                onChange={(e) => updateVariable(index, "description", e.target.value)}
                                                                placeholder="Describe what this variable is used for"
                                                                disabled={disabled}
                                                            />
                                                        </div>

                                                        {variable.type !== "context" && (
                                                            <div className="mt-4 space-y-2">
                                                                <Label htmlFor={`variable-default-${index}`}>Default Value</Label>
                                                                {variable.type === "boolean" ? (
                                                                    <div className="flex items-center space-x-2">
                                                                        <Switch
                                                                            id={`variable-default-${index}`}
                                                                            checked={Boolean(variable.defaultValue)}
                                                                            onCheckedChange={(checked) =>
                                                                                updateVariable(index, "defaultValue", checked)
                                                                            }
                                                                            disabled={disabled}
                                                                        />
                                                                        <Label htmlFor={`variable-default-${index}`}>
                                                                            {Boolean(variable.defaultValue) ? "True" : "False"}
                                                                        </Label>
                                                                    </div>
                                                                ) : variable.type === "select" ? (
                                                                    <div className="space-y-2">
                                                                        <Select
                                                                            value={variable.defaultValue?.toString() || ""}
                                                                            onValueChange={(value) =>
                                                                                updateVariable(index, "defaultValue", value)
                                                                            }
                                                                            disabled={disabled}
                                                                        >
                                                                            <SelectTrigger id={`variable-default-${index}`}>
                                                                                <SelectValue placeholder="Select default" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {variable.options?.map((option, optIndex) => (
                                                                                    <SelectItem key={optIndex} value={option.toString()}>
                                                                                        {option.toString()}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>

                                                                        <div className="space-y-2 border rounded-md p-3">
                                                                            <Label>Options</Label>
                                                                            {variable.options?.map((option, optIndex) => (
                                                                                <div key={optIndex} className="flex space-x-2">
                                                                                    <Input
                                                                                        value={option}
                                                                                        onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                                                                        disabled={disabled}
                                                                                    />
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={() => removeOption(index, optIndex)}
                                                                                        disabled={disabled || variable.options!.length <= 1}
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            ))}
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => addOption(index)}
                                                                                disabled={disabled}
                                                                            >
                                                                                <PlusCircle className="h-4 w-4 mr-2" />
                                                                                Add Option
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <Input
                                                                        id={`variable-default-${index}`}
                                                                        type={variable.type === "number" ? "number" : "text"}
                                                                        value={variable.defaultValue?.toString() || ""}
                                                                        onChange={(e) => {
                                                                            const value = variable.type === "number"
                                                                                ? Number(e.target.value)
                                                                                : e.target.value;
                                                                            updateVariable(index, "defaultValue", value);
                                                                        }}
                                                                        placeholder={`Default ${variable.type} value`}
                                                                        disabled={disabled}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="mt-4 flex items-center space-x-2">
                                                            <Switch
                                                                id={`variable-required-${index}`}
                                                                checked={variable.required}
                                                                onCheckedChange={(checked) =>
                                                                    updateVariable(index, "required", checked)
                                                                }
                                                                disabled={disabled}
                                                            />
                                                            <Label htmlFor={`variable-required-${index}`}>Required</Label>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 