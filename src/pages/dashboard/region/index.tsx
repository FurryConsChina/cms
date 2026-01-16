import { Button, Flex, Typography, Space, App } from "antd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DefaultContainer from "@/components/Container";
import { IconCirclePlus, IconRefresh } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { getRegionList, recreateRegionOrder } from "@/api/dashboard/region";
import RegionList from "@/pages/dashboard/region/components/RegionList";
import { RegionType, type Region } from "@/types/region";

const { Title } = Typography;

export default function RegionPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();

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
      message.success("刷新区域排序成功");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DefaultContainer className="sticky top-0 z-20">
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>区域列表</Title>

          <Space>
            <Button
              icon={<IconRefresh size={16} stroke={1.5} />}
              onClick={handleRefreshRegionSort}
            >
              刷新区域排序
            </Button>
            <Button
              type="primary"
              icon={<IconCirclePlus size={16} stroke={1.5} />}
              onClick={() => navigate("/dashboard/region/create")}
            >
              添加区域
            </Button>
          </Space>
        </Flex>
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
