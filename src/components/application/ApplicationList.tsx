import type { EditApplicationApiBody } from "@/api/cms/application";
import type { InferZodType } from "@/types/common";
import type { List } from "@/types/request";
import ApplicationEditor from "@/components/application/ApplicationEditor";
import DefaultContainer from "@/components/layout/Container";
import {
  App,
  Button,
  Dropdown,
  Flex,
  MenuProps,
  Popover,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { IconCirclePlus, IconEdit, IconEye, IconMenu, IconTrash } from "@tabler/icons-react";
import { ColumnsType } from "antd/es/table";
import { Application } from "@/types/application";
import dayjs from "dayjs";
import { useRef, useState } from "react";

const { Title, Text } = Typography;

export default function ApplicationList({
  title,
  data,
  isPending,
  current,
  pageSize,
  onPageChange,
  onRefresh,
  onSave,
  onDeleteApplication,
}: {
  title: string;
  data?: List<Application>;
  isPending: boolean;
  current: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => unknown;
  onSave: (value: InferZodType<typeof EditApplicationApiBody>, id?: string) => Promise<unknown>;
  onDeleteApplication: (id: string) => Promise<unknown>;
}) {
  const editingApplication = useRef<Application>(null);
  const [opened, setOpened] = useState(false);
  const { message, modal } = App.useApp();

  const onDelete = (id: string) => {
    modal.confirm({
      title: "确认删除这个应用吗？",
      content: "删除后不可恢复，请谨慎操作。",
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await onDeleteApplication(id);
        message.success("删除应用成功");
        if (current > 1 && data?.records.length === 1) {
          onPageChange(current - 1);
        } else {
          onRefresh();
        }
      },
    });
  };

  const columns: ColumnsType<Application> = [
    {
      title: "应用名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "应用描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "访问令牌",
      dataIndex: "accessToken",
      key: "accessToken",
      width: 200,
      render: (_, record) => {
        return (
          <Text copyable={!!record.accessToken} ellipsis>
            {record.accessToken || "暂无可用令牌"}
          </Text>
        );
      },
    },
    {
      title: "权限",
      dataIndex: "permission",
      key: "permission",
      render: (_, record) => {
        return (
          <Popover
            content={
              <div>
                <Text>读取权限: {record.permission.read ? "是" : "否"}</Text>
                <br />
                <Text>修改权限: {record.permission.write ? "是" : "否"}</Text>
              </div>
            }
          >
            <IconEye size={16} style={{ cursor: "pointer" }} />
          </Popover>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "disabledAt",
      key: "disabledAt",
      render: (_, record) => {
        if (record.disabledAt) {
          return <Tag color="red">已禁用</Tag>;
        }
        return <Tag color="green">已启用</Tag>;
      },
    },
    {
      title: "创建日期",
      key: "createdAt",
      render: (_, record) => dayjs(record.createdAt).format("YYYY/MM/DD HH:mm:ss"),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "delete",
            icon: <IconTrash style={{ width: 14, height: 14 }} />,
            label: "删除",
            danger: true,
            onClick: () => {
              onDelete(record.id);
            },
          },
        ];

        return (
          <Space size="middle">
            <Button
              type="primary"
              ghost
              onClick={() => {
                editingApplication.current = record;
                setOpened(true);
              }}
              icon={<IconEdit size={14} />}
            >
              编辑
            </Button>

            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button icon={<IconMenu size={14} />} />
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
            {title}
          </Title>

          <Button
            type="primary"
            icon={<IconCirclePlus size={16} stroke={1.5} />}
            onClick={() => {
              editingApplication.current = null;
              setOpened(true);
            }}
          >
            添加应用
          </Button>
        </Flex>
      </DefaultContainer>

      <div className="shadow-sm mt-4 p-4 rounded-xl bg-white">
        <Table
          rowKey={(row) => row.id}
          columns={columns}
          loading={isPending}
          dataSource={data?.records || []}
          pagination={{
            current,
            pageSize,
            total: data?.total,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 个应用`,
            onChange: onPageChange,
          }}
          scroll={{ x: "max-content" }}
        />
      </div>

      <ApplicationEditor
        opened={opened}
        onClose={() => {
          setOpened(false);
          onRefresh();
        }}
        editingApplication={editingApplication.current}
        onSave={onSave}
      />
    </>
  );
}
