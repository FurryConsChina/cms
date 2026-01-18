import { cleanPageCache } from "@/api/dashboard/cache";
import { EventAPI } from "@/api/dashboard/event";
import DefaultContainer from "@/components/Layout/Container";
import { EventScaleLabel, EventStatusColor, EventStatusLabel } from "@/consts/event";
import { EventItem } from "@/types/event";
import { IconCirclePlus, IconEdit, IconLink, IconMenu, IconRefresh, IconSearch, IconTrash } from "@tabler/icons-react";
import {
  App,
  Button,
  Dropdown,
  Flex,
  Input,
  MenuProps,
  Space,
  Table,
  TableColumnType,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ColumnsType, FilterDropdownProps } from "antd/es/table/interface";
import dayjs from "dayjs";
import { parseAsInteger, useQueryState } from "nuqs";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

const { Title } = Typography;

export default function EventPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [search, setSearch] = useQueryState("search");
  const [orgSearch, setOrgSearch] = useQueryState("orgSearch");
  const [currentPage, setCurrentPage] = useQueryState("currentPage", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(20));

  const { data, isLoading, mutate } = useSWR(["event-list", currentPage, pageSize, search, orgSearch], () =>
    EventAPI.getEventList({
      pageSize: pageSize,
      current: currentPage,
      search: search || undefined,
      orgSearch: orgSearch || undefined,
    }),
  );

  const handleDeleteEvent = async (id: string) => {
    try {
      await EventAPI.deleteEvent(id);
      message.success("删除展商成功，如果是误操作请马上联系管理员。");
      mutate();
    } catch (error) {
      message.error("删除展商失败，请稍后重试。");
    }
  };

  const handleRefreshPage = async (slug: string) => {
    await cleanPageCache(`${slug}`);
    message.success("刷新页面缓存成功");
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof EventItem,
  ) => {
    console.log(selectedKeys);
    confirm();

    if (dataIndex === "name") {
      setSearch(selectedKeys[0]);
    } else if (dataIndex === "organization") {
      setOrgSearch(selectedKeys[0]);
    }
    setCurrentPage(1);
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps["confirm"],
    dataIndex: keyof EventItem,
  ) => {
    clearFilters();
    confirm();

    if (dataIndex === "name") {
      setSearch(null);
    } else if (dataIndex === "organization") {
      setOrgSearch(null);
    }
    setCurrentPage(1);
  };

  const getColumnSearchProps = (
    dataIndex: keyof EventItem,
    searchPlaceholder?: string,
  ): TableColumnType<EventItem> => ({
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

  const columns: ColumnsType<EventItem> = [
    {
      title: "展商",
      dataIndex: ["organization", "name"],
      key: "organizationName",
      ...getColumnSearchProps("organization", "请输入展商名称"),
    },
    {
      title: "展会名称",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name", "请输入展会名称"),
    },
    {
      title: "日期",
      key: "date",
      render: (_, record) => (
        <Space>
          <Tag>
            {dayjs(record.startAt).format("YYYY/MM/DD")}-{dayjs(record.endAt).format("MM/DD")}
          </Tag>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tooltip title={EventStatusLabel[status]}>
          <Tag color={EventStatusColor[status]}>{EventStatusLabel[status]}</Tag>
        </Tooltip>
      ),
    },
    {
      title: "规模",
      dataIndex: "scale",
      key: "scale",
      render: (scale) => EventScaleLabel[scale],
    },
    {
      title: "城市",
      dataIndex: ["region", "name"],
      key: "city",
    },

    {
      title: "地址",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "refresh",
            icon: <IconRefresh style={{ width: 14, height: 14 }} />,
            label: "刷新",
            onClick: () => {
              handleRefreshPage(`/${record.organization.slug}/${record.slug}`);
            },
          },
          {
            key: "view",
            icon: <IconLink style={{ width: 14, height: 14 }} />,
            label: "在网站上查看",
            onClick: () => {
              window.open(`https://www.furrycons.cn/${record.organization.slug}/${record.slug}`, "_blank");
            },
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <IconTrash style={{ width: 14, height: 14 }} />,
            label: "删除",
            danger: true,
            onClick: () => {
              handleDeleteEvent(record.id);
            },
          },
        ];

        return (
          <Space size="middle">
            <Button
              type="primary"
              ghost
              onClick={() => {
                window.open(`/dashboard/event/${record.id}/edit`);
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

  return (
    <>
      <DefaultContainer className="sticky top-0 z-20">
        <Flex justify="space-between" align="center">
          <Title level={3} className="m-0">
            展会列表
          </Title>

          <Button
            type="primary"
            icon={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              navigate("/dashboard/event/create");
            }}
          >
            添加展会
          </Button>
        </Flex>
      </DefaultContainer>

      <div className="shadow-sm mt-4 p-4 rounded-xl bg-white">
        <Table
          rowKey={(row) => row.id}
          columns={columns}
          loading={isLoading}
          dataSource={data?.records || []}
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: pageSize,
            total: data?.total,
            current: currentPage,
          }}
          onChange={(tablePagination) => {
            if (tablePagination.current) {
              setCurrentPage(tablePagination.current);
            }
            if (tablePagination.pageSize) {
              setPageSize(tablePagination.pageSize);
            }
          }}
        />
      </div>
    </>
  );
}
