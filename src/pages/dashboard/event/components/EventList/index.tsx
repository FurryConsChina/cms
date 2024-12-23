import { ActionIcon, Badge, Button, Menu, Tooltip, rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Input, Space, Table, type TableColumnType, Tag } from 'antd';
import dayjs from 'dayjs';

import { cleanPageCache } from '@/api/dashboard/cache';
import {
  EventScaleLabel,
  EventStatusColor,
  EventStatusLabel,
} from '@/consts/event';
import type { EventType } from '@/types/event';
import {
  IconEdit,
  IconInfoCircle,
  IconLink,
  IconMenu,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

import type { List } from '@/types/Request';
import type { FilterDropdownProps } from 'antd/es/table/interface';

function EventList({
  data,
  pagination,
  isPending,
  updatePagination,
  onDeleteEvent,
}: {
  data: List<EventType>;
  pagination: {
    current: number;
    pageSize: number;
    search?: string;
    orgSearch?: string;
  };
  isPending: boolean;
  updatePagination: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
      search?: string;
      orgSearch?: string;
    }>
  >;
  onDeleteEvent: (id: string) => void;
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

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: keyof EventType,
  ) => {
    console.log(selectedKeys);
    confirm();
    updatePagination((exist) => ({
      ...exist,
      ...(dataIndex === 'name'
        ? {
            search: selectedKeys[0],
          }
        : {}),
      ...(dataIndex === 'organization'
        ? {
            orgSearch: selectedKeys[0],
          }
        : {}),
      current: 1,
    }));
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps['confirm'],
    dataIndex: keyof EventType,
  ) => {
    clearFilters();
    confirm();
    updatePagination((exist) => ({
      ...exist,
      ...(dataIndex === 'name'
        ? {
            search: undefined,
          }
        : {}),
      ...(dataIndex === 'organization'
        ? {
          orgSearch: undefined,
          }
        : {}),
      current: 1,
    }));
  };

  const getColumnSearchProps = (
    dataIndex: keyof EventType,
  ): TableColumnType<EventType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Space direction="vertical">
          <Input
            placeholder={`搜索列 ${dataIndex}`}
            value={selectedKeys[0]}
            allowClear
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
          />
          <Space>
            <Button
              onClick={() =>
                handleSearch(selectedKeys as string[], confirm, dataIndex)
              }
              leftSection={<IconSearch size={14} />}
              size="xs"
              variant="light"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button
              onClick={() =>
                clearFilters && handleReset(clearFilters, confirm, dataIndex)
              }
              size="xs"
              variant="white"
              color="gray"
            >
              重置
            </Button>
            <Button
              size="xs"
              variant="white"
              color="gray"
              onClick={() => {
                close();
              }}
            >
              关闭
            </Button>
          </Space>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <IconSearch
        size={14}
        style={{ color: filtered ? '#1677ff' : undefined }}
      />
    ),
  });

  const columns: ColumnsType<EventType> = [
    {
      title: '展商',
      dataIndex: ['organization', 'name'],
      key: 'organizationName',
      fixed: 'left',
      ...getColumnSearchProps('organization'),
    },
    {
      title: '展会名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      ...getColumnSearchProps('name'),
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
              window.open(`/dashboard/event/${record.id}/edit`);
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
                onClick={() => {
                  onDeleteEvent(record.id);
                }}
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
          ...exist,
          pageSize: pagination.pageSize || exist.pageSize,
          current: pagination.current || exist.current,
        }));
      }}
    />
  );
}

export default EventList;
