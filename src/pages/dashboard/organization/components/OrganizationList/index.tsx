import { Button, Dropdown, Tooltip, Tag, App, Space } from "antd";
import { Input, type TableColumnType } from "antd";
import type { MenuProps } from "antd";
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
  const { message } = App.useApp();

  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      message.success("刷新页面缓存成功");
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
              icon={<IconSearch size={14} />}
              size="small"
              type="primary"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button
              onClick={() =>
                clearFilters && handleReset(clearFilters, confirm, dataIndex)
              }
              size="small"
            >
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
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'refresh',
            icon: <IconRefresh style={{ width: 14, height: 14 }} />,
            label: '刷新',
            onClick: () => {
              refreshPage(`/${record.slug}`);
            },
          },
          {
            key: 'view-international',
            icon: <IconLink style={{ width: 14, height: 14 }} />,
            label: (
              <Tooltip title="国际站没有缓存，修改后会立刻显示">
                <span>去国际站查看</span>
              </Tooltip>
            ),
            onClick: () => {
              window.open(
                `https://www.furryeventchina.com/${record.slug}`,
                "_blank"
              );
            },
          },
          {
            key: 'view-domestic',
            icon: <IconLink style={{ width: 14, height: 14 }} />,
            label: (
              <Tooltip title="国内站有缓存，修改后大概24小时生效，除非你手动刷新">
                <span>去国内站查看</span>
              </Tooltip>
            ),
            onClick: () => {
              window.open(
                `https://www.furrycons.cn/${record.slug}`,
                "_blank"
              );
            },
          },
          { type: 'divider' },
          {
            key: 'delete',
            icon: <IconTrash style={{ width: 14, height: 14 }} />,
            label: '删除',
            danger: true,
            disabled: true,
          },
        ];

        return (
          <Space size="middle">
            <Button
              type="primary"
              ghost
              onClick={() => {
                window.open(`/dashboard/organization/${record.id}/edit`);
              }}
              icon={<IconEdit size={14} />}
            >
              编辑
            </Button>

            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button icon={<IconMenu size={14} stroke={1.5} />} />
            </Dropdown>
          </Space>
        );
      },
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
