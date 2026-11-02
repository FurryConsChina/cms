import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import type { ColumnsType } from "antd/es/table";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import {
  App,
  Button,
  Modal,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { publishStatusLabels } from "@/consts/publishStatus";
import { toOptions } from "@/consts/labels";
import type { PublishStatus } from "@/types/publishStatus";
import { BenefitAPI, benefitSchema, toBenefitInput } from "@/api/cms/offer";
import type { Benefit } from "@/types/participant";
import type { List } from "@/types/request";
import DefaultContainer from "@/components/layout/Container";

export default function EventBenefitPanel({ eventId }: { eventId: string }) {
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>();
  useEffect(() => {
    setCurrent(1);
  }, [eventId, publishStatus]);
  const { data, isLoading, mutate } = useSWR<List<Benefit>, Error>(
    ["benefits", eventId, publishStatus, current, pageSize],
    () => BenefitAPI.list({ current, pageSize, eventId, publishStatus }),
    {
      onError: (error) => {
        message.error(apiErrorMessage(error));
      },
      shouldRetryOnError: false,
    },
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Benefit>();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [openingId, setOpeningId] = useState<string>();
  const [sorting, setSorting] = useState(false);
  const [form] = Form.useForm();
  const { confirmationModal } = useUnsavedChangesGuard({
    dirty: opened && (dirty || form.isFieldsTouched()),
    busy: saving || submitting.current,
  });
  const refresh = () => {
    mutate().catch((error: unknown) => {
      message.error(apiErrorMessage(error));
    });
  };
  const fill = (record?: Benefit) => {
    form.resetFields();
    const values = { eventId, sortOrder: data?.total ?? 0, publishStatus: "draft", ...record };
    form.setFieldsValue(values);
    form.setFields(Object.keys(values).map((name) => ({ name, touched: false })));
    setEditing(record);
    setDirty(false);
  };
  const open = async (record?: Benefit) => {
    try {
      setOpeningId(record?.id);
      const total =
        !record && publishStatus
          ? (await BenefitAPI.list({ eventId, current: 1, pageSize: 1 })).total
          : undefined;
      fill(record);
      if (total !== undefined) form.setFieldValue("sortOrder", total);
      setOpened(true);
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setOpeningId(undefined);
    }
  };
  const close = () => {
    if (submitting.current) return;
    if (!dirty && !form.isFieldsTouched()) return setOpened(false);
    modal.confirm({
      title: "放弃未保存的修改？",
      okText: "放弃",
      okButtonProps: { danger: true },
      cancelText: "继续编辑",
      onOk: () => setOpened(false),
    });
  };
  const submit = async (values: Record<string, unknown>) => {
    if (submitting.current) return;
    const parsed = benefitSchema.safeParse(toNullable(values));
    if (!parsed.success) {
      form.setFields(
        parsed.error.issues
          .filter((issue) => issue.path.length)
          .map((issue) => ({ name: issue.path as (string | number)[], errors: [issue.message] })),
      );
      message.error(parsed.error.issues[0]?.message ?? "请检查表单内容");
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      const saved = await BenefitAPI.save(editing?.id, parsed.data);
      await mutate();
      if (editing) {
        message.success("已保存");
        setOpened(false);
      } else {
        fill(saved);
        message.success("已创建，可以继续补充内容");
      }
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const records = data?.records ?? [];
  const reorder: ((record: Benefit, sortOrder: number) => Promise<Benefit>) | undefined =
    publishStatus
      ? undefined
      : (record, sortOrder) => BenefitAPI.save(record.id, { ...toBenefitInput(record), sortOrder });
  const move = async (index: number, offset: -1 | 1) => {
    if (!reorder) return;
    const next = [...records];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    const base = (current - 1) * pageSize;
    setSorting(true);
    try {
      for (const [i, record] of next.entries()) {
        if (record.sortOrder !== base + i) await reorder(record, base + i);
      }
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setSorting(false);
      await mutate();
    }
  };
  const columns: ColumnsType<Benefit> = [
    {
      title: "顺序",
      key: "order",
      width: 90,
      hidden: !reorder,
      render: (_: unknown, _record: Benefit, index: number) => (
        <Space.Compact>
          <Button
            size="small"
            aria-label="上移"
            disabled={sorting || index === 0}
            icon={<IconArrowUp size={14} />}
            onClick={() => {
              move(index, -1).catch((error: unknown) => {
                message.error(apiErrorMessage(error));
              });
            }}
          />
          <Button
            size="small"
            aria-label="下移"
            disabled={sorting || index === records.length - 1}
            icon={<IconArrowDown size={14} />}
            onClick={() => {
              move(index, 1).catch((error: unknown) => {
                message.error(apiErrorMessage(error));
              });
            }}
          />
        </Space.Compact>
      ),
    },
    { title: "名称", dataIndex: "name" },
    {
      title: "发布状态",
      key: "publishStatus",
      filters: Object.entries(publishStatusLabels).map(([value, text]) => ({ value, text })),
      filterMultiple: false,
      filteredValue: publishStatus ? [publishStatus] : null,
      render: (_, v) => (
        <Tag color={v.publishStatus === "published" ? "green" : "default"}>
          {publishStatusLabels[v.publishStatus]}
        </Tag>
      ),
    },
    { title: "分类", dataIndex: "category" },
    { title: "描述", dataIndex: "description", ellipsis: true },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button loading={openingId === record.id} onClick={() => open(record)}>
            编辑
          </Button>

          <Button
            danger
            onClick={() =>
              modal.confirm({
                title: "确认删除这条记录？",
                content: "删除后将不再展示。如果其他内容引用了这条记录，删除会失败。",
                okButtonProps: { danger: true },
                onOk: async () => {
                  try {
                    await BenefitAPI.delete(record.id);
                    message.success("已删除");
                    await mutate();
                  } catch (error) {
                    message.error(apiErrorMessage(error));
                    throw error;
                  }
                },
              })
            }
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <DefaultContainer className="space-y-4">
      {confirmationModal}
      <Flex justify="space-between" align="center" wrap gap={12}>
        <div></div>
        <Space>
          <Button onClick={refresh}>刷新</Button>
          <Button type="primary" onClick={() => open()}>
            新建权益
          </Button>
        </Space>
      </Flex>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading || sorting}
        scroll={{ x: "max-content" }}
        onChange={(_pagination, values, _sorter, extra) => {
          if (extra.action !== "filter") return;
          setPublishStatus(values.publishStatus?.[0] as PublishStatus | undefined);
        }}
        pagination={{
          current,
          pageSize,
          total: data?.total,
          showSizeChanger: true,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size);
          },
        }}
      />
      <Modal
        title={editing ? "编辑权益" : "新建权益"}
        open={opened}
        onCancel={close}
        centered
        width={760}
        destroyOnHidden
        footer=<Flex justify="flex-end" gap={8}>
          <Button onClick={close} disabled={saving}>
            {editing ? "关闭" : "取消"}
          </Button>
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            {editing ? "保存" : "创建"}
          </Button>
        </Flex>
      >
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={submit}
            onValuesChange={() => setDirty(true)}
            scrollToFirstError
          >
            <>
              <Form.Item name="eventId" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="sortOrder" hidden>
                <InputNumber />
              </Form.Item>
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: "请填写权益名称" }]}
              >
                <Input placeholder="例如 入场手环、限定徽章" />
              </Form.Item>
              <Form.Item
                label="发布状态"
                name="publishStatus"
                rules={[{ required: true, message: "请选择发布状态" }]}
              >
                <Select options={toOptions(publishStatusLabels)} />
              </Form.Item>
              <Form.Item label="分类" name="category">
                <Input maxLength={64} placeholder="例如 周边、入场" />
              </Form.Item>
              <Form.Item label="描述" name="description">
                <Input.TextArea autoSize={{ minRows: 3 }} />
              </Form.Item>
            </>
          </Form>
        </>
      </Modal>
    </DefaultContainer>
  );
}
