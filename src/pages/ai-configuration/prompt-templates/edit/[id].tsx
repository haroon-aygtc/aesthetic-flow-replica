import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TemplateForm } from "@/components/ai-configuration/prompt-templates/template-form";
import { PromptTemplate } from "@/utils/prompt-template-service";
import { promptTemplatesApi } from "@/api/prompt-templates";
import Head from "next/head";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function EditTemplatePage() {
    const router = useRouter();
    const { id } = router.query;

    const [template, setTemplate] = useState<PromptTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTemplate() {
            if (!id || typeof id !== 'string') return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await promptTemplatesApi.getTemplateById(id);
                setTemplate(response.data);
            } catch (err) {
                console.error("Failed to load template:", err);
                setError("Failed to load the template. It may have been deleted or you don't have permission to view it.");
            } finally {
                setIsLoading(false);
            }
        }

        loadTemplate();
    }, [id]);

    if (isLoading) {
        return (
            <>
                <Head>
                    <title>Loading Template... | AI Configuration</title>
                </Head>
                <div className="container mx-auto py-6">
                    <div className="flex items-center mb-8">
                        <Skeleton className="h-10 w-10 rounded-full mr-2" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </>
        );
    }

    if (error || !template) {
        return (
            <>
                <Head>
                    <title>Template Not Found | AI Configuration</title>
                </Head>
                <div className="container mx-auto py-6">
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error || "Template not found"}</AlertDescription>
                    </Alert>
                    <Button onClick={() => router.push("/ai-configuration/prompt-templates")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Templates
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Edit {template.name} | AI Configuration</title>
            </Head>

            <div className="container mx-auto py-6">
                <TemplateForm initialTemplate={template} isEditing={true} />
            </div>
        </>
    );
} 