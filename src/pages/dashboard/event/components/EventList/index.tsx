import { Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { ActionIcon, Badge, Button, Menu, rem, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import type { ColumnsType } from 'antd/es/table';
import {
  EventScaleLabel,
  EventStatusColor,
  EventStatusLabel,
} from '@/consts/event';
import type { EventType } from '@/types/event';
import { useMutation } from '@tanstack/react-query';
import { cleanPageCache } from '@/api/dashboard/cache';
import {
  IconEdit,
  IconInfoCircle,
  IconLink,
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
        title: '刷新成功',
        message: '刷新页面缓存成功',
      });
    },
  });

  const navigate = useNavigate();

  const columns: ColumnsType<EventType> = [
    {
      title: '展商',
      dataIndex: ['organization', 'name'],
      key: 'organizationName',
    },
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
            {dayjs(record.endAt).format('MM/DD')}
          </Tag>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tooltip label={EventStatusLabel[status]}>
          <Badge color={EventStatusColor[status]}>
            {EventStatusLabel[status]}
          </Badge>
        </Tooltip>
      ),
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
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            variant="light"
            color="green"
            onClick={() => {
              navigate(`/dashboard/event/${record.id}/edit`);
            }}
            leftSection={<IconEdit size={14} />}
          >
            编辑
          </Button>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light" aria-label="Settings">
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
              <Menu.Item
                leftSection={
                  <IconLink style={{ width: rem(14), height: rem(14) }} />
                }
                rightSection={
                  <Tooltip label="国际站没有缓存，修改后会立刻显示">
                    <IconInfoCircle size={14} />
                  </Tooltip>
                }
                onClick={() => {
                  window.open(
                    `https://www.furryeventchina.com/${record.organization.slug}/${record.slug}`,
                    '_blank',
                  );
                }}
              >
                去国际站查看
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconLink style={{ width: rem(14), height: rem(14) }} />
                }
                rightSection={
                  <Tooltip label="国内站有缓存，修改后大概24小时生效，除非你手动刷新">
                    <IconInfoCircle size={14} />
                  </Tooltip>
                }
                onClick={() => {
                  window.open(
                    `https://www.furrycons.cn/${record.organization.slug}/${record.slug}`,
                    '_blank',
                  );
                }}
              >
                去国内站查看
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
