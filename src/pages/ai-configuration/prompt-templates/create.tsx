import { TemplateForm } from "@/components/ai-configuration/prompt-templates/template-form";
import Head from "next/head";

export default function CreateTemplatePage() {
    return (
        <>
            <Head>
                <title>Create Prompt Template | AI Configuration</title>
            </Head>

            <div className="container mx-auto py-6">
                <TemplateForm />
            </div>
        </>
    );
} 