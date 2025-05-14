
import { AdminLayout } from "@/components/layouts/admin-layout";
import { ResponseFormatter } from "@/components/ai-configuration/response-formatter";

const ResponseFormatterPage = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Response Formatter</h1>
          <p className="text-muted-foreground">
            Configure how AI responses are formatted and presented
          </p>
        </div>

        <ResponseFormatter />
      </div>
    </AdminLayout>
  );
};

export default ResponseFormatterPage;
