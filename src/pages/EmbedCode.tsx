
import { AdminLayout } from "@/components/layouts/admin-layout";
import { EmbedCodeModule } from "@/modules/embed-code";

const EmbedCode = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Embed Code</h1>
          <p className="text-muted-foreground">
            Get code snippets to embed your AI assistant on your website
          </p>
        </div>

        <EmbedCodeModule />
      </div>
    </AdminLayout>
  );
};

export default EmbedCode;
