import { Button, Group, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, getEventList } from '@/api/dashboard/event';
import DefaultContainer from '@/components/Container';
import EventList from '@/pages/dashboard/event/components/EventList';
import { IconCirclePlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useQueryState, parseAsInteger } from 'nuqs';

export default function EventPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useQueryState('search');
  const [orgSearch, setOrgSearch] = useQueryState('orgSearch');
  const [currentPage, setCurrentPage] = useQueryState(
    'currentPage',
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useState(20);

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
      notifications.show({
        title: '删除成功',
        message: '删除展商成功，如果是误操作请马上联系管理员。',
      });
      refetch();
    },
  });

  return (
    <>
      <DefaultContainer className="sticky top-0 z-10">
        <Group justify="space-between">
          <Title order={2}>展会列表</Title>

          <Button
            leftSection={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              navigate('/dashboard/event/create');
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
          setPagination={setPagination}
          onDeleteEvent={onDeleteEvent}
        />
      </div>
    </>
  );
}
