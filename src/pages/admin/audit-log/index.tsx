import { useState } from "react";
import useSWR from "swr";
import {
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Select,
  Table,
  Typography,
} from "antd";
import { AdminAuditLogApi, type AuditLogQuery } from "@/api/cms/admin/auditLog";
import { auditActionLabel, targetTypeLabels, toOptions } from "@/consts/labels";
import { apiErrorMessage } from "@/utils/apiError";
import type { AuditLog } from "@/types/access";
import type { List } from "@/types/request";
import type { Dayjs } from "dayjs";

type FilterValues = {
  action?: string;
  targetType?: string;
  range?: [Dayjs, Dayjs];
};

const toQuery = (values: FilterValues, current: number): AuditLogQuery => ({
  current,
  pageSize: 20,
  action: values.action?.trim() || undefined,
  targetType: values.targetType || undefined,
  createdFrom: values.range?.[0]?.startOf("day").toDate().toISOString(),
  createdTo: values.range?.[1]?.endOf("day").toDate().toISOString(),
});

export default function AdminAuditLogPage() {
  const [form] = Form.useForm<FilterValues>();
  const [filters, setFilters] = useState<FilterValues>({});
  const [current, setCurrent] = useState(1);

  const { data, error, isLoading } = useSWR<List<AuditLog>, unknown>(
    ["admin-audit-logs", filters, current],
    async () => AdminAuditLogApi.list(toQuery(filters, current)),
  );

  const applyFilters = (values: FilterValues) => {
    setFilters(values);
    setCurrent(1);
  };

  return (
    <div className="space-y-4">
      <Typography.Title level={3}>审计日志</Typography.Title>
      <Form form={form} layout="inline" onFinish={applyFilters}>
        <Form.Item name="action" label="操作">
          <Input allowClear placeholder="如 event.updated" style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="targetType" label="对象类型">
          <Select
            allowClear
            showSearch
            placeholder="全部"
            options={toOptions(targetTypeLabels)}
            style={{ width: 160 }}
          />
        </Form.Item>
        <Form.Item name="range" label="时间范围">
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={() => {
              form.resetFields();
              applyFilters({});
            }}
          >
            重置
          </Button>
        </Form.Item>
      </Form>
      {!!error && <Alert type="error" title={apiErrorMessage(error)} />}
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.records ?? []}
        pagination={{
          current,
          pageSize: 20,
          total: data?.total,
          onChange: setCurrent,
          showSizeChanger: false,
        }}
        columns={[
          {
            title: "时间",
            render: (_, v) => new Date(v.createdAt).toLocaleString("zh-CN"),
          },
          { title: "操作", render: (_, v) => auditActionLabel(v.action) },
          {
            title: "操作者",
            render: (_, v) => v.actor?.name ?? v.actor?.email ?? "系统",
          },
          {
            title: "对象",
            render: (_, v) => targetTypeLabels[v.targetType] ?? v.targetType,
          },
          { title: "IP", render: (_, v) => v.ipAddress ?? "-" },
        ]}
        expandable={{
          expandedRowRender: (v) => (
            <Descriptions
              column={1}
              items={[
                { key: "action", label: "action", children: v.action },
                ...(v.targetId
                  ? [{ key: "targetId", label: "targetId", children: v.targetId }]
                  : []),
                ...(v.requestId
                  ? [{ key: "requestId", label: "requestId", children: v.requestId }]
                  : []),
                ...Object.entries(v.metadata).map(([label, value]) => ({
                  key: label,
                  label,
                  children:
                    typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value as string | number | boolean | null),
                })),
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
