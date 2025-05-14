
import { AdminLayout } from "@/components/layouts/admin-layout";
import { KnowledgeBaseModule } from "@/modules/knowledge-base";

const KnowledgeBase = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage knowledge sources for your AI chatbot
          </p>
        </div>

        <KnowledgeBaseModule />
      </div>
    </AdminLayout>
  );
};

export default KnowledgeBase;
