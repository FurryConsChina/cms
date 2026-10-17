import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
  type FormInstance,
  App,
  Table,
  Drawer,
} from "antd";

import { IconArrowLeft, IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import dayjs from "dayjs";

import { type ColumnsType } from "antd/es/table";

import EntitySelect from "@/components/Cms/EntitySelect";
import { DateListInput, IsoDateTimeInput } from "@/components/Cms/Fields";
import { MediaListFields } from "@/components/Cms/MediaPicker";
import EventVisibility from "@/components/Cms/EventVisibility";
import { EventAPI } from "@/api/cms/event";
import { ParticipantAPI, participantSchema, toParticipantInput } from "@/api/cms/participant";
import { BenefitAPI, OfferAPI, benefitSchema, offerSchema, toBenefitInput, toOfferInput } from "@/api/cms/offer";
import { toOptions } from "@/consts/labels";
import type { Participant, Benefit, Offer } from "@/types/participant";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";

const roles = { guest: "嘉宾", exhibitor: "展商", sponsor: "赞助商", media: "媒体" };
const availability = { upcoming: "待售", onSale: "售卖中", soldOut: "售罄", ended: "已结束" };
const availabilityColors = { upcoming: "blue", onSale: "green", soldOut: "orange", ended: "default" };
const currencies = ["CNY", "HKD", "TWD", "USD", "JPY", "EUR"].map((value) => ({ value, label: value }));

export default function EventManagePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const {
    data: event,
    error,
    mutate,
  } = useSWR(["event-manage", eventId], () => EventAPI.getEventDetail({ id: eventId! }));
  if (error) return <Alert type="error" showIcon title={apiErrorMessage(error)} />;
  return (
    <div className="space-y-4">
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Space align="center">
          <Button
            type="text"
            aria-label="返回活动列表"
            icon={<IconArrowLeft size={18} />}
            onClick={() => navigate("/dashboard/event")}
          />
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {event?.name ?? "活动管理"}
            </Typography.Title>
            {event?.startAt && (
              <Typography.Text type="secondary">
                {dayjs(event.startAt).format("YYYY年M月D日")}
                {event.endAt ? ` – ${dayjs(event.endAt).format("M月D日")}` : ""}
              </Typography.Text>
            )}
          </div>
        </Space>
        <Space wrap>
          {event && <EventVisibility event={event} onChange={() => void mutate()} />}
          <Button onClick={() => navigate(`/dashboard/event/${eventId}/edit`)}>编辑活动资料</Button>
        </Space>
      </Flex>
      <Tabs
        items={[
          { key: "participants", label: "参加者", children: <Participants eventId={eventId!} /> },
          { key: "offers", label: "票档", children: <Offers eventId={eventId!} /> },
          { key: "benefits", label: "权益", children: <Benefits eventId={eventId!} /> },
        ]}
      />
    </div>
  );
}

