import { ActionIcon, Button, Menu, rem, Tooltip } from "@mantine/core";
import { Space, Tag, Input, type TableColumnType } from "antd";
import Table, { type ColumnsType } from "antd/es/table";
import type { FilterDropdownProps } from "antd/es/table/interface";
import dayjs from "dayjs";

import { cleanPageCache } from "@/api/dashboard/cache";
import type { List } from "@/types/Request";
import {
  OrganizationStatusLabel,
  type Organization,
  OrganizationTypeLabel,
} from "@/types/organization";
import { notifications } from "@mantine/notifications";
import {
  IconEdit,
  IconInfoCircle,
  IconLink,
  IconMenu,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function OrganizationList({
  data,
  pagination,
  isPending,
  setPagination,
  updatePagination,
}: {
  data: List<Organization>;
  pagination: {
    current: number;
    pageSize: number;
    name?: string;
    slug?: string;
  };
  isPending: boolean;
  updatePagination: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
      name?: string;
      slug?: string;
    }>
  >;
}) {
  const navigate = useNavigate();

  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      notifications.show({
        title: "刷新成功",
        message: "刷新页面缓存成功",
      });
    },
  });

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof Organization
  ) => {
    console.log(selectedKeys);
    confirm();
    updatePagination((exist) => ({
      ...exist,
      ...(dataIndex === "name" ? { name: selectedKeys[0] } : {}),
      ...(dataIndex === "slug" ? { slug: selectedKeys[0] } : {}),
      current: 1,
    }));
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof Organization
  ) => {
    clearFilters();
    confirm();
    updatePagination((exist) => ({
      ...exist,
      ...(dataIndex === "name" ? { name: undefined } : {}),
      ...(dataIndex === "slug" ? { slug: undefined } : {}),
      current: 1,
    }));
  };

  const getColumnSearchProps = (
    dataIndex: keyof Organization,
    searchPlaceholder?: string
  ): TableColumnType<Organization> => ({
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
        style={{ color: filtered ? "#1677ff" : undefined }}
      />
    ),
  });

  const columns: ColumnsType<Organization> = [
    {
      title: "展方名称",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      ...getColumnSearchProps("name", "请输入展方名称"),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      key: "status",
      render: (status) => OrganizationStatusLabel[status],
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag>{OrganizationTypeLabel[type] || "未配置"}</Tag>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      ...getColumnSearchProps("slug", "请输入展方 Slug"),
    },
    {
      title: "创立日期",
      key: "date",
      render: (_, record) => (
        <Space>
          {record.creationTime
            ? dayjs(record.creationTime).format("YYYY年MM月DD日")
            : "未配置"}
        </Space>
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            variant="light"
            color="green"
            aria-label="view"
            onClick={() => {
              window.open(`/dashboard/organization/${record.id}/edit`);
            }}
            leftSection={<IconEdit size={14} />}
          >
            编辑
          </Button>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light" aria-label="Settings">
                <IconMenu
                  style={{ width: "70%", height: "70%" }}
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
                    "_blank"
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
                    "_blank"
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
            ...exist,
            pageSize: pagination.pageSize || exist.pageSize,
            current: pagination.current || exist.current,
          }));
        }}
      />
    </>
  );
}
