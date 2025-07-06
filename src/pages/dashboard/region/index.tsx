import { Button, Group, Title } from '@mantine/core';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DefaultContainer from '@/components/Container';
import { IconCirclePlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getRegionList } from '@/api/dashboard/region';
import RegionList from '@/pages/dashboard/region/components/RegionList';
import type { Region } from '@/types/region';

export default function RegionPage() {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ['region-list', pagination],
    queryFn: () => getRegionList(pagination),
  });

  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Group justify="space-between">
          <Title order={2}>区域列表</Title>

          <Button
            leftSection={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => navigate('/dashboard/region/create')}
          >
            添加区域
          </Button>
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
