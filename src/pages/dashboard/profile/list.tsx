import { Avatar, Button, Space, Tag, Alert, App, Flex, Table, Typography } from "antd";
import { useLocation, useNavigate } from "react-router";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import useSWR from "swr";
import { type ColumnsType } from "antd/es/table";
import { apiErrorMessage } from "@/utils/apiError";
import { ProfileAPI } from "@/api/cms/profile";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
import { imageUrl } from "@/utils/imageLoader";
import type { Profile } from "@/types/profile";
import type { List } from "@/types/request";
import DefaultContainer from "@/components/layout/Container";
import { IconCirclePlus, IconRefresh, IconSearch } from "@tabler/icons-react";
import TableFilterDropdown from "@/components/common/TableFilterDropdown";

const kindLabels = { individual: "个人", group: "团体", brand: "品牌", media: "媒体" };
const statusLabels = { active: "活跃", inactive: "停用" };

export default function ProfilePage() {
  const { user } = useAuthStore();
  const platform = isPlatform(user?.role);
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      kind: parseAsStringLiteral(["individual", "group", "brand", "media"]),
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(20),
    },
    { shallow: false },
  );
  const search = filters.search.trim();
  const kind = filters.kind ?? undefined;
  const current = filters.current > 0 ? filters.current : 1;
  const pageSize = filters.pageSize > 0 ? filters.pageSize : 20;
  const { message, modal } = App.useApp();
  const { data, error, isLoading, mutate } = useSWR<List<Profile>, Error>(
    ["profiles", search, kind, current, pageSize],
    () => ProfileAPI.list({ current, pageSize, name: search || undefined, kind }),
  );
  const records = data?.records ?? [];
  const columns: ColumnsType<Profile> = [
    {
      title: "名称",
      key: "name",
      filteredValue: search ? [search] : null,
      filterDropdown: (props) => (
        <TableFilterDropdown {...props} placeholder="搜索名称" confirmText="搜索" />
      ),
      filterIcon: (filtered) => (
        <IconSearch size={14} style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      render: (_, v) => (
        <Space>
          <Avatar src={v.avatarUrl ? imageUrl(v.avatarUrl) : undefined}>
            {v.name.slice(0, 1)}
          </Avatar>
          {v.name}
        </Space>
      ),
    },
    { title: "标识", dataIndex: "slug" },
    {
      title: "类型",
      key: "kind",
      filters: Object.entries(kindLabels).map(([value, text]) => ({ value, text })),
      filterMultiple: false,
      filteredValue: kind ? [kind] : null,
      render: (_, v) => kindLabels[v.kind],
    },
    {
      title: "状态",
      render: (_, v) => (
        <Tag color={v.status === "active" ? "green" : "default"}>{statusLabels[v.status]}</Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button
            onClick={() => navigate(`/dashboard/profile/${record.id}/edit${location.search}`)}
          >
            编辑
          </Button>
          <Button onClick={() => navigate(`/dashboard/profile/${record.id}/access`)}>成员</Button>
          {platform && (
            <Button
              danger
              onClick={() =>
                modal.confirm({
                  title: "确认删除这条记录？",
                  content: "删除后将不再展示。如果其他内容引用了这条记录，删除会失败。",
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await ProfileAPI.delete(record.id);
                      message.success("已删除");
                      await mutate();
                    } catch (error) {
                      message.error(apiErrorMessage(error));
                      throw error;
                    }
                  },
                })
              }
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DefaultContainer className="sticky top-0 z-20">
        <Flex justify="space-between" align="center" wrap gap={12}>
          <Typography.Title level={3} className="m-0">
            主体资料
          </Typography.Title>
          <Space wrap>
            <Button icon={<IconRefresh size={16} stroke={1.5} />} onClick={() => mutate()}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<IconCirclePlus size={16} stroke={1.5} />}
              onClick={() => navigate(`/dashboard/profile/create${location.search}`)}
            >
              新建主体资料
            </Button>
          </Space>
        </Flex>
      </DefaultContainer>
      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action=<Button onClick={() => mutate()}>重试</Button>
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading}
        scroll={{ x: "max-content" }}
        onChange={(_pagination, values, _sorter, extra) => {
          if (extra.action !== "filter") return;
          setFilters({
            search: (values.name?.[0] as string | undefined)?.trim() ?? "",
            kind: (values.kind?.[0] as Profile["kind"] | undefined) ?? null,
            current: 1,
          });
        }}
        pagination={{
          current,
          pageSize,
          total: data?.total,
          showSizeChanger: true,
          onChange: (page, size) => {
            setFilters({ current: page, pageSize: size });
          },
        }}
      />
    </div>
  );
}
