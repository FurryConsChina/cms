import { Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { useState } from "react";
import { IconEdit } from "@tabler/icons-react";
import OrganizationEditor from "@/components/OrganizationEditor";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationList } from "@/api/dashboard/organization";
import { OrganizationType } from "@/types/organization";
import Table, { ColumnsType } from "antd/es/table";
import { Space, Tag } from "antd";

export default function OrganizationList() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const { isPending, isError, data, error, refetch } = useQuery({
    queryKey: ["event-list", pagination],
    queryFn: () => getOrganizationList(pagination),
  });

  const [opened, { open, close }] = useDisclosure(false);
  const [editingOrganization, setEditingOrganization] =
    useState<OrganizationType>();

  const columns: ColumnsType<OrganizationType> = [
    {
      title: "展方名称",
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      key: "status",
      render: (status) => status,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "建立日期",
      key: "date",
      render: (_, record) => (
        <Space>
          <Tag>{dayjs(record.creationTime).format("YYYY/MM/DD")}</Tag>
        </Space>
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          {/* <Button
            color="teal"
            size="xs"
            onClick={() => {
              refreshPage(`/${record.organization.slug}/${record.slug}`);
            }}
          >
            刷新
          </Button> */}
          <Button
            color=""
            size="xs"
            onClick={() => {
              setEditingOrganization(record);
              open();
            }}
          >
            编辑
          </Button>
          <Button color="red" size="xs" onClick={() => {}}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Group justify="flex-end" my="md">
        <Button
          onClick={() => {
            setEditingOrganization(undefined);
            open();
          }}
        >
          添加展商
        </Button>
      </Group>

      <Table
        rowKey={(row) => row.id}
        columns={columns}
        loading={isPending}
        dataSource={data?.records || []}
        scroll={{ x: 1500, y: 600 }}
        pagination={{
          pageSize: pagination.pageSize,
          total: data?.total,
          current: pagination.current,
        }}
        onChange={(pagination) => {
          console.log(pagination);
          setPagination((exist) => ({
            ...exist,
            ...(pagination.current && { current: pagination.current }),
          }));
        }}
      />

      <OrganizationEditor
        organization={editingOrganization}
        opened={opened}
        onClose={close}
      />
    </>
  );
}
