import { RegionAPI, type RegionListQuery } from "@/api/cms/region";
import { useState } from "react";
import { Alert, App, Space, Table, Button, Flex, Typography } from "antd";
import useSWR from "swr";
import { type ColumnsType } from "antd/es/table";
import { apiErrorMessage } from "@/utils/apiError";
import { type Region, RegionType, RegionTypeLabel } from "@/types/region";
import DefaultContainer from "@/components/Layout/Container";
import RegionEditor from "@/components/Region/RegionEditor";
import TableFilterDropdown from "@/components/Cms/TableFilterDropdown";

import { IconCirclePlus, IconSearch } from "@tabler/icons-react";

export default function RegionPage() {
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Omit<RegionListQuery, "current" | "pageSize">>({});
  const { data, error, isLoading, mutate } = useSWR(
    ["region-list", current, pageSize, filters],
    () => RegionAPI.getRegionList({ current, pageSize, ...filters }),
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Region>();
  const [openingId, setOpeningId] = useState<string>();
  const open = async (record?: Region) => {
    try {
      setOpeningId(record?.id);
      setEditing(record ? await RegionAPI.getRegion(record.id) : undefined);
      setOpened(true);
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setOpeningId(undefined);
    }
  };
  const records = data?.records ?? [];
  const columns: ColumnsType<Region> = [
    {
      title: "地区名称",
      dataIndex: "name",
      key: "name",
      filteredValue: filters.name ? [filters.name] : null,
      filterDropdown: (props) => <TableFilterDropdown {...props} placeholder="搜索地区名称" />,
      filterIcon: () => <IconSearch size={14} />,
    },
    {
      title: "地区 Slug",
      dataIndex: "slug",
      key: "code",
      filteredValue: filters.code ? [filters.code] : null,
      filterDropdown: (props) => <TableFilterDropdown {...props} placeholder="搜索地区 Slug" />,
      filterIcon: () => <IconSearch size={14} />,
    },
    {
      title: "地区类型",
      key: "kind",
      render: (_, record) => RegionTypeLabel[record.kind],
      filters: Object.entries(RegionTypeLabel).map(([value, text]) => ({ value, text })),
      filterMultiple: false,
      filteredValue: filters.kind ? [filters.kind] : null,
    },
    {
      title: "父级地区",
      key: "parentId",
      render: (_, record) => record.parent?.name,
      filteredValue: filters.parentId ? [filters.parentId] : null,
      filterDropdown: (props) => (
        <TableFilterDropdown {...props} region placeholder="选择父级地区（仅直接子级）" />
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button loading={openingId === record.id} onClick={() => void open(record)}>
            编辑
          </Button>

          <Button
            danger
            onClick={() =>
              modal.confirm({
                title: "确认删除这条记录？",
                content: "删除后将不再展示。如果其他内容引用了这条记录，删除会失败。",
                okButtonProps: { danger: true },
                onOk: async () => {
                  try {
                    await RegionAPI.deleteRegion(record.id);
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
        </Space>
      ),
    },
  ];
  return (
    <div className="space-y-4">
      <DefaultContainer className="sticky top-0 z-20">
        <Flex className="md:flex-row flex-col gap-2" justify="space-between" align="center">
          <Typography.Title level={3} className="m-0">
            地区列表
          </Typography.Title>
          <Button
            type="primary"
            icon=<IconCirclePlus size={16} stroke={1.5} />
            onClick={() => void open()}
          >
            添加地区
          </Button>
        </Flex>
      </DefaultContainer>

      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action=<Button onClick={() => void mutate()}>重试</Button>
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading}
        scroll={{ x: "max-content" }}
        onChange={(pagination, values, _sorter, extra) => {
          setFilters({
            name: (values.name?.[0] as string | undefined)?.trim() || undefined,
            code: (values.code?.[0] as string | undefined)?.trim() || undefined,
            kind: values.kind?.[0] as RegionType | undefined,
            parentId: values.parentId?.[0] as string | undefined,
          });
          setCurrent(
            extra.action === "paginate" && pagination.pageSize === pageSize
              ? (pagination.current ?? 1)
              : 1,
          );
          setPageSize(pagination.pageSize ?? pageSize);
        }}
        pagination={{
          current,
          pageSize,
          total: data?.total,
          showSizeChanger: true,
        }}
      />
      {opened && (
        <RegionEditor
          region={editing}
          onCancel={() => setOpened(false)}
          onSaved={() => {
            setOpened(false);
            void mutate();
          }}
        />
      )}
    </div>
  );
}
