import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import type { ColumnsType } from "antd/es/table";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Divider,
  Modal,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { BenefitAPI, OfferAPI, offerSchema, toOfferInput } from "@/api/cms/offer";
import type { Benefit, Offer } from "@/types/participant";
import type { List } from "@/types/request";
import BenefitSelector from "@/components/benefit/BenefitSelector";
import DefaultContainer from "@/components/layout/Container";
import { IsoDateTimeInput, IsoDateTimeListInput } from "@/components/common/Fields";
import { toOptions } from "@/consts/labels";

const availability = { upcoming: "待售", onSale: "售卖中", soldOut: "售罄", ended: "已结束" };
const availabilityColors = {
  upcoming: "blue",
  onSale: "green",
  soldOut: "orange",
  ended: "default",
};
const currencies = [
  { value: "CNY", label: "人民币（CNY）" },
  { value: "HKD", label: "港币（HKD）" },
  { value: "TWD", label: "新台币（TWD）" },
  { value: "USD", label: "美元（USD）" },
  { value: "JPY", label: "日元（JPY）" },
  { value: "EUR", label: "欧元（EUR）" },
];

export default function EventOfferPanel({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<Offer["availability"]>();
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  useEffect(() => {
    setCurrent(1);
  }, [eventId, status]);
  const { data, error, isLoading, mutate } = useSWR<List<Offer>, Error>(
    ["offers", eventId, status, current, pageSize],
    () => OfferAPI.list({ current, pageSize, eventId, availability: status }),
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Offer>();
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
  const open = (record?: Offer) => {
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
                  icon=<IconArrowDown size={14} />
                  onClick={() => {
                    move(index, 1).catch((error: unknown) => {
                      message.error(apiErrorMessage(error));
                    });
                  }}
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
      key: "availability",
      filters: Object.entries(availability).map(([value, text]) => ({ value, text })),
      filterMultiple: false,
      filteredValue: status ? [status] : null,
      render: (_, v) => (
        <Tag color={availabilityColors[v.availability]}>{availability[v.availability]}</Tag>
      ),
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
    <DefaultContainer className="space-y-4">
      {confirmationModal}
      <Flex justify="flex-end" align="center" wrap gap={12}>
        <Space>
          <Button onClick={refresh}>刷新</Button>
          <Button type="primary" onClick={() => open()}>
            新建票档
          </Button>
        </Space>
      </Flex>

      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action=<Button onClick={refresh}>重试</Button>
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading || sorting}
        scroll={{ x: "max-content" }}
        onChange={(_pagination, values, _sorter, extra) => {
          if (extra.action !== "filter") return;
          setStatus(values.availability?.[0] as Offer["availability"] | undefined);
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
        title={editing ? "编辑票档" : "新建票档"}
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
            <OfferFields eventId={eventId} />
          </Form>
        </>
      </Modal>
    </DefaultContainer>
  );
}

function OfferFields({ eventId }: { eventId: string }) {
  const { data, error } = useSWR<List<Benefit>, Error>(["offer-benefit-options", eventId], () =>
    BenefitAPI.list({ eventId, current: 1, pageSize: 100 }),
  );
  return (
    <>
      <Form.Item name="eventId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="sortOrder" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item
        label="票档名称"
        name="name"
        rules={[{ required: true, message: "请填写票档名称" }]}
      >
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
                <Select style={{ width: 160, flexShrink: 0 }} options={currencies} />
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
      <Form.Item label="可入场时间" name="admissionDates" extra="留空表示不限入场时间">
        <IsoDateTimeListInput />
      </Form.Item>
      <Divider titlePlacement="start">包含的权益</Divider>
      {error && <Alert type="error" showIcon title="权益加载失败，请刷新后重试" className="mb-2" />}
      {data && !data.records.length && (
        <Alert
          type="info"
          showIcon
          title="这个活动还没有权益。请先在「权益」标签页中添加。"
          className="mb-2"
        />
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
                    <BenefitSelector eventId={eventId} />
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
            <Button
              type="dashed"
              block
              disabled={!data?.records.length}
              onClick={() => add({ quantity: 1 })}
            >
              添加权益
            </Button>
          </div>
        )}
      </Form.List>
    </>
  );
}
