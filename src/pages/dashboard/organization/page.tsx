import { getOrganizationList } from '@/api/dashboard/organization';
import DefaultContainer from '@/components/Container';
import OrganizationList from '@/pages/dashboard/organization/components/OrganizationList';
import { Button, Group, Title } from '@mantine/core';
import { IconCirclePlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useQueryState, parseAsInteger } from 'nuqs';

export default function OrganizationPage() {
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useQueryState(
    'currentPage',
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    'pageSize',
    parseAsInteger.withDefault(20)
  );
  const setPagination = {
    current: setCurrentPage,
    pageSize: setPageSize,
  }

  const pagination = {
    current: currentPage,
    pageSize,
  };

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
          setPagination={setPagination}
        />
      </div>
    </>
  );
}
