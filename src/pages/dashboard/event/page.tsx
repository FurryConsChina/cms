import { Button, Flex, Typography, App } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, getEventList } from '@/api/dashboard/event';
import DefaultContainer from '@/components/Container';
import EventList from '@/pages/dashboard/event/components/EventList';
import { IconCirclePlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useQueryState, parseAsInteger } from 'nuqs';

const { Title } = Typography;

export default function EventPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [search, setSearch] = useQueryState('search');
  const [orgSearch, setOrgSearch] = useQueryState('orgSearch');
  const [currentPage, setCurrentPage] = useQueryState(
    'currentPage',
    parseAsInteger.withDefault(1)
  );
  // const [pageSize, setPageSize] = useState(20);
  const [pageSize, setPageSize] = useQueryState(
    'pageSize',
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
    queryKey: ['event-list', pagination],
    queryFn: () => getEventList(pagination),
  });

  const { mutate: onDeleteEvent } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      message.success('删除展商成功，如果是误操作请马上联系管理员。');
      refetch();
    },
  });

  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>展会列表</Title>

          <Button
            type="primary"
            icon={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              navigate('/dashboard/event/create');
            }}
          >
            添加展会
          </Button>
        </Flex>
      </DefaultContainer>

      <div className="shadow mt-4 p-4 rounded-xl bg-white">
        <EventList
          data={data || { total: 0, records: [] }}
          isPending={isPending}
          pagination={pagination}
          setPagination={setPagination}
          onDeleteEvent={onDeleteEvent}
        />
      </div>
    </>
  );
}
