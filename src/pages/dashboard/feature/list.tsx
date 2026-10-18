import { apiErrorMessage } from "@/utils/apiError";
import { FeatureAPI } from "@/api/cms/feature";
import DefaultContainer from "@/components/layout/Container";
import TableFilterDropdown from "@/components/common/TableFilterDropdown";
import FeatureEditor from "@/components/feature/FeatureEditor";
import FeatureEventsModal from "@/components/feature/FeatureEventsModal";
import { FeatureCategory, FeatureCategoryLabel, type Feature } from "@/types/feature";
import { IconCirclePlus, IconEdit, IconMenu, IconSearch, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { App, Button, Dropdown, Flex, MenuProps, Segmented, Space, Tag, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

const { Title } = Typography;

export default function FeaturePage() {
  const { message, modal } = App.useApp();
  const editingFeature = useRef<Feature>(null);

  const [opened, setOpened] = useState(false);
  const [viewingFeature, setViewingFeature] = useState<Feature | null>(null);

  const [currentPage, setCurrentPage] = useQueryState("currentPage", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(20));
  const [isPublic, setIsPublic] = useQueryState("isPublic", parseAsBoolean.withDefault(true));
  const [name, setName] = useState("");
  const [category, setCategory] = useState<FeatureCategory>();

  const pagination = {
    current: currentPage,
    pageSize,
  };

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ["feature-list", pagination, name, category, isPublic],
    queryFn: () =>
      FeatureAPI.getFeatureList({
        ...pagination,
        name: name || undefined,
        category,
        isPublic,
      }),
  });

  const columns: ColumnsType<Feature> = [
    {
      title: "标签名称",
      dataIndex: "name",
      key: "name",
      filteredValue: name ? [name] : null,
      filterDropdown: (props) => (
        <TableFilterDropdown {...props} placeholder="搜索标签名称" confirmText="搜索" />
      ),
      filterIcon: () => <IconSearch size={14} />,
    },
    {
      title: "类别",
      dataIndex: "category",
      key: "category",
      filters: Object.values(FeatureCategory).map((item) => ({
        value: item,
        text: FeatureCategoryLabel[item],
      })),
      filterMultiple: false,
      filteredValue: category ? [category] : null,
      render: (_, record) => (
        <Tag color="blue">{FeatureCategoryLabel[record.category as FeatureCategory]}</Tag>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "引用活动",
      key: "events",
      render: (_, record) => {
        const eventCount = record.eventCount ?? 0;
        if (eventCount === 0) return "—";

        return (
          <Button aria-haspopup="dialog" onClick={() => setViewingFeature(record)}>
            {eventCount} 个活动
          </Button>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        if (!isPublic) return "—";

        const menuItems: MenuProps["items"] = [
          { type: "divider" },
          {
            key: "delete",
            icon: <IconTrash style={{ width: 14, height: 14 }} />,
            label: "删除",
            danger: true,
            onClick: () =>
              modal.confirm({
                title: `确认删除“${record.name}”？`,
                content: "相关引用可能阻止删除。",
                onOk: async () => {
                  try {
                    await FeatureAPI.deleteFeature(record.id);
                    message.success("删除成功");
                    await refetch();
                  } catch (error) {
                    message.error(apiErrorMessage(error));
                    throw error;
                  }
                },
              }),
          },
        ];

        return (
          <Space size="middle">
            <Button
              type="primary"
              ghost
              onClick={() => {
                editingFeature.current = record;
                setOpened(true);
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
            标签列表
          </Title>

          {isPublic && (
            <Button
              type="primary"
              icon={<IconCirclePlus size={16} stroke={1.5} />}
              onClick={() => {
                editingFeature.current = null;
                setOpened(true);
              }}
            >
              添加标签
            </Button>
          )}
        </Flex>
      </DefaultContainer>

      <div className="shadow-sm mt-4 p-4 rounded-xl bg-white">
        <Table
          title={() => (
            <Segmented
              value={isPublic ? "public" : "private"}
              onChange={(value) => {
                void setIsPublic(value === "public");
                void setCurrentPage(1);
              }}
              options={[
                { value: "public", label: "公共标签" },
                { value: "private", label: "私有标签" },
              ]}
            />
          )}
          rowKey={(row) => row.id}
          columns={columns}
          loading={isPending}
          dataSource={data?.records || []}
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: pagination.pageSize,
            total: data?.total,
            current: pagination.current,
          }}
          onChange={(tablePagination, values, _sorter, extra) => {
            setName((values.name?.[0] as string | undefined)?.trim() ?? "");
            setCategory(values.category?.[0] as FeatureCategory | undefined);
            void setCurrentPage(
              extra.action === "paginate" && tablePagination.pageSize === pageSize
                ? (tablePagination.current ?? 1)
                : 1,
            );
            void setPageSize(tablePagination.pageSize ?? pageSize);
          }}
        />
      </div>

      {viewingFeature && (
        <FeatureEventsModal feature={viewingFeature} onClose={() => setViewingFeature(null)} />
      )}

      <FeatureEditor
        opened={opened}
        onClose={() => {
          setOpened(false);
          void refetch();
        }}
        editingFeature={editingFeature.current}
      />
    </>
  );
}
