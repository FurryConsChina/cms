import { apiErrorMessage } from "@/utils/apiError";
import { Button, Flex, Typography, Space, App, Table, MenuProps, Dropdown } from "antd";
import DefaultContainer from "@/components/Layout/Container";
import { IconCirclePlus, IconEdit, IconMenu, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { RegionAPI } from "@/api/dashboard/region";
import { RegionTypeLabel, type Region } from "@/types/region";
import { ColumnsType } from "antd/es/table";
import { parseAsInteger, useQueryState } from "nuqs";
import useSWR from "swr";

const { Title, Text } = Typography;

export default function RegionPage() {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();

  const [current, setCurrent] = useQueryState("current", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(20));

  const { isLoading, data, mutate } = useSWR(["region-list", current, pageSize], () =>
    RegionAPI.getRegionList({ current, pageSize }),
  );

  const columns: ColumnsType<Region> = [
    {
      title: "地区名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "地区 Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "地区类型",
      dataIndex: "kind",
      key: "kind",
      render: (_, record) => RegionTypeLabel[record.kind],
    },
    {
      title: "排序顺序",
      dataIndex: "displayOrder",
      key: "displayOrder",
    },
    {
      title: "父级地区",
      dataIndex: "parent",
      key: "parent",
      render: (_, record) => record.parent?.name,
    },

    {
      title: "操作",
      key: "action",
      render: (_, record) => {
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
                    await RegionAPI.deleteRegion(record.id);
                    message.success("删除成功");
                    await mutate();
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
                navigate(`/dashboard/region/${record.id}/edit`);
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
        <Flex className="md:flex-row flex-col gap-2" justify="space-between" align="center">
          <Title level={3} className="m-0">
            地区列表
          </Title>

          <Space>
            <Button
              type="primary"
              icon={<IconCirclePlus size={16} stroke={1.5} />}
              onClick={() => navigate("/dashboard/region/create")}
            >
              添加地区
            </Button>
          </Space>
        </Flex>
      </DefaultContainer>

      <div className="shadow-sm mt-4 p-4 rounded-xl bg-white">
        <Table
          rowKey={(row) => row.id}
          columns={columns}
          loading={isLoading}
          dataSource={data?.records || []}
          pagination={{
            pageSize: pageSize,
            total: data?.total,
            current: current,
          }}
          scroll={{ x: "max-content" }}
          onChange={(pagination) => {
            setPageSize(pagination.pageSize || pageSize);
            setCurrent(pagination.current || current);
          }}
        />
      </div>
    </>
  );
}
