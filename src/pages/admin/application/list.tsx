import { useState } from "react";
import { AdminApplicationApi } from "@/api/cms/admin/application";
import ApplicationList from "@/components/application/ApplicationList";
import { useAdminApplicationsList } from "@/hooks/api/application/useAdminApplicationsList";

export default function AdminApplicationsPage() {
  const [current, setCurrent] = useState(1);
  const pageSize = 20;
  const { data, isPending, refetch } = useAdminApplicationsList({ current, pageSize });

  return (
    <ApplicationList
      title="应用管理"
      showCurrentRpm
      data={data}
      isPending={isPending}
      current={current}
      pageSize={pageSize}
      onPageChange={setCurrent}
      onRefresh={refetch}
      onSave={(value, id) =>
        id
          ? AdminApplicationApi.updateApplication(id, value)
          : AdminApplicationApi.createApplication(value)
      }
      onDeleteApplication={(id) => AdminApplicationApi.deleteApplication(id)}
    />
  );
}
