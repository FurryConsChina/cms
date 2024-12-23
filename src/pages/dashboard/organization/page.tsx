import { getOrganizationList } from '@/api/dashboard/organization';
import DefaultContainer from '@/components/Container';
import OrganizationList from '@/pages/dashboard/organization/components/OrganizationList';
import { Button, Group, Title } from '@mantine/core';
import { IconCirclePlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrganizationPage() {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ['organization-list', pagination],
    queryFn: () => getOrganizationList(pagination),
  });

  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Group justify="space-between">
          <Title order={2}>展商列表</Title>

          <Button
            leftSection={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              navigate('/dashboard/organization/create');
            }}
          >
            添加展商
          </Button>
        </Group>
      </DefaultContainer>

      <div className="shadow mt-4 p-4 rounded-xl bg-white">
        <OrganizationList
          data={data || { total: 0, records: [] }}
          isPending={isPending}
          pagination={pagination}
          updatePagination={setPagination}
        />
      </div>
    </>
  );
}
