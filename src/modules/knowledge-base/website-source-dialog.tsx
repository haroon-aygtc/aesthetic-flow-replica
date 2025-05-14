import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Link } from "lucide-react";
import { knowledgeBaseService, WebsiteSource } from "@/utils/knowledge-base-service";

// Form schema for adding a website source
const websiteSourceSchema = z.object({
    url: z
        .string()
        .url({ message: "Please enter a valid URL" })
        .nonempty({ message: "URL is required" }),
    category: z.string().nonempty({ message: "Category is required" }),
    auto_update: z.boolean().default(false),
    update_frequency: z.enum(["daily", "weekly", "monthly"]).optional()
});

type WebsiteSourceFormValues = z.infer<typeof websiteSourceSchema>;

interface WebsiteSourceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (sources: WebsiteSource[]) => void;
}

export function WebsiteSourceDialog({
    open,
    onOpenChange,
    onComplete
}: WebsiteSourceDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Initialize form with react-hook-form and zod validation
    const form = useForm<WebsiteSourceFormValues>({
        resolver: zodResolver(websiteSourceSchema),
        defaultValues: {
            url: "",
            category: "",
            auto_update: false,
            update_frequency: "weekly"
        }
    });

    // Watch auto_update to conditionally show update_frequency field
    const autoUpdate = form.watch("auto_update");

    // Handle form submission
    const onSubmit = async (values: WebsiteSourceFormValues) => {
        setIsLoading(true);

        try {
            // Clean up values - if auto_update is false, we don't need update_frequency
            const payload = {
                ...values,
                update_frequency: values.auto_update ? values.update_frequency : undefined
            };

            // Ensure required fields are present
            if (!payload.url || !payload.category) {
                throw new Error("URL and category are required");
            }

            const response = await knowledgeBaseService.addWebsiteSource({
                url: payload.url,
                category: payload.category,
                auto_update: payload.auto_update,
                update_frequency: payload.update_frequency
            });

            // Reset the form
            form.reset();

            // Notify parent component with the new source
            onComplete([response.data.data]);

            // Show success toast
            toast({
                title: "Website added successfully",
                description: "The website is being processed and will be available shortly.",
            });
        } catch (error: any) {
            console.error("Failed to add website:", error);

            // Handle validation errors
            if (error.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                Object.keys(serverErrors).forEach(key => {
                    if (key in form.formState.errors) {
                        form.setError(key as any, {
                            type: "server",
                            message: serverErrors[key][0]
                        });
                    }
                });
            } else {
                // Show generic error toast
                toast({
                    title: "Error adding website",
                    description: error.response?.data?.message || "Failed to add website. Please try again.",
                    variant: "destructive"
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Website Source</DialogTitle>
                    <DialogDescription>
                        Add a website to be scraped and indexed for the knowledge base.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website URL</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <Link className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="https://example.com"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Documentation, Product, FAQ"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="auto_update"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Enable automatic updates</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Periodically refresh content from this website
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {autoUpdate && (
                            <FormField
                                control={form.control}
                                name="update_frequency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Update Frequency</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Website
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 