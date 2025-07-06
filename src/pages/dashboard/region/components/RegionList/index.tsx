import { ActionIcon, Badge, Button, Menu, rem } from "@mantine/core";
import { Space } from "antd";
import Table, { type ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { cleanPageCache } from "@/api/dashboard/cache";
import type { List } from "@/types/Request";
import { RegionTypeLabel, type Region } from "@/types/region";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconMenu, IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function RegionList({
  data,
  pagination,
  isPending,
  updatePagination,
  onEdit,
}: {
  data: List<Region>;
  pagination: { current: number; pageSize: number };
  isPending: boolean;
  updatePagination: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
    }>
  >;
  onEdit: (region: Region) => void;
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

  const columns: ColumnsType<Region> = [
    {
      title: "区域名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "区域代码",
      dataIndex: "code",
      key: "code",
      width: 150,
    },
    {
      title: "区域类型",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (_, record) => RegionTypeLabel[record.type],
    },
    {
      title: "父级区域",
      dataIndex: "parent",
      key: "parent",
      width: 150,
      render: (_, record) => record.parent?.name,
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
        pagination={{
          pageSize: pagination.pageSize,
          total: data?.total,
          current: pagination.current,
        }}
        onChange={(pagination) => {
          updatePagination((exist) => ({
            pageSize: pagination.pageSize || exist.pageSize,
            current: pagination.current || exist.current,
          }));
        }}
      />
    </>
  );
}