function Benefits({ eventId }: { eventId: string }) {
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  useEffect(() => {
    setCurrent(1);
  }, [eventId]);
  const { data, error, isLoading, mutate } = useSWR(["benefits", eventId, current, pageSize], () =>
    BenefitAPI.list({ current, pageSize, eventId }),
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Benefit>();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [openingId, setOpeningId] = useState<string>();
  const [sorting, setSorting] = useState(false);
  const [form] = Form.useForm();
  const fill = (record?: Benefit) => {
    form.resetFields();
    const values = { eventId, sortOrder: data?.total ?? 0, ...record };
    form.setFieldsValue(values);
    form.setFields(Object.keys(values).map((name) => ({ name, touched: false })));
    setEditing(record);
    setDirty(false);
  };
  const open = async (record?: Benefit) => {
    try {
      setOpeningId(record?.id);
      fill(record);
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
  const reorder: ((record: Benefit, sortOrder: number) => Promise<Benefit>) | undefined = (record, sortOrder) =>
    BenefitAPI.save(record.id, { ...toBenefitInput(record), sortOrder });
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
      render: (_: unknown, _record: Benefit, index: number) => (
        <Space.Compact>
          <Button
            size="small"
            aria-label="上移"
            disabled={sorting || index === 0}
            icon={<IconArrowUp size={14} />}
            onClick={() => void move(index, -1)}
          />
          <Button
            size="small"
            aria-label="下移"
            disabled={sorting || index === records.length - 1}
            icon={<IconArrowDown size={14} />}
            onClick={() => void move(index, 1)}
          />
        </Space.Compact>
      ),
    },
    { title: "名称", dataIndex: "name" },
    { title: "分类", dataIndex: "category" },
    { title: "描述", dataIndex: "description", ellipsis: true },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button loading={openingId === record.id} onClick={() => void open(record)}>
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
    <div className="space-y-4">
      <Flex justify="space-between" align="center" wrap gap={12}>
        <div></div>
        <Space>
          <Button onClick={() => void mutate()}>刷新</Button>
          <Button type="primary" onClick={() => void open()}>
            新建权益
          </Button>
        </Space>
      </Flex>

      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action=<Button onClick={() => void mutate()}>重试</Button>
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading || sorting}
        scroll={{ x: "max-content" }}
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
      <Drawer
        title={editing ? "编辑权益" : "新建权益"}
        open={opened}
        onClose={close}
        size={Math.min(760, window.innerWidth)}
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
              <Form.Item label="名称" name="name" rules={[{ required: true, message: "请填写权益名称" }]}>
                <Input placeholder="例如 入场手环、限定徽章" />
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
      </Drawer>
    </div>
  );
}

