import { useState } from "react";
import useSWR from "swr";
import {
  Alert,
  App,
  Button,
  Descriptions,
  Form,
  Flex,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import { FeedbackAPI, feedbackUpdateSchema } from "@/api/cms/feedback";
import type { Feedback, FeedbackCategory, FeedbackDetail, FeedbackStatus } from "@/types/feedback";
import { apiErrorMessage } from "@/utils/apiError";
import { targetTypeLabels } from "@/consts/labels";
import DefaultContainer from "@/components/layout/Container";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import TableFilterDropdown from "@/components/common/TableFilterDropdown";
import TableDateRangeFilterDropdown from "@/components/common/TableDateRangeFilterDropdown";

const statuses = {
  new: "新反馈",
  processing: "处理中",
  resolved: "已解决",
  closed: "已关闭",
  spam: "垃圾反馈",
};
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
  const { data, error, isLoading, mutate } = useSWR(
    ["feedback", current, status, category, path, range],
    () =>
      FeedbackAPI.list({
        current,
        pageSize: 20,
        status,
        category,
        pagePath: path || undefined,
        ...range,
      }),
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
      <DefaultContainer className="sticky top-0 z-20">
        <Flex justify="space-between" align="center" wrap gap={12}>
          <Typography.Title level={3} className="m-0">
            页面反馈
          </Typography.Title>
          <Button icon={<IconRefresh size={16} stroke={1.5} />} onClick={() => void mutate()}>
            刷新
          </Button>
        </Flex>
      </DefaultContainer>
      {error && <Alert type="error" title={apiErrorMessage(error)} />}
      <Table<Feedback>
        rowKey="id"
        dataSource={data?.records ?? []}
        loading={isLoading}
        onChange={(_pagination, values, _sorter, extra) => {
          if (extra.action !== "filter") return;
          setStatus((values.status?.[0] as FeedbackStatus | undefined) ?? "all");
          setCategory(values.category?.[0] as FeedbackCategory | undefined);
          setPath((values.page?.[0] as string | undefined)?.trim() ?? "");
          setRange({
            createdFrom: values.createdAt?.[0] as string | undefined,
            createdTo: values.createdAt?.[1] as string | undefined,
          });
          setCurrent(1);
        }}
        pagination={{
          current,
          pageSize: 20,
          total: data?.total,
          onChange: setCurrent,
          showSizeChanger: false,
        }}
        columns={[
          {
            title: "分类",
            key: "category",
            filters: Object.entries(categories).map(([value, text]) => ({ value, text })),
            filterMultiple: false,
            filteredValue: category ? [category] : null,
            render: (_, v) => categories[v.category],
          },
          { title: "内容", dataIndex: "contentSummary" },
          {
            title: "页面",
            key: "page",
            filteredValue: path ? [path] : null,
            filterDropdown: (props) => (
              <TableFilterDropdown {...props} placeholder="页面路径" confirmText="搜索" />
            ),
            filterIcon: (filtered) => (
              <IconSearch size={14} style={{ color: filtered ? "#1677ff" : undefined }} />
            ),
            render: (_, v) => v.page.title || v.page.path,
          },
          {
            title: "状态",
            key: "status",
            filters: Object.entries(statuses).map(([value, text]) => ({ value, text })),
            filterMultiple: false,
            filteredValue: status === "all" ? null : [status],
            render: (_, v) => <Tag>{statuses[v.status]}</Tag>,
          },
          {
            title: "提交时间",
            key: "createdAt",
            filteredValue:
              range.createdFrom && range.createdTo ? [range.createdFrom, range.createdTo] : null,
            filterDropdown: (props) => <TableDateRangeFilterDropdown {...props} showTime />,
            render: (_, v) => new Date(v.createdAt).toLocaleString("zh-CN"),
          },
          {
            title: "操作",
            render: (_, v) => <Button onClick={() => void open(v)}>查看与处理</Button>,
          },
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
                  <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                    {detail.content}
                  </Typography.Paragraph>
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
            if (!parsed.success)
              return message.error(parsed.error.issues.map((v) => v.message).join("；"));
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
            <Select
              options={Object.entries(statuses).map(([value, label]) => ({ value, label }))}
            />
          </Form.Item>
          <Form.Item label="内部备注（关闭或标记垃圾时必填）" name="internalNote">
            <Input.TextArea rows={4} maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
