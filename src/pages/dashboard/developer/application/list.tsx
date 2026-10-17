import { useState } from "react";
import { ApplicationApi } from "@/api/cms/application";
import ApplicationList from "@/components/Application/ApplicationList";
import { useApplicationsList } from "@/hooks/api/application/useApplicationsList";

export default function MyApplicationsPage() {
  const [current, setCurrent] = useState(1);
  const pageSize = 20;
  const { data, isPending, refetch } = useApplicationsList({ current, pageSize });

  return (
    <ApplicationList
      title="我的应用"
      data={data}
      isPending={isPending}
      current={current}
      pageSize={pageSize}
      onPageChange={setCurrent}
      onRefresh={refetch}
      onSave={(value, id) =>
        id ? ApplicationApi.updateApplication(id, value) : ApplicationApi.createApplication(value)
      }
      onDeleteApplication={ApplicationApi.deleteApplication}
    />
  );
}
