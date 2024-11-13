import { Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { ActionIcon, Menu, rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import type { ColumnsType } from 'antd/es/table';
import { EventScaleLabel, EventStatusLabel } from '@/consts/event';
import type { EventType } from '@/types/event';
import { useMutation } from '@tanstack/react-query';
import { cleanPageCache } from '@/api/dashboard/cache';
import {
  IconEdit,
  IconMenu,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import type { List } from '@/types/Request';

function EventList({
  data,
  pagination,
  isPending,
  updatePagination,
}: {
  data: List<EventType>;
  pagination: { current: number; pageSize: number };
  isPending: boolean;
  updatePagination: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
    }>
  >;
}) {
  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      notifications.show({
        message: '刷新成功',
        description: '刷新页面缓存成功',
      });
    },
  });

  const navigate = useNavigate();

  const columns: ColumnsType<EventType> = [
    {
      title: '展会名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: '日期',
      key: 'date',
      render: (_, record) => (
        <Space>
          <Tag>
            {dayjs(record.startAt).format('YYYY/MM/DD')}-
            {dayjs(record.endAt).format('YYYY/MM/DD')}
          </Tag>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      key: 'status',
      render: (status) => EventStatusLabel[status],
    },
    {
      title: '规模',
      dataIndex: 'scale',
      key: 'scale',
      render: (scale) => EventScaleLabel[scale],
    },
    {
      title: '城市',
      dataIndex: ['addressExtra', 'city'],
      key: 'city',
    },
    {
      title: '展商',
      dataIndex: ['organization', 'name'],
      key: 'organizationName',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      // width: 'fit',
      render: (_, record) => (
        <Space size="middle">
          {/* <Button
            color="teal"
            size="xs"
            onClick={() => {
              refreshPage(`/${record.organization.slug}/${record.slug}`);
            }}
          >
            刷新
          </Button> */}
          <ActionIcon
            variant="light"
            color="blue"
            aria-label="view"
            onClick={() => {
              navigate(`/dashboard/event/${record.id}/edit`);
            }}
          >
            <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon color="green" variant="light" aria-label="Settings">
                <IconMenu
                  style={{ width: '70%', height: '70%' }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>菜单</Menu.Label>
              <Menu.Item
                leftSection={
                  <IconRefresh style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={() => {
                  refreshPage(`/${record.organization.slug}/${record.slug}`);
                }}
              >
                刷新
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>危险</Menu.Label>
              <Menu.Item
                color="red"
                disabled
                leftSection={
                  <IconTrash style={{ width: rem(14), height: rem(14) }} />
                }
              >
                删除
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey={(row) => row.id}
      columns={columns}
      loading={isPending}
      dataSource={data?.records || []}
      pagination={{
        pageSize: pagination.pageSize,
        total: data?.total,
        current: pagination.current,
      }}
      onChange={(pagination) => {
        updatePagination((exist) => ({
          pageSize: pagination.pageSize || exist.pageSize,
          current: pagination.current || exist.current,
        }));
      }}
    />
  );
}

export default EventList;
