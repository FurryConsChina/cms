import { FeatureAPI } from "@/api/dashboard/feature";
import DefaultContainer from "@/components/Layout/Container";
import FeatureEditor from "@/components/EventFeature/FeatureEditor";
import { FeatureCategory, FeatureCategoryLabel, type Feature } from "@/types/feature";
import { IconCirclePlus, IconEdit, IconMenu, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Dropdown, Flex, MenuProps, Space, Tag, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { parseAsInteger, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function FeaturePage() {
  const navigate = useNavigate();
  const editingFeature = useRef<Feature>(null);

  const [opened, setOpened] = useState(false);

  const [currentPage, setCurrentPage] = useQueryState("currentPage", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(20));
  const setPagination = {
    current: setCurrentPage,
    pageSize: setPageSize,
  };

  const pagination = {
    current: currentPage,
    pageSize,
  };

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ["feature-list", pagination],
    queryFn: () => FeatureAPI.getFeatureList(pagination),
  });

  const columns: ColumnsType<Feature> = [
    {
      title: "标签名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "类别",
      dataIndex: "category",
      key: "category",
      render: (_, record) => <Tag color="blue">{FeatureCategoryLabel[record.category as FeatureCategory]}</Tag>,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
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
            disabled: true,
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
        </Flex>
      </DefaultContainer>

      <div className="shadow-sm mt-4 p-4 rounded-xl bg-white">
        <Table
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
          onChange={(pagination) => {
            if (pagination.current) {
              setPagination.current(pagination.current);
            }
            if (pagination.pageSize) {
              setPagination.pageSize(pagination.pageSize);
            }
          }}
        />
      </div>

      <FeatureEditor opened={opened} onClose={() => setOpened(false)} editingFeature={editingFeature.current} />
    </>
  );
}
