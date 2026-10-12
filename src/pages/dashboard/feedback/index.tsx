import { useState } from "react";
import useSWR from "swr";
import {
  Alert,
  App,
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { FeedbackAPI, feedbackUpdateSchema } from "@/api/dashboard/feedback";
import type { Feedback, FeedbackCategory, FeedbackDetail, FeedbackStatus } from "@/types/feedback";
import { apiErrorMessage } from "@/utils/apiError";
import { targetTypeLabels } from "@/consts/labels";

const statuses = { new: "新反馈", processing: "处理中", resolved: "已解决", closed: "已关闭", spam: "垃圾反馈" };
const categories = {
  incorrect_info: "信息错误",
  missing_info: "信息缺失",
  broken_page: "页面异常",
  suggestion: "建议",
  other: "其他",
};
export default function FeedbackPage() {
  const { message } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [status, setStatus] = useState<FeedbackStatus | "all">("all");
  const [category, setCategory] = useState<FeedbackCategory>();
  const [path, setPath] = useState("");
  const [range, setRange] = useState<{ createdFrom?: string; createdTo?: string }>({});
  const [detail, setDetail] = useState<FeedbackDetail>();
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const { data, error, isLoading, mutate } = useSWR(["feedback", current, status, category, path, range], () =>
    FeedbackAPI.list({ current, pageSize: 20, status, category, pagePath: path || undefined, ...range }),
  );
  const open = async (record: Feedback) => {
    try {
      const detail = await FeedbackAPI.detail(record.id);
      setDetail(detail);
      form.setFieldsValue({ status: detail.status, internalNote: detail.internalNote });
    } catch (e) {
      message.error(apiErrorMessage(e));
    }
  };
  return (
    <div className="space-y-4">
      <Typography.Title level={3}>页面反馈</Typography.Title>
      <Space wrap>
        <Select
          style={{ width: 160 }}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setCurrent(1);
          }}
          options={[
            { value: "all", label: "全部状态" },
            ...Object.entries(statuses).map(([value, label]) => ({ value, label })),
          ]}
        />
        <Select
          style={{ width: 160 }}
          value={category}
          onChange={(v) => {
            setCategory(v);
            setCurrent(1);
          }}
          allowClear
          placeholder="全部分类"
          options={Object.entries(categories).map(([value, label]) => ({ value, label }))}
        />
        <Input.Search
          allowClear
          placeholder="页面路径"
          onSearch={(v) => {
            setPath(v);
            setCurrent(1);
          }}
        />
        <DatePicker.RangePicker
          showTime
          onChange={(v) => {
            setRange({ createdFrom: v?.[0]?.toISOString(), createdTo: v?.[1]?.toISOString() });
            setCurrent(1);
          }}
        />
        <Button onClick={() => void mutate()}>刷新</Button>
      </Space>
      {error && <Alert type="error" title={apiErrorMessage(error)} />}
      <Table<Feedback>
        rowKey="id"
        dataSource={data?.records ?? []}
        loading={isLoading}
        pagination={{ current, pageSize: 20, total: data?.total, onChange: setCurrent, showSizeChanger: false }}
        columns={[
          { title: "分类", render: (_, v) => categories[v.category] },
          { title: "内容", dataIndex: "contentSummary" },
          { title: "页面", render: (_, v) => v.page.title || v.page.path },
          { title: "状态", render: (_, v) => <Tag>{statuses[v.status]}</Tag> },
          { title: "提交时间", render: (_, v) => new Date(v.createdAt).toLocaleString("zh-CN") },
          { title: "操作", render: (_, v) => <Button onClick={() => void open(v)}>查看与处理</Button> },
        ]}
      />
      <Modal
        title="反馈详情"
        open={!!detail}
        onCancel={() => setDetail(undefined)}
        onOk={() => form.submit()}
        confirmLoading={busy}
        width={700}
      >
        {detail && (
          <Descriptions
            column={1}
            items={[
              {
                key: "content",
                label: "反馈内容",
                children: (
                  <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>{detail.content}</Typography.Paragraph>
                ),
              },
              { key: "page", label: "页面", children: detail.page.path },
              { key: "contact", label: "联系邮箱", children: detail.contactEmail || "未提供" },
              {
                key: "target",
                label: "关联对象",
                children: detail.target
                  ? `${targetTypeLabels[detail.target.type] ?? detail.target.type}（${detail.target.id}）`
                  : "无",
              },
            ]}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            const parsed = feedbackUpdateSchema.safeParse(values);
            if (!parsed.success) return message.error(parsed.error.issues.map((v) => v.message).join("；"));
            setBusy(true);
            try {
              await FeedbackAPI.update(detail!.id, parsed.data);
              message.success("反馈已更新");
              setDetail(undefined);
              await mutate();
            } catch (e) {
              message.error(apiErrorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Form.Item label="处理状态" name="status">
            <Select options={Object.entries(statuses).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item label="内部备注（关闭或标记垃圾时必填）" name="internalNote">
            <Input.TextArea rows={4} maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
