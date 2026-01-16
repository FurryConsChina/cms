import { Button, Dropdown, Tag, App, Space } from "antd";
import type { MenuProps } from "antd";
import Table, { type ColumnsType } from "antd/es/table";

import { cleanPageCache } from "@/api/dashboard/cache";
import type { List } from "@/types/Request";
import {
  FeatureCategory,
  FeatureCategoryLabel,
  type FeatureType,
} from "@/types/feature";
import { IconEdit, IconMenu, IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function FeatureList({
  data,
  pagination,
  isPending,
  setPagination,
  onEdit,
}: {
  data: List<FeatureType>;
  pagination: { current: number; pageSize: number };
  isPending: boolean;
  setPagination: {
    current: (current: number) => void;
    pageSize: (pageSize: number) => void;
  }
  onEdit: (feature: FeatureType) => void;
}) {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      message.success("刷新页面缓存成功");
    },
  });

  const columns: ColumnsType<FeatureType> = [
    {
      title: "标签名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "类别",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (_, record) => (
        <Tag color="blue">
          {FeatureCategoryLabel[record.category as FeatureCategory]}
        </Tag>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 250,
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
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
                onEdit(record);
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
          if (pagination.current) {
            setPagination.current(pagination.current);
          }
          if (pagination.pageSize) {
            setPagination.pageSize(pagination.pageSize);
          }
        }}
      />
    </>
  );
}
