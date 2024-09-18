import { useState } from "react";
import { notification, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";
import { Button, Group } from "@mantine/core";

import { ColumnsType } from "antd/es/table";
import { EventScaleLabel, EventStatusLabel } from "@/consts/event";
import EventEditor from "@/pages/dashboard/event/components/EventEditor";
import { EventType } from "@/types/event";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getEventList } from "@/api/dashboard/event";
import { cleanPageCache } from "@/api/dashboard/cache";

function List() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["event-list", pagination],
    queryFn: () => getEventList(pagination),
    
  });

  const { mutate: refreshPage } = useMutation({ mutationFn: cleanPageCache,onSuccess:()=>{
    notification.open({
      message: "刷新成功",
      description: "刷新页面缓存成功",
    });
  } });

  const [editingEvent, setEditingEvent] = useState<EventType>();
  const [opened, { open, close }] = useDisclosure(false);

  const columns: ColumnsType<EventType> = [
    {
      title: "展会名称",
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "日期",
      key: "date",
      render: (_, record) => (
        <Space>
          <Tag>
            {dayjs(record.startAt).format("YYYY/MM/DD")}-
            {dayjs(record.endAt).format("YYYY/MM/DD")}
          </Tag>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      key: "status",
      render: (status) => EventStatusLabel[status],
    },
    {
      title: "规模",
      dataIndex: "scale",
      key: "scale",
      render: (scale) => EventScaleLabel[scale],
    },
    {
      title: "城市",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "展商",
      dataIndex: ["organization", "name"],
      key: "organizationName",
    },
    {
      title: "地址",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            color="teal"
            size="xs"
            onClick={() => {
              refreshPage(`/${record.organization.slug}/${record.slug}`);
            }}
          >
            刷新
          </Button>
          <Button
            color=""
            size="xs"
            onClick={() => {
              setEditingEvent(record);
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
            setEditingEvent(undefined);
            open();
          }}
        >
          添加展会
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

      <EventEditor
        event={editingEvent}
        opened={opened}
        onClose={() => {
          close();
        }}
      />
    </>
  );
}

export default List;
1;
