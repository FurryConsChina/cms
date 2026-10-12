import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import {
  Alert,
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { FormInstance } from "antd";
import { IconArrowLeft } from "@tabler/icons-react";
import dayjs from "dayjs";
import ResourcePage from "@/components/Cms/ResourcePage";
import EntitySelect from "@/components/Cms/EntitySelect";
import { DateListInput, IsoDateTimeInput } from "@/components/Cms/Fields";
import { MediaListFields } from "@/components/Cms/MediaPicker";
import EventVisibility from "@/components/Cms/EventVisibility";
import { EventAPI } from "@/api/dashboard/event";
import {
  ParticipantAPI,
  participantSchema,
  toParticipantInput,
  type ParticipantInput,
} from "@/api/dashboard/participant";
import {
  BenefitAPI,
  OfferAPI,
  benefitSchema,
  offerSchema,
  toBenefitInput,
  toOfferInput,
  type BenefitInput,
  type OfferInput,
} from "@/api/dashboard/offer";
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
  return (
    <ResourcePage<Benefit, BenefitInput>
      title="权益"
      embedded
      queryKey={["benefits", eventId]}
      list={(page) => BenefitAPI.list({ ...page, eventId })}
      schema={benefitSchema}
      save={BenefitAPI.save}
      remove={BenefitAPI.delete}
      reorder={(record, sortOrder) => BenefitAPI.save(record.id, { ...toBenefitInput(record), sortOrder })}
      initialValues={(record, { total }) => ({ eventId, sortOrder: total, ...record })}
      columns={[
        { title: "名称", dataIndex: "name" },
        { title: "分类", dataIndex: "category" },
        { title: "描述", dataIndex: "description", ellipsis: true },
      ]}
      editor={() => (
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
      )}
    />
  );
}

function Offers({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<Offer["availability"]>();
  return (
    <ResourcePage<Offer, OfferInput>
      title="票档"
      embedded
      queryKey={["offers", eventId, status]}
      list={(page) => OfferAPI.list({ ...page, eventId, availability: status })}
      schema={offerSchema}
      save={OfferAPI.save}
      remove={OfferAPI.delete}
      reorder={
        status ? undefined : (record, sortOrder) => OfferAPI.save(record.id, { ...toOfferInput(record), sortOrder })
      }
      initialValues={(record, { total }) =>
        record
          ? {
              ...toOfferInput(record),
              benefits: record.benefitLinks.map((v) => ({ benefitId: v.benefitId, quantity: v.quantity, note: v.note })),
            }
          : {
              eventId,
              availability: "upcoming",
              currency: "CNY",
              sortOrder: total,
              price: null,
              admissionDates: [],
              benefits: [],
            }
      }
      columns={[
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
                  .map((link) => `${link.benefit?.name ?? "权益"}${link.quantity && link.quantity > 1 ? ` ×${link.quantity}` : ""}`)
                  .join("、")
              : "—",
        },
      ]}
      filters={
        <Select
          placeholder="全部售卖状态"
          allowClear
          style={{ width: 180 }}
          value={status}
          onChange={setStatus}
          options={toOptions(availability)}
        />
      }
      editor={() => <OfferFields eventId={eventId} />}
    />
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
      <Space wrap align="start">
        <Form.Item label="价格" extra="留空表示待公布">
          <Space.Compact>
            <Form.Item name="currency" noStyle>
              <Select style={{ width: 90 }} options={currencies} />
            </Form.Item>
            <Form.Item name="price" noStyle>
              <InputNumber min={0} style={{ width: 160 }} placeholder="待公布" />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item label="售卖状态" name="availability">
          <Select style={{ width: 140 }} options={toOptions(availability)} />
        </Form.Item>
      </Space>
      <Form.Item label="价格说明" name="priceNote">
        <Input placeholder="例如 早鸟价，限前 100 名" />
      </Form.Item>
      <Space wrap>
        <Form.Item label="开始售票" name="saleStartAt">
          <IsoDateTimeInput />
        </Form.Item>
        <Form.Item label="结束售票" name="saleEndAt">
          <IsoDateTimeInput />
        </Form.Item>
      </Space>
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
  return (
    <ResourcePage<Participant, ParticipantInput>
      title="参加者"
      embedded
      queryKey={["participants", eventId, role]}
      list={(page) => ParticipantAPI.list({ ...page, eventId, role })}
      schema={participantSchema}
      save={ParticipantAPI.save}
      remove={ParticipantAPI.delete}
      detail={ParticipantAPI.detail}
      reorder={
        role
          ? undefined
          : (record, sortOrder) => ParticipantAPI.save(record.id, { ...toParticipantInput(record), sortOrder })
      }
      createHint="创建后可以上传形象图和相册。"
      initialValues={(record, { total }) => ({
        eventId,
        role: "guest",
        sortOrder: total,
        isFeatured: false,
        profileId: null,
        organizationId: null,
        appearanceDates: [],
        portrait: [],
        gallery: [],
        ...record,
        subjectType: record?.organizationId ? "organization" : "profile",
      })}
      transform={({ subjectType, ...values }) =>
        toNullable({
          ...values,
          profileId: subjectType === "profile" ? values.profileId : null,
          organizationId: subjectType === "organization" ? values.organizationId : null,
        })
      }
      columns={[
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
      ]}
      actions={(record) => (
        <Typography.Text
          copyable={{
            text: `${window.location.origin}/dashboard/participation?id=${record.id}`,
            tooltips: ["复制自助编辑链接", "已复制"],
          }}
          type="secondary"
        >
          自助链接
        </Typography.Text>
      )}
      filters={
        <Select
          placeholder="全部角色"
          value={role}
          onChange={setRole}
          allowClear
          style={{ width: 160 }}
          options={toOptions(roles)}
        />
      }
      editor={(form, record) => <ParticipantFields form={form} record={record} />}
    />
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
      <Space wrap>
        <Form.Item label="参加角色" name="role">
          <Select style={{ width: 140 }} options={toOptions(roles)} />
        </Form.Item>
        <Form.Item label="摊位" name="booth">
          <Input maxLength={64} placeholder="例如 A12" />
        </Form.Item>
        <Form.Item label="级别" name="tier">
          <Input maxLength={64} placeholder="例如 金牌赞助" />
        </Form.Item>
        <Form.Item label="重点展示" name="isFeatured" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Space>
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
