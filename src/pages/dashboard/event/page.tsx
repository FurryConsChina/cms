import { Button, Group, Title } from "@mantine/core";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventList } from "@/api/dashboard/event";
import DefaultContainer from "@/components/Container";
import EventList from "@/pages/dashboard/event/components/EventList";
import { IconCirclePlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function EventPage() {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ["event-list", pagination],
    queryFn: () => getEventList(pagination),
  });

  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Group justify="space-between">
          <Title order={2}>展会列表</Title>

          <Button
            leftSection={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              navigate("/dashboard/event/create");
            }}
          >
            添加展会
          </Button>
        </Group>
      </DefaultContainer>

      <div className="shadow mt-4 p-4 rounded-xl bg-white">
        <EventList
          data={data || { total: 0, records: [] }}
          isPending={isPending}
          pagination={pagination}
          updatePagination={setPagination}
        />
      </div>
    </>
  );
}
