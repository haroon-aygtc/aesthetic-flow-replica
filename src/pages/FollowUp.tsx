
import { AdminLayout } from "@/components/layouts/admin-layout";
import { FollowUpEngineModule } from "@/modules/follow-up-engine";

const FollowUp = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Follow-Up Engine</h1>
          <p className="text-muted-foreground">
            Configure automated follow-up interactions with users
          </p>
        </div>

        <FollowUpEngineModule />
      </div>
    </AdminLayout>
  );
};

export default FollowUp;
