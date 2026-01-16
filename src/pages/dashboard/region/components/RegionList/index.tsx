import { Button, Dropdown, App, Space } from "antd";
import type { MenuProps } from "antd";
import Table, { type ColumnsType } from "antd/es/table";

import { cleanPageCache } from "@/api/dashboard/cache";
import type { List } from "@/types/Request";
import { RegionTypeLabel, type Region } from "@/types/region";
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
  const { message } = App.useApp();

  const { mutate: refreshPage } = useMutation({
    mutationFn: cleanPageCache,
    onSuccess: () => {
      message.success("刷新页面缓存成功");
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
                onEdit(record);
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
