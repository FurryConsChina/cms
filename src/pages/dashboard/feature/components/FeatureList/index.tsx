import { ActionIcon, Badge, Button, Menu, rem } from "@mantine/core";
import { Space } from "antd";
import Table, { type ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { cleanPageCache } from "@/api/dashboard/cache";
import type { List } from "@/types/Request";
import {
  FeatureCategory,
  FeatureCategoryLabel,
  type FeatureType,
} from "@/types/feature";
import { notifications } from "@mantine/notifications";
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

  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      notifications.show({
        title: "刷新成功",
        message: "刷新页面缓存成功",
      });
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
        <Badge color="blue">
          {FeatureCategoryLabel[record.category as FeatureCategory]}
        </Badge>
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
      render: (_, record) => (
        <Space size="middle">
          <Button
            variant="light"
            color="green"
            aria-label="view"
            onClick={() => {
              onEdit(record);
            }}
            leftSection={<IconEdit size={14} />}
          >
            编辑
          </Button>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light" aria-label="Settings">
                <IconMenu
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>菜单</Menu.Label>

              <Menu.Divider />

              <Menu.Label>危险</Menu.Label>
              <Menu.Item
                disabled
                color="red"
                leftSection={
                  <IconTrash style={{ width: rem(14), height: rem(14) }} />
                }
              >
                删除
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Space>
      ),
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
