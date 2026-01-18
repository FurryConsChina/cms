import { cleanPageCache } from "@/api/dashboard/cache";
import { OrganizationAPI } from "@/api/dashboard/organization";
import DefaultContainer from "@/components/Layout/Container";
import { Organization, OrganizationStatusLabel, OrganizationTypeLabel } from "@/types/organization";
import { IconCirclePlus, IconEdit, IconLink, IconMenu, IconRefresh, IconSearch, IconTrash } from "@tabler/icons-react";
import { App, Button, Dropdown, Flex, Input, MenuProps, Space, Table, TableColumnType, Tag, Typography } from "antd";
import { ColumnsType, FilterDropdownProps } from "antd/es/table/interface";
import dayjs from "dayjs";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

const { Title } = Typography;

export default function OrganizationPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [currentPage, setCurrentPage] = useQueryState("currentPage", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(20));

  const [filter, setFilter] = useState<{
    name?: string;
    slug?: string;
  }>({});

  const { data, isLoading } = useSWR(["organization/list", filter, currentPage, pageSize], () =>
    OrganizationAPI.getOrganizationList({
      pageSize: pageSize,
      current: currentPage,
      name: filter.name,
      slug: filter.slug,
    })
  );

  const handleRefreshPage = async (slug: string) => {
    await cleanPageCache(slug);
    message.success("刷新页面缓存成功");
  };

  const getColumnSearchProps = (
    dataIndex: keyof Organization,
    searchPlaceholder?: string
  ): TableColumnType<Organization> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Space orientation="vertical">
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
        <Space>{record.creationTime ? dayjs(record.creationTime).format("YYYY年MM月DD日") : "未配置"}</Space>
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 250,
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "refresh",
            icon: <IconRefresh style={{ width: 14, height: 14 }} />,
            label: "刷新",
            onClick: () => {
              handleRefreshPage(record.slug);
            },
          },
          {
            key: "view-domestic",
            icon: <IconLink style={{ width: 14, height: 14 }} />,
            label: "在网站上查看",
            onClick: () => {
              window.open(`https://www.furrycons.cn/${record.slug}`, "_blank");
            },
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <IconTrash style={{ width: 14, height: 14 }} />,
            label: "删除",
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

            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button icon={<IconMenu size={14} stroke={1.5} />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof Organization
  ) => {
    confirm();
    setFilter((exist) => ({
      ...exist,
      ...(dataIndex === "name" ? { name: selectedKeys[0] } : {}),
      ...(dataIndex === "slug" ? { slug: selectedKeys[0] } : {}),
    }));
    setCurrentPage(1);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof Organization
  ) => {
    clearFilters();
    confirm();
    setFilter((exist) => ({
      ...exist,
      ...(dataIndex === "name" ? { name: undefined } : {}),
      ...(dataIndex === "slug" ? { slug: undefined } : {}),
      current: 1,
    }));
  };

  return (
    <>
      <DefaultContainer className="sticky top-0 z-20">
        <Flex justify="space-between" align="center">
          <Title level={3} className="m-0">
            展商列表
          </Title>

          <Button
            type="primary"
            icon={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              navigate("/dashboard/organization/create");
            }}
          >
            添加展商
          </Button>
        </Flex>
      </DefaultContainer>

      <div className="shadow mt-4 p-4 rounded-xl bg-white">
        <Table
          rowKey={(row) => row.id}
          columns={columns}
          loading={isLoading}
          dataSource={data?.records || []}
          scroll={{
            x: "max-content",
          }}
          pagination={{
            pageSize: pageSize,
            total: data?.total,
            current: currentPage,
          }}
          onChange={(pagination) => {
            setPageSize(pagination.pageSize || pageSize);
            setCurrentPage(pagination.current || currentPage);
          }}
        />
      </div>
    </>
  );
}