function Offers({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<Offer["availability"]>();
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  useEffect(() => {
    setCurrent(1);
  }, [eventId, status]);
  const { data, error, isLoading, mutate } = useSWR(["offers", eventId, status, current, pageSize], () =>
    OfferAPI.list({ current, pageSize, eventId, availability: status }),
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Offer>();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [openingId, setOpeningId] = useState<string>();
  const [sorting, setSorting] = useState(false);
  const [form] = Form.useForm();
  const fill = (record?: Offer) => {
    form.resetFields();
    const values = record
      ? {
          ...toOfferInput(record),
          benefits: record.benefitLinks.map((v) => ({
            benefitId: v.benefitId,
            quantity: v.quantity,
            note: v.note,
          })),
        }
      : {
          eventId,
          availability: "upcoming",
          currency: "CNY",
          sortOrder: data?.total ?? 0,
          price: null,
          admissionDates: [],
          benefits: [],
        };
    form.setFieldsValue(values);
    form.setFields(Object.keys(values).map((name) => ({ name, touched: false })));
    setEditing(record);
    setDirty(false);
  };
  const open = async (record?: Offer) => {
    try {
      setOpeningId(record?.id);
      fill(record);
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
    const parsed = offerSchema.safeParse(toNullable(values));
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
      const saved = await OfferAPI.save(editing?.id, parsed.data);
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
  const reorder: ((record: Offer, sortOrder: number) => Promise<Offer>) | undefined = status
    ? undefined
    : (record, sortOrder) => OfferAPI.save(record.id, { ...toOfferInput(record), sortOrder });
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
  const columns: ColumnsType<Offer> = [
    ...(reorder
      ? [
          {
            title: "顺序",
            key: "order",
            width: 90,
            render: (_: unknown, _record: Offer, index: number) => (
              <Space.Compact>
                <Button
                  size="small"
                  aria-label="上移"
                  disabled={sorting || index === 0}
                  icon=<IconArrowUp size={14} />
                  onClick={() => void move(index, -1)}
                />
                <Button
                  size="small"
                  aria-label="下移"
                  disabled={sorting || index === records.length - 1}
                  icon=<IconArrowDown size={14} />
                  onClick={() => void move(index, 1)}
                />
              </Space.Compact>
            ),
          },
        ]
      : []),
    { title: "票档", dataIndex: "name" },
    { title: "价格", render: (_, v) => (v.price == null ? "待公布" : `${v.price} ${v.currency}`) },
    {
      title: "状态",
      render: (_, v) => <Tag color={availabilityColors[v.availability]}>{availability[v.availability]}</Tag>,
    },
    {
      title: "包含权益",
      render: (_, v) =>
        v.benefitLinks.length
          ? v.benefitLinks
              .map(
                (link) =>
                  `${link.benefit?.name ?? "权益"}${link.quantity && link.quantity > 1 ? ` ×${link.quantity}` : ""}`,
              )
              .join("、")
          : "—",
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button loading={openingId === record.id} onClick={() => void open(record)}>
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
                    await OfferAPI.delete(record.id);
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
    <div className="space-y-4">
      <Flex justify="space-between" align="center" wrap gap={12}>
        <div>
          <Select
            placeholder="全部售卖状态"
            allowClear
            style={{ width: 180 }}
            value={status}
            onChange={setStatus}
            options={toOptions(availability)}
          />
        </div>
        <Space>
          <Button onClick={() => void mutate()}>刷新</Button>
          <Button type="primary" onClick={() => void open()}>
            新建票档
          </Button>
        </Space>
      </Flex>

      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action=<Button onClick={() => void mutate()}>重试</Button>
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading || sorting}
        scroll={{ x: "max-content" }}
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
      <Drawer
        title={editing ? "编辑票档" : "新建票档"}
        open={opened}
        onClose={close}
        size={Math.min(760, window.innerWidth)}
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
            <OfferFields eventId={eventId} />
          </Form>
        </>
      </Drawer>
    </div>
  );
}

function OfferFields({ eventId }: { eventId: string }) {
  const { data, error } = useSWR(["offer-benefit-options", eventId], () =>
    BenefitAPI.list({ eventId, current: 1, pageSize: 100 }),
  );
  const benefitOptions = data?.records.map((v) => ({ value: v.id, label: v.name })) ?? [];
  return (
    <>
      <Form.Item name="eventId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="sortOrder" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item label="票档名称" name="name" rules={[{ required: true, message: "请填写票档名称" }]}>
        <Input placeholder="例如 普通票、赞助票" />
      </Form.Item>
      <Form.Item label="描述" name="description">
        <Input.TextArea autoSize={{ minRows: 2 }} />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="价格" extra="留空表示待公布">
            <Space.Compact block>
              <Form.Item name="currency" noStyle>
                <Select style={{ width: 90, flexShrink: 0 }} options={currencies} />
              </Form.Item>
              <Form.Item name="price" noStyle>
                <InputNumber min={0} style={{ width: "100%", minWidth: 0 }} placeholder="待公布" />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="售卖状态" name="availability">
            <Select options={toOptions(availability)} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="价格说明" name="priceNote">
        <Input placeholder="例如 早鸟价，限前 100 名" />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="开始售票" name="saleStartAt">
            <IsoDateTimeInput />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="结束售票" name="saleEndAt">
            <IsoDateTimeInput />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="可入场日期" name="admissionDates" extra="留空表示全部日期">
        <DateListInput />
      </Form.Item>
      <Divider titlePlacement="start">包含的权益</Divider>
      {error && <Alert type="error" showIcon title="权益加载失败，请刷新后重试" className="mb-2" />}
      {data && !data.records.length && (
        <Alert type="info" showIcon title="这个活动还没有权益。请先在「权益」标签页中添加。" className="mb-2" />
      )}
      <Form.List name="benefits">
        {(fields, { add, remove }) => (
          <div className="space-y-2">
            {fields.map((field) => (
              <Card key={field.key} size="small">
                <Flex gap={8} wrap align="start">
                  <Form.Item
                    name={[field.name, "benefitId"]}
                    rules={[{ required: true, message: "请选择权益" }]}
                    style={{ flex: 1, minWidth: 200, marginBottom: 0 }}
                  >
                    <Select placeholder="选择权益" options={benefitOptions} />
                  </Form.Item>
                  <Form.Item name={[field.name, "quantity"]} style={{ marginBottom: 0 }}>
                    <InputNumber min={1} precision={0} prefix="×" style={{ width: 100 }} />
                  </Form.Item>
                  <Button danger type="text" onClick={() => remove(field.name)}>
                    移除
                  </Button>
                </Flex>
                <Form.Item name={[field.name, "note"]} style={{ marginBottom: 0, marginTop: 8 }}>
                  <Input placeholder="备注（可选）" />
                </Form.Item>
              </Card>
            ))}
            <Button type="dashed" block disabled={!benefitOptions.length} onClick={() => add({ quantity: 1 })}>
              添加权益
            </Button>
          </div>
        )}
      </Form.List>
    </>
  );
}

const participantName = (v: Participant) => v.profile?.name || v.organization?.name || "未命名";

function Participants({ eventId }: { eventId: string }) {
  const [role, setRole] = useState<Participant["role"]>();
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  useEffect(() => {
    setCurrent(1);
  }, [eventId, role]);
  const { data, error, isLoading, mutate } = useSWR(["participants", eventId, role, current, pageSize], () =>
    ParticipantAPI.list({ current, pageSize, eventId, role }),
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Participant>();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [openingId, setOpeningId] = useState<string>();
  const [sorting, setSorting] = useState(false);
  const [form] = Form.useForm();
  const transform = ({ subjectType, ...values }: Record<string, unknown>) =>
    toNullable({
      ...values,
      profileId: subjectType === "profile" ? values.profileId : null,
      organizationId: subjectType === "organization" ? values.organizationId : null,
    });
  const fill = (record?: Participant) => {
    form.resetFields();
    const values = {
      eventId,
      role: "guest",
      sortOrder: data?.total ?? 0,
      isFeatured: false,
      profileId: null,
      organizationId: null,
      appearanceDates: [],
      portrait: [],
      gallery: [],
      ...record,
      subjectType: record?.organizationId ? "organization" : "profile",
    };
    form.setFieldsValue(values);
    form.setFields(Object.keys(values).map((name) => ({ name, touched: false })));
    setEditing(record);
    setDirty(false);
  };
  const open = async (record?: Participant) => {
    try {
      setOpeningId(record?.id);
      fill(record ? await ParticipantAPI.detail(record) : undefined);
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
    const parsed = participantSchema.safeParse(transform(values));
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
      const saved = await ParticipantAPI.save(editing?.id, parsed.data);
      await mutate();
      if (editing) {
        message.success("已保存");
        setOpened(false);
      } else {
        fill(await ParticipantAPI.detail(saved));
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
  const reorder: ((record: Participant, sortOrder: number) => Promise<Participant>) | undefined = role
    ? undefined
    : (record, sortOrder) => ParticipantAPI.save(record.id, { ...toParticipantInput(record), sortOrder });
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
  const columns: ColumnsType<Participant> = [
    ...(reorder
      ? [
          {
            title: "顺序",
            key: "order",
            width: 90,
            render: (_: unknown, _record: Participant, index: number) => (
              <Space.Compact>
                <Button
                  size="small"
                  aria-label="上移"
                  disabled={sorting || index === 0}
                  icon=<IconArrowUp size={14} />
                  onClick={() => void move(index, -1)}
                />
                <Button
                  size="small"
                  aria-label="下移"
                  disabled={sorting || index === records.length - 1}
                  icon=<IconArrowDown size={14} />
                  onClick={() => void move(index, 1)}
                />
              </Space.Compact>
            ),
          },
        ]
      : []),
    {
      title: "参加者",
      render: (_, v) => (
        <Space>
          {participantName(v)}
          <Tag>{v.organization ? "组织" : "主体资料"}</Tag>
        </Space>
      ),
    },
    { title: "角色", render: (_, v) => roles[v.role] },
    { title: "摊位", dataIndex: "booth" },
    { title: "级别", dataIndex: "tier" },
    { title: "重点展示", render: (_, v) => (v.isFeatured ? <Tag color="gold">重点</Tag> : "—") },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button loading={openingId === record.id} onClick={() => void open(record)}>
            编辑
          </Button>
          <Typography.Text
            copyable={{
              text: `${window.location.origin}/dashboard/participation?id=${record.id}`,
              tooltips: ["复制自助编辑链接", "已复制"],
            }}
            type="secondary"
          >
            自助链接
          </Typography.Text>
          <Button
            danger
            onClick={() =>
              modal.confirm({
                title: "确认删除这条记录？",
                content: "删除后将不再展示。如果其他内容引用了这条记录，删除会失败。",
                okButtonProps: { danger: true },
                onOk: async () => {
                  try {
                    await ParticipantAPI.delete(record.id);
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
    <div className="space-y-4">
      <Flex justify="space-between" align="center" wrap gap={12}>
        <div>
          <Select
            placeholder="全部角色"
            value={role}
            onChange={setRole}
            allowClear
            style={{ width: 160 }}
            options={toOptions(roles)}
          />
        </div>
        <Space>
          <Button onClick={() => void mutate()}>刷新</Button>
          <Button type="primary" onClick={() => void open()}>
            新建参加者
          </Button>
        </Space>
      </Flex>

      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action=<Button onClick={() => void mutate()}>重试</Button>
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading || sorting}
        scroll={{ x: "max-content" }}
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
      <Drawer
        title={editing ? "编辑参加者" : "新建参加者"}
        open={opened}
        onClose={close}
        size={Math.min(760, window.innerWidth)}
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
          {!editing && <Alert type="info" showIcon title={"创建后可以上传形象图和相册。"} className="mb-4" />}
          <Form
            form={form}
            layout="vertical"
            onFinish={submit}
            onValuesChange={() => setDirty(true)}
            scrollToFirstError
          >
            <ParticipantFields form={form} record={editing} />
          </Form>
        </>
      </Drawer>
    </div>
  );
}

function ParticipantFields({ form, record }: { form: FormInstance; record?: Participant }) {
  const subjectType = Form.useWatch("subjectType", form) as "profile" | "organization" | undefined;
  const owner = record ? { entityType: "event_participation" as const, entityId: record.id } : undefined;
  return (
    <>
      <Form.Item name="eventId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="sortOrder" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item label="参加方" name="subjectType">
        <Radio.Group
          optionType="button"
          options={[
            { value: "profile", label: "主体资料（个人、团体等）" },
            { value: "organization", label: "组织" },
          ]}
        />
      </Form.Item>
      {subjectType === "organization" ? (
        <Form.Item label="选择组织" name="organizationId" rules={[{ required: true, message: "请选择组织" }]}>
          <EntitySelect kind="organization" />
        </Form.Item>
      ) : (
        <Form.Item
          label="选择主体资料"
          name="profileId"
          rules={[{ required: true, message: "请选择主体资料" }]}
          extra="找不到？先在「主体资料」页面创建。"
        >
          <EntitySelect kind="profile" />
        </Form.Item>
      )}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="参加角色" name="role">
            <Select options={toOptions(roles)} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="摊位" name="booth">
            <Input maxLength={64} placeholder="例如 A12" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="级别" name="tier">
            <Input maxLength={64} placeholder="例如 金牌赞助" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="重点展示" name="isFeatured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="介绍" name="description">
        <Input.TextArea autoSize={{ minRows: 3 }} />
      </Form.Item>
      <Form.Item label="出席日期" name="appearanceDates" extra="留空表示全部日期">
        <DateListInput />
      </Form.Item>
      <Divider titlePlacement="start">图片</Divider>
      <MediaListFields name="portrait" label="形象图" owner={owner} />
      <MediaListFields name="gallery" label="相册" owner={owner} />
    </>
  );
}
