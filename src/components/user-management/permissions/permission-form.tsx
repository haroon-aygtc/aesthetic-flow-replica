
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PermissionFormProps {
  onSubmit: (formData: {
    name: string;
    description: string;
    category: string;
    type: string;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    name: string;
    description: string;
    category: string;
    type: string;
  };
  isNew: boolean;
  isProcessing: boolean;
}

export function PermissionForm({
  onSubmit,
  onCancel,
  initialData = { name: "", description: "", category: "", type: "read" },
  isNew,
  isProcessing
}: PermissionFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Update form data when initialData changes (for editing)
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when field is updated
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.category.trim()) {
      errors.category = "Category is required";
    }
    
    if (!formData.type) {
      errors.type = "Type is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Permission Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="E.g., view_users, create_widget"
          className={formErrors.name ? "border-red-500" : ""}
        />
        {formErrors.name && (
          <p className="text-red-500 text-sm">{formErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe what this permission allows"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-red-500">*</span>
        </Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
          placeholder="E.g., Users, Widgets, Settings"
          className={formErrors.category ? "border-red-500" : ""}
        />
        {formErrors.category && (
          <p className="text-red-500 text-sm">{formErrors.category}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">
          Permission Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange("type", value)}
        >
          <SelectTrigger id="type" className={formErrors.type ? "border-red-500" : ""}>
            <SelectValue placeholder="Select permission type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="write">Write</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.type && (
          <p className="text-red-500 text-sm">{formErrors.type}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNew ? "Create Permission" : "Update Permission"}
        </Button>
      </div>
    </form>
  );
}
