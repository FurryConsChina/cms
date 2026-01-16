import { Button, Flex, Typography } from 'antd';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DefaultContainer from '@/components/Container';
import { IconCirclePlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getFeatureList } from '@/api/dashboard/feature';
import FeatureList from '@/pages/dashboard/feature/components/FeatureList';
import FeatureEditor from '@/pages/dashboard/feature/components/FeatureEditor';
import type { FeatureType } from '@/types/feature';
import { useQueryState, parseAsInteger } from 'nuqs';

const { Title } = Typography;

export default function FeaturePage() {
  const navigate = useNavigate();
  const editingFeature = useRef<FeatureType>(null);

  const [opened, setOpened] = useState(false);

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
      <DefaultContainer className="sticky top-0 z-20">
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>标签列表</Title>

          <Button
            type="primary"
            icon={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              editingFeature.current = null;
              setOpened(true);
            }}
          >
            添加标签
          </Button>
        </Flex>
      </DefaultContainer>

      <div className="shadow mt-4 p-4 rounded-xl bg-white">
        <FeatureList
          data={data || { total: 0, records: [] }}
          isPending={isPending}
          pagination={pagination}
          setPagination={setPagination}
          onEdit={(feature) => {
            editingFeature.current = feature;
            setOpened(true);
          }}
        />
      </div>

      <FeatureEditor
        opened={opened}
        onClose={() => setOpened(false)}
        editingFeature={editingFeature.current}
      />
    </>
  );
}
