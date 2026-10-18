import { FeatureAPI } from "@/api/cms/feature";
import { EventStatusColor, EventStatusLabel } from "@/consts/event";
import type { Feature, FeatureEvent } from "@/types/feature";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState } from "react";

const PAGE_SIZE = 10;

function formatEventDate(event: FeatureEvent) {
  if (!event.startAt) return "—";
  const start = dayjs(event.startAt).format("YYYY/MM/DD");
  return event.endAt ? `${start} - ${dayjs(event.endAt).format("MM/DD")}` : start;
}

const columns: ColumnsType<FeatureEvent> = [
  {
    title: "活动名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "日期",
    key: "date",
    width: 190,
    render: (_, record) => formatEventDate(record),
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 110,
    render: (status: FeatureEvent["status"]) => (
      <Tag color={EventStatusColor[status]}>{EventStatusLabel[status]}</Tag>
    ),
  },
  {
    title: "操作",
    key: "action",
    width: 80,
    render: (_, record) => (
      <Button size="small" onClick={() => window.open(`/dashboard/event/${record.id}/edit`)}>
        编辑
      </Button>
    ),
  },
];

export default function FeatureEventsModal({
  feature,
  onClose,
}: {
  feature: Pick<Feature, "id" | "name">;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ["feature-events", feature.id, current],
    queryFn: () => FeatureAPI.getFeatureEvents(feature.id, { current, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  return (
    <Modal open title={`“${feature.name}”的引用活动`} onCancel={onClose} footer={null} width={800}>
      <Table<FeatureEvent>
        rowKey="id"
        size="small"
        columns={columns}
        loading={isFetching}
        dataSource={data?.records ?? []}
        locale={{ emptyText: "没有引用活动" }}
        scroll={{ x: 640 }}
        pagination={{
          current,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 个活动`,
        }}
        onChange={(pagination) => setCurrent(pagination.current ?? 1)}
      />
    </Modal>
  );
}
