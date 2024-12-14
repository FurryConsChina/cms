import { ActionIcon, Button, Menu, rem, Tooltip } from '@mantine/core';
import { Space, Tag } from 'antd';
import Table, { type ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { cleanPageCache } from '@/api/dashboard/cache';
import type { List } from '@/types/Request';
import {
  OrganizationStatusLabel,
  type OrganizationType,
  OrganizationTypeLabel,
} from '@/types/organization';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconInfoCircle,
  IconLink,
  IconMenu,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function OrganizationList({
  data,
  pagination,
  isPending,
  updatePagination,
}: {
  data: List<OrganizationType>;
  pagination: { current: number; pageSize: number };
  isPending: boolean;
  updatePagination: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
    }>
  >;
}) {
  const navigate = useNavigate();

  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      notifications.show({
        title: '刷新成功',
        message: '刷新页面缓存成功',
      });
    },
  });

  const columns: ColumnsType<OrganizationType> = [
    {
      title: '展方名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      key: 'status',
      render: (status) => OrganizationStatusLabel[status],
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{OrganizationTypeLabel[type] || '未配置'}</Tag>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: '创立日期',
      key: 'date',
      render: (_, record) => (
        <Space>
          {record.creationTime
            ? dayjs(record.creationTime).format('YYYY年MM月DD日')
            : '未配置'}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            variant="light"
            color="green"
            aria-label="view"
            onClick={() => {
              navigate(`/dashboard/organization/${record.id}/edit`);
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
                  refreshPage(`/${record.slug}`);
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
                    `https://www.furryeventchina.com/${record.slug}`,
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
                    `https://www.furrycons.cn/${record.slug}`,
                    '_blank',
                  );
                }}
              >
                去国内站查看
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>危险</Menu.Label>
              <Menu.Item
                disabled
                color="red"
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
    <>
      <Table
        rowKey={(row) => row.id}
        columns={columns}
        loading={isPending}
        dataSource={data?.records || []}
        scroll={
          {
            // x: 1500,
            // y: 600
          }
        }
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
    </>
  );
}
