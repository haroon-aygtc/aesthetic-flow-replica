import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MoreHorizontal,
  PlusCircle,
  Settings,
  Trash2,
  Check,
  X,
  LucideIcon
} from "lucide-react";
import { AIModelData } from "@/utils/ai-model-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ModelsTableProps {
  models: AIModelData[];
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isLoading?: boolean;
}

export function ModelsTable({
  models,
  onDelete,
  onSetDefault,
  isLoading = false,
}: ModelsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof AIModelData>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof AIModelData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredModels = models.filter((model) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      model.name.toLowerCase().includes(searchLower) ||
      model.provider.toLowerCase().includes(searchLower) ||
      (model.description && model.description.toLowerCase().includes(searchLower))
    );
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (fieldA === undefined || fieldB === undefined) return 0;

    let comparison = 0;
    if (typeof fieldA === "string" && typeof fieldB === "string") {
      comparison = fieldA.localeCompare(fieldB);
    } else if (typeof fieldA === "number" && typeof fieldB === "number") {
      comparison = fieldA - fieldB;
    } else if (typeof fieldA === "boolean" && typeof fieldB === "boolean") {
      comparison = fieldA === fieldB ? 0 : fieldA ? 1 : -1;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleEditModel = (id: number) => {
    router.push(`/ai-configuration/model/${id}`);
  };

  const getProviderBadge = (provider: string) => {
    const providers: Record<string, { color: string; bg: string; icon?: LucideIcon }> = {
      openai: { color: "text-green-700", bg: "bg-green-100 dark:bg-green-900/20 dark:text-green-300" },
      anthropic: { color: "text-purple-700", bg: "bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300" },
      mistral: { color: "text-blue-700", bg: "bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300" },
      google: { color: "text-yellow-700", bg: "bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300" },
      huggingface: { color: "text-orange-700", bg: "bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300" },
    };

    const lowercaseProvider = provider.toLowerCase();
    const match = Object.entries(providers).find(([key]) => lowercaseProvider.includes(key));
    
    return match 
      ? `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${match[1].bg} ${match[1].color}`
      : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  return (
    <Card className="w-full shadow-sm border-none">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">AI Models</h3>
          <Button 
            onClick={() => router.push("/ai-configuration/model/new")}
            variant="glow"
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Model
          </Button>
        </div>
        <Input
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Model Name
                  {sortField === "name" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("provider")}
                className="cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Provider
                  {sortField === "provider" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("is_default")}
                className="cursor-pointer hover:bg-muted/20 transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  Default
                  {sortField === "is_default" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("active")}
                className="cursor-pointer hover:bg-muted/20 transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortField === "active" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading models...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedModels.length > 0 ? (
              sortedModels.map((model) => (
                <TableRow 
                  key={model.id}
                  className="group animate-colors transition-all hover:bg-muted/10"
                >
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>
                    <span className={getProviderBadge(model.provider)}>
                      {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {model.is_default ? (
                      <Badge variant="secondary" className="bg-success/20 text-success hover:bg-success/20">
                        <Check className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onSetDefault(model.id || 0)}
                      >
                        Set Default
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {model.active !== false ? (
                      <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="animate-scale">
                        <DropdownMenuItem
                          onClick={() => handleEditModel(model.id || 0)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditModel(model.id || 0)}
                          className="cursor-pointer gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(model.id || 0)}
                          className="cursor-pointer text-destructive gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <p className="text-muted-foreground">No models found</p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
} 