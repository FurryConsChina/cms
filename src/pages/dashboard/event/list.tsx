import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
import { cleanPageCache } from "@/api/cms/cache";
import { EventAPI } from "@/api/cms/event";
import DefaultContainer from "@/components/Layout/Container";
import { EventScaleLabel, EventStatusColor, EventStatusLabel } from "@/consts/event";
import { EventItem } from "@/types/event";
import {
  IconCirclePlus,
  IconEdit,
  IconLink,
  IconMenu,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import {
  Alert,
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
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useNavigate } from "react-router-dom";
import { useEventsList } from "@/hooks/api/event/useEventsList";
import { apiErrorMessage } from "@/utils/apiError";

const { Title } = Typography;

type SearchField = "search" | "orgSearch" | "regionName" | "placeName" | "placeAddress";

export default function EventPage() {
  const navigate = useNavigate();
  const platform = isPlatform(useAuthStore((state) => state.user?.role));
  const { message, modal } = App.useApp();

  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    orgSearch: parseAsString,
    regionName: parseAsString,
    placeName: parseAsString,
    placeAddress: parseAsString,
    currentPage: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(20),
  });
  const { currentPage, pageSize } = filters;

  const { data, error, isLoading, mutate } = useEventsList({
    pageSize,
    current: currentPage,
    search: filters.search?.trim() || undefined,
    orgSearch: filters.orgSearch?.trim() || undefined,
    regionName: filters.regionName?.trim() || undefined,
    placeName: filters.placeName?.trim() || undefined,
    placeAddress: filters.placeAddress?.trim() || undefined,
  });

  const handleDeleteEvent = async (id: string) => {
    try {
      await EventAPI.deleteEvent(id);
      message.success("删除活动成功，如果是误操作请马上联系管理员。");
      mutate();
    } catch (error) {
      message.error("删除活动失败，请稍后重试。");
    }
  };

  const handleRefreshPage = async (slug: string) => {
    await cleanPageCache(`${slug}`);
    message.success("刷新页面缓存成功");
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    field: SearchField,
  ) => {
    void setFilters({ [field]: selectedKeys[0]?.trim() || null, currentPage: 1 });
    confirm();
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps["confirm"],
    field: SearchField,
  ) => {
    void setFilters({ [field]: null, currentPage: 1 });
    clearFilters();
    confirm();
  };

  const getColumnSearchProps = (
    field: SearchField,
    searchPlaceholder?: string,
  ): TableColumnType<EventItem> => ({
    filteredValue: filters[field] ? [filters[field]] : null,
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Space orientation="vertical">
          <Input
            placeholder={searchPlaceholder}
            value={selectedKeys[0]}
            allowClear
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys as string[], confirm, field)}
          />
          <Space>
            <Button
              onClick={() => handleSearch(selectedKeys as string[], confirm, field)}
              icon={<IconSearch size={14} />}
              size="small"
              type="primary"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button
              onClick={() => clearFilters && handleReset(clearFilters, confirm, field)}
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
      <IconSearch size={14} style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
  });

  const columns: ColumnsType<EventItem> = [
    {
      title: "展商",
      dataIndex: ["organization", "name"],
      key: "organizationName",
      ...getColumnSearchProps("orgSearch", "请输入展商名称"),
    },
    {
      title: "展会名称",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("search", "请输入展会名称"),
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
      title: "地区",
      dataIndex: ["region", "name"],
      key: "city",
      ...getColumnSearchProps("regionName", "请输入地区名称（含下级地区）"),
    },
    {
      title: "地点",
      dataIndex: ["place", "name"],
      key: "place",
      ...getColumnSearchProps("placeName", "请输入地点名称"),
    },
    {
      title: "地址",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("placeAddress", "请输入地点地址"),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "refresh",
            disabled: !platform,
            icon: <IconRefresh style={{ width: 14, height: 14 }} />,
            label: "刷新",
            onClick: () => {
              handleRefreshPage(`/event/${record.eventKey}`);
            },
          },
          {
            key: "view",
            icon: <IconLink style={{ width: 14, height: 14 }} />,
            label: "在网站上查看",
            onClick: () => {
              window.open(`https://www.furrycons.cn/event/${record.eventKey}`, "_blank");
            },
          },
          { type: "divider" },
          {
            key: "delete",
            disabled: !platform,
            icon: <IconTrash style={{ width: 14, height: 14 }} />,
            label: "删除",
            danger: true,
            onClick: () => {
              modal.confirm({
                title: `确认删除活动“${record.name}”？`,
                onOk: () => handleDeleteEvent(record.id),
              });
            },
          },
        ];

        return (
          <Space size="middle" wrap>
            {/* 暂不开放，后续恢复。
            <Button onClick={() => navigate(`/dashboard/event/${record.id}/manage`)}>参加者与票档</Button>
            */}
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
        {error && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            title={apiErrorMessage(error)}
            action={<Button onClick={() => void mutate()}>重试</Button>}
          />
        )}
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
          onChange={(pagination, _filters, _sorter, extra) => {
            if (extra.action !== "paginate") return;
            void setFilters({
              currentPage: pagination.pageSize !== pageSize ? 1 : (pagination.current ?? 1),
              pageSize: pagination.pageSize ?? pageSize,
            });
          }}
        />
      </div>
    </>
  );
}
