import { TemplateList } from "@/components/ai-configuration/prompt-templates/template-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Head from "next/head";

export default function PromptTemplatesPage() {
    const navigate = useNavigate();

    const handleCreateTemplate = () => {
        navigate("/ai-configuration/prompt-templates/create");
    };

    return (
        <>
            <Head>
                <title>Prompt Templates | AI Configuration</title>
            </Head>

            <div className="container mx-auto py-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Prompt Templates</h1>
                    <p className="text-muted-foreground max-w-3xl">
                        Create and manage reusable prompt templates that define how the AI responds to user queries.
                        Templates support variables, conditional logic, and can be linked to specific AI models and activation rules.
                    </p>
                </div>

                <TemplateList />
            </div>
        </>
    );
} 