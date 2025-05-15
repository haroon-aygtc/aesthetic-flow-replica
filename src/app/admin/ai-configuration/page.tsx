import { TemplateModule } from "@/modules/template"
import { KnowledgeBaseModule } from "@/modules/knowledge-base"

// Component imports...

export default function AIConfigurationPage() {
    return (
        <div className="container mx-auto py-10 space-y-10">
            <h1 className="text-2xl font-bold">AI Configuration</h1>

            {/* Knowledge Base Module */}
            <KnowledgeBaseModule />

            {/* Prompt Template Module */}
            <TemplateModule />

            {/* Other modules */}
            {/* <ContextModule /> */}
            {/* Add more modules as they are implemented */}
        </div>
    )
} 