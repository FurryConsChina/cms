import { Button, Group, Title } from "@mantine/core";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DefaultContainer from "@/components/Container";
import { IconCirclePlus, IconRefresh } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { getRegionList, recreateRegionOrder } from "@/api/dashboard/region";
import RegionList from "@/pages/dashboard/region/components/RegionList";
import { RegionType, type Region } from "@/types/region";
import { Space } from "antd";
import { notifications } from "@mantine/notifications";

export default function RegionPage() {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ["region-list", pagination],
    queryFn: () => getRegionList(pagination),
  });

  const handleRefreshRegionSort = async () => {
    try {
      await recreateRegionOrder(RegionType.CITY);
      notifications.show({
        title: "刷新成功",
        message: "刷新区域排序成功",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Group justify="space-between">
          <Title order={2}>区域列表</Title>

          <Space>
            <Button
              leftSection={<IconRefresh size={16} stroke={1.5} />}
              onClick={handleRefreshRegionSort}
            >
              刷新区域排序
            </Button>
            <Button
              leftSection={<IconCirclePlus size={16} stroke={1.5} />}
              onClick={() => navigate("/dashboard/region/create")}
            >
              添加区域
            </Button>
          </Space>
        </Group>
      </DefaultContainer>

      <div className="shadow mt-4 p-4 rounded-xl bg-white">
        <RegionList
          data={data || { total: 0, records: [] }}
          isPending={isPending}
          pagination={pagination}
          updatePagination={setPagination}
          onEdit={(region) => navigate(`/dashboard/region/${region.id}/edit`)}
        />
      </div>
    </>
  );
}
