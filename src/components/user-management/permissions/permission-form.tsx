
import { useState } from "react";
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
import { Button } from "@/components/ui/button";

interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
  created_at: string;
}

interface PermissionFormProps {
  permission?: Permission;
  onSubmit: (permissionData: {
    name: string;
    description: string;
    category: string;
    type: string;
  }) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
  isProcessing?: boolean;
}

export function PermissionForm({
  permission,
  onSubmit,
  onCancel,
  isNew = false,
  isProcessing = false,
}: PermissionFormProps) {
  const [formData, setFormData] = useState({
    name: permission?.name || "",
    description: permission?.description || "",
    category: permission?.category || "",
    type: permission?.type || "read",
  });

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
          placeholder="e.g., users, posts, comments"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange("type", value)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="write">Write</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isProcessing}>
          {isProcessing ? "Processing..." : isNew ? "Add Permission" : "Update Permission"}
        </Button>
      </div>
    </div>
  );
}
