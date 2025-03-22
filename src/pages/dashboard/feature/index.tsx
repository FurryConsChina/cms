import { Button, Group, Title } from '@mantine/core';
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import DefaultContainer from '@/components/Container';
import { IconCirclePlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getFeatureList } from '@/api/dashboard/feature';
import FeatureList from '@/pages/dashboard/feature/components/FeatureList';
import { useDisclosure } from '@mantine/hooks';
import FeatureEditor from '@/pages/dashboard/feature/components/FeatureEditor';
import type { FeatureType } from '@/types/feature';
import { useQueryState, parseAsInteger } from 'nuqs';

export default function FeaturePage() {
  const navigate = useNavigate();
  const editingFeature = useRef<FeatureType>(null);

  const [opened, { open, close }] = useDisclosure(false);

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
  };

  const pagination = {
    current: currentPage,
    pageSize,
  };

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ['feature-list', pagination],
    queryFn: () => getFeatureList(pagination),
  });

  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Group justify="space-between">
          <Title order={2}>标签列表</Title>

          <Button
            leftSection={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              editingFeature.current = null;
              open();
            }}
          >
            添加标签
          </Button>
        </Group>
      </DefaultContainer>

      <div className="shadow mt-4 p-4 rounded-xl bg-white">
        <FeatureList
          data={data || { total: 0, records: [] }}
          isPending={isPending}
          pagination={pagination}
          setPagination={setPagination}
          onEdit={(feature) => {
            editingFeature.current = feature;
            open();
          }}
        />
      </div>

      <FeatureEditor
        opened={opened}
        onClose={close}
        editingFeature={editingFeature.current}
      />
    </>
  );
}
