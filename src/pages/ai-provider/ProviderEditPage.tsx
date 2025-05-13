import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Provider name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }).optional(),
  description: z.string().optional(),
  api_base_url: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
  auth_type: z.enum(["bearer", "api_key", "basic", "none"]),
  auth_header_name: z.string().optional(),
  auth_prefix: z.string().optional(),
  supports_streaming: z.boolean().default(false),
  requires_model_selection: z.boolean().default(true),
  is_active: z.boolean().default(true),
  capabilities: z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof formSchema>

export function ProviderEditPage() {
  const { providerId } = useParams()
  const isEditing = providerId !== undefined
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [availableCapabilities, setAvailableCapabilities] = useState<{ value: string, label: string }[]>([
    { value: "chat", label: "Chat Completion" },
    { value: "embeddings", label: "Embeddings" },
    { value: "vision", label: "Vision/Image Analysis" },
    { value: "audio", label: "Audio Processing" },
    { value: "function_calling", label: "Function Calling" }
  ])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      api_base_url: "",
      auth_type: "bearer",
      auth_header_name: "Authorization",
      auth_prefix: "Bearer",
      supports_streaming: false,
      requires_model_selection: true,
      is_active: true,
      capabilities: [],
    },
  })

  // Auto-generate slug when name changes
  const watchName = form.watch("name")
  useEffect(() => {
    if (!isEditing && watchName && !form.getValues("slug")) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      form.setValue("slug", slug)
    }
  }, [watchName, form, isEditing])

  // Fetch provider data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchProvider = async () => {
        try {
          const response = await fetch(`/api/admin/providers/${providerId}/edit`)
          const result = await response.json()
          
          if (result.success && result.data.provider) {
            const provider = result.data.provider
            form.reset({
              name: provider.name,
              slug: provider.slug,
              description: provider.description || "",
              api_base_url: provider.api_base_url || "",
              auth_type: provider.auth_config?.type || "bearer",
              auth_header_name: provider.auth_config?.header_name || "Authorization",
              auth_prefix: provider.auth_config?.prefix || "Bearer",
              supports_streaming: provider.supports_streaming || false,
              requires_model_selection: provider.requires_model_selection || true,
              is_active: provider.is_active,
              capabilities: provider.capabilities || [],
            })
            
            if (result.data.capabilities) {
              setAvailableCapabilities(
                Object.entries(result.data.capabilities).map(([value, label]) => ({
                  value,
                  label: label as string,
                }))
              )
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to load provider data",
              variant: "destructive",
            })
            navigate("/dashboard/provider-management")
          }
        } catch (error) {
          console.error("Error fetching provider:", error)
          toast({
            title: "Error",
            description: "Failed to load provider data",
            variant: "destructive",
          })
          navigate("/dashboard/provider-management")
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchProvider()
    }
  }, [isEditing, providerId, form, navigate, toast])

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true)
    
    try {
      const url = isEditing
        ? `/api/admin/providers/${providerId}`
        : "/api/admin/providers"
      
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: isEditing
            ? "Provider updated successfully"
            : "Provider created successfully",
        })
        navigate("/dashboard/provider-management")
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save provider",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving provider:", error)
      toast({
        title: "Error",
        description: "Failed to save provider",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/provider-management")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>{isEditing ? "Edit Provider" : "Add Provider"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the provider details"
                : "Create a new AI provider for your application"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input placeholder="OpenAI" {...field} />
                    </FormControl>
                    <FormDescription>
                      The display name for this provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="openai" {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier used in API calls
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of this provider"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="api_base_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Base URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.openai.com/v1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The base URL for API requests
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="auth_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authentication Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select authentication type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="none">No Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How authentication is handled with this provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("auth_type") !== "none" && (
                <FormField
                  control={form.control}
                  name="auth_header_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auth Header Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Authorization"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        HTTP header name used for authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {form.watch("auth_type") === "bearer" && (
              <FormField
                control={form.control}
                name="auth_prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auth Prefix</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bearer"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Prefix added before the token (e.g., "Bearer ")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="supports_streaming"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Supports Streaming</FormLabel>
                      <FormDescription>
                        Provider supports streaming responses
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requires_model_selection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Requires Model Selection</FormLabel>
                      <FormDescription>
                        API requires specifying a model
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Provider is active and available for use
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="capabilities"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Capabilities</FormLabel>
                    <FormDescription>
                      Select the capabilities supported by this provider
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableCapabilities.map((capability) => (
                      <FormField
                        key={capability.value}
                        control={form.control}
                        name="capabilities"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={capability.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(capability.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, capability.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== capability.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {capability.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/provider-management")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Provider" : "Create Provider"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 