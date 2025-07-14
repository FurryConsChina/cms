import { getApplicationList } from "@/api/developer/application";
import DefaultContainer from "@/components/Container";
import ApplicationList from "@/pages/dashboard/developer/application/components/ApplicationList";
import { Button, Group, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCirclePlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useNavigate } from "react-router-dom";

export default function ApplicationPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useQueryState("search");
  const [orgSearch, setOrgSearch] = useQueryState("orgSearch");
  const [currentPage, setCurrentPage] = useQueryState(
    "currentPage",
    parseAsInteger.withDefault(1)
  );

  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(20)
  );

  const pagination = {
    search,
    orgSearch,
    current: currentPage,
    pageSize,
  };

  const setPagination = {
    search: setSearch,
    orgSearch: setOrgSearch,
    current: setCurrentPage,
    pageSize: setPageSize,
  };

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ["application-list", pagination],
    queryFn: () => getApplicationList(),
  });

  //   const { mutate: onDeleteEvent } = useMutation({
  //     mutationFn: deleteEvent,
  //     onSuccess: () => {
  //       notifications.show({
  //         title: "删除成功",
  //         message: "删除展商成功，如果是误操作请马上联系管理员。",
  //       });
  //       refetch();
  //     },
  //   });

  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Group justify="space-between">
          <Title order={2}>应用列表</Title>

          <Button
            leftSection={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              navigate("/developer/application/create");
            }}
          >
            添加应用
          </Button>
        </Group>
      </DefaultContainer>

      <div className="shadow mt-4 p-4 rounded-xl bg-white">
        <ApplicationList
          data={data || { total: 0, records: [], current: 1, pageSize: 20 }}
          isPending={isPending}
          pagination={pagination}
          setPagination={setPagination}
          onDelete={() => {}}
        />
      </div>
    </>
  );
}
