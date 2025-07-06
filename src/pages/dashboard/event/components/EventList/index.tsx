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
import { EventItem } from '@/types/event';

function EventList({
  data,
  pagination,
  setPagination,
  isPending,
  onDeleteEvent,
}: {
  data: List<EventItem>;
  pagination: {
    current: number;
    pageSize: number;
    search: string | null;
    orgSearch: string | null;
  };
  setPagination: {
    current: (current: number) => void;
    pageSize: (pageSize: number) => void;
    search: (search: string | null) => void;
    orgSearch: (orgSearch: string | null) => void;
  };
  isPending: boolean;
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
    dataIndex: keyof EventItem,
  ) => {
    console.log(selectedKeys);
    confirm();

    if (dataIndex === 'name') {
      setPagination.search(selectedKeys[0]);
    } else if (dataIndex === 'organization') {
      setPagination.orgSearch(selectedKeys[0]);
    }
    setPagination.current(1);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps['confirm'],
    dataIndex: keyof EventItem,
  ) => {
    clearFilters();
    confirm();

    if (dataIndex === 'name') {
      setPagination.search(null);
    } else if (dataIndex === 'organization') {
      setPagination.orgSearch(null);
    }
    setPagination.current(1);
  };

  const getColumnSearchProps = (
    dataIndex: keyof EventItem,
    searchPlaceholder?: string,
  ): TableColumnType<EventItem> => ({
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
            placeholder={searchPlaceholder}
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

  const columns: ColumnsType<EventItem> = [
    {
      title: '展商',
      dataIndex: ['organization', 'name'],
      key: 'organizationName',
      fixed: 'left',
      ...getColumnSearchProps('organization', '请输入展商名称'),
    },
    {
      title: '展会名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      ...getColumnSearchProps('name', '请输入展会名称'),
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
                onClick={() => {
                  window.open(
                    `https://www.furrycons.cn/${record.organization.slug}/${record.slug}`,
                    '_blank'
                  );
                }}
              >
                在网站上查看
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
      onChange={(tablePagination) => {
        if (tablePagination.current) {
          setPagination.current(tablePagination.current);
        }
        if (tablePagination.pageSize) {
          setPagination.pageSize(tablePagination.pageSize);
        }
      }}
    />
  );
}

export default EventList;
