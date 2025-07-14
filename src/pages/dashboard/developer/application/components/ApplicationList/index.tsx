import {
  ActionIcon,
  Badge,
  Button,
  HoverCard,
  Menu,
  Text,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Input, Space, Table, type TableColumnType, Tag } from "antd";
import dayjs from "dayjs";

import { cleanPageCache } from "@/api/dashboard/cache";
import {
  EventScaleLabel,
  EventStatusColor,
  EventStatusLabel,
} from "@/consts/event";
import {
  IconEdit,
  IconEye,
  IconInfoCircle,
  IconLink,
  IconMenu,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

import type { List } from "@/types/Request";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { EventItem } from "@/types/event";
import { Application } from "@/types/application";

function ApplicationList({
  data,
  pagination,
  setPagination,
  isPending,
  onDelete,
}: {
  data: List<Application>;
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
  onDelete: (id: string) => void;
}) {
  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      notifications.show({
        title: "刷新成功",
        message: "刷新页面缓存成功",
      });
    },
  });

  const navigate = useNavigate();

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof EventItem
  ) => {
    console.log(selectedKeys);
    confirm();

    if (dataIndex === "name") {
      setPagination.search(selectedKeys[0]);
    } else if (dataIndex === "organization") {
      setPagination.orgSearch(selectedKeys[0]);
    }
    setPagination.current(1);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof EventItem
  ) => {
    clearFilters();
    confirm();

    if (dataIndex === "name") {
      setPagination.search(null);
    } else if (dataIndex === "organization") {
      setPagination.orgSearch(null);
    }
    setPagination.current(1);
  };

  const getColumnSearchProps = (
    dataIndex: keyof EventItem,
    searchPlaceholder?: string
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
        style={{ color: filtered ? "#1677ff" : undefined }}
      />
    ),
  });

  const columns: ColumnsType<Application> = [
    {
      title: "应用名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "应用描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "权限",
      dataIndex: "permission",
      key: "permission",
      render: (_, record) => {
        return (
          <HoverCard width={280} shadow="md">
            <HoverCard.Target>
              <IconEye size={16} />
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Text>读取: {record.permission.read ? "是" : "否"}</Text>
              <Text>写入: {record.permission.write ? "是" : "否"}</Text>
            </HoverCard.Dropdown>
          </HoverCard>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "disabledAt",
      key: "disabledAt",
      render: (_, record) => {
        if (record.disabledAt) {
          return <Tag color="red">已禁用</Tag>;
        }
        return <Tag color="green">已启用</Tag>;
      },
    },
    {
      title: "创建日期",
      key: "createdAt",
      render: (_, record) => (
        <Space>
          <Tag>{dayjs(record.createdAt).format("YYYY/MM/DD")}</Tag>
        </Space>
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            variant="light"
            color="green"
            onClick={() => {
              navigate(`/developer/application/${record.id}/edit`);
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
                />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>菜单</Menu.Label>
              <Menu.Label>危险</Menu.Label>
              <Menu.Item
                color="red"
                onClick={() => {
                  onDelete(record.id);
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

export default ApplicationList;
