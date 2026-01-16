import { Button, Dropdown, Popover, Typography, App, Space } from "antd";
import type { MenuProps } from "antd";
import { Input, Table, type TableColumnType, Tag } from "antd";
import dayjs from "dayjs";

import { cleanPageCache } from "@/api/dashboard/cache";
import { IconEdit, IconEye, IconMenu, IconSearch, IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

import type { List } from "@/types/Request";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { EventItem } from "@/types/event";
import { Application } from "@/types/application";

const { Text } = Typography;

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
  const { message } = App.useApp();
  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      message.success("刷新页面缓存成功");
    },
  });

  const navigate = useNavigate();

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof EventItem,
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
    dataIndex: keyof EventItem,
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
    searchPlaceholder?: string,
  ): TableColumnType<EventItem> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Space direction="vertical">
          <Input
            placeholder={searchPlaceholder}
            value={selectedKeys[0]}
            allowClear
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          />
          <Space>
            <Button
              onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
              icon={<IconSearch size={14} />}
              size="small"
              type="primary"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)} size="small">
              重置
            </Button>
            <Button
              size="small"
              type="text"
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
    filterIcon: (filtered: boolean) => <IconSearch size={14} style={{ color: filtered ? "#1677ff" : undefined }} />,
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
          <Popover
            content={
              <div>
                <Text>读取: {record.permission.read ? "是" : "否"}</Text>
                <br />
                <Text>写入: {record.permission.write ? "是" : "否"}</Text>
              </div>
            }
          >
            <IconEye size={16} style={{ cursor: "pointer" }} />
          </Popover>
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
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "delete",
            icon: <IconTrash style={{ width: 14, height: 14 }} />,
            label: "删除",
            danger: true,
            onClick: () => {
              onDelete(record.id);
            },
          },
        ];

        return (
          <Space size="middle">
            <Button
              type="primary"
              ghost
              onClick={() => {
                navigate(`/developer/application/${record.id}/edit`);
              }}
              icon={<IconEdit size={14} />}
            >
              编辑
            </Button>

            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button icon={<IconMenu size={14} />} />
            </Dropdown>
          </Space>
        );
      },
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
