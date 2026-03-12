import { ApplicationApi } from "@/api/developer/application";
import ApplicationEditor from "@/components/Application/ApplicationEditor";
import DefaultContainer from "@/components/Layout/Container";
import { App, Button, Dropdown, Flex, MenuProps, Popover, Space, Table, Tag, Typography } from "antd";
import { IconCirclePlus, IconEdit, IconEye, IconMenu, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { ColumnsType } from "antd/es/table";
import { Application } from "@/types/application";
import dayjs from "dayjs";
import { useRef, useState } from "react";

const { Title, Text } = Typography;

export default function ApplicationPage() {
  const editingApplication = useRef<Application>(null);
  const [opened, setOpened] = useState(false);
  const { message, modal } = App.useApp();

  const [search, setSearch] = useQueryState("search");
  const [orgSearch, setOrgSearch] = useQueryState("orgSearch");
  const [currentPage, setCurrentPage] = useQueryState("currentPage", parseAsInteger.withDefault(1));

  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(20));

  const pagination = {
    search,
    orgSearch,
    current: currentPage,
    pageSize,
  };

  const setPagination = {
    search: setSearch,
    orgSearch: setOrgSearch,
    current: setCurrentPage,
    pageSize: setPageSize,
  };

  const { isPending, data, refetch } = useQuery({
    queryKey: ["application-list", pagination],
    queryFn: () =>
      ApplicationApi.getApplicationList({
        pageSize: pagination.pageSize,
        current: pagination.current,
        search: pagination.search || undefined,
        orgSearch: pagination.orgSearch || undefined,
      }),
  });

  const onDelete = (id: string) => {
    modal.confirm({
      title: "确认删除这个应用吗？",
      content: "删除后不可恢复，请谨慎操作。",
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await ApplicationApi.deleteApplication(id);
        message.success("删除应用成功");
        refetch();
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
        return <Text copyable ellipsis>{record.accessToken}</Text>;
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
            disabled: true,
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
            应用列表
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
            pageSize: pagination.pageSize,
            total: data?.total,
            current: pagination.current,
          }}
          scroll={{ x: "max-content" }}
          onChange={(tablePagination) => {
            if (tablePagination.current) {
              setPagination.current(tablePagination.current);
            }
            if (tablePagination.pageSize) {
              setPagination.pageSize(tablePagination.pageSize);
            }
          }}
        />
      </div>

      <ApplicationEditor
        opened={opened}
        onClose={() => {
          setOpened(false);
          refetch();
        }}
        editingApplication={editingApplication.current}
      />
    </>
  );
}
