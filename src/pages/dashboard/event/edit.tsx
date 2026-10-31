import { apiErrorMessage } from "@/utils/apiError";
import { useMatch, useNavigate, useParams } from "react-router";
import { lazy, Suspense, useState } from "react";
import useSWR from "swr";
import { IconArrowLeft } from "@tabler/icons-react";
import { pickBy } from "es-toolkit";
import dayjs from "dayjs";
import { Button, Divider, Typography, Flex, App, Form, Space, Spin, Tabs, Tag } from "antd";
import { Region } from "@/types/region";
import { EditEventApiBody, EventAPI } from "@/api/cms/event";
import DefaultContainer from "@/components/layout/Container";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import { useZodValidateData as validateData } from "@/utils/form";
import EventVisibility from "@/components/event/EventVisibility";
import LoadError from "@/components/layout/LoadError";
import useAuthStore from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";

import BasicInfo from "./components/BasicInfo";
import GeographicInfo from "./components/GeographicInfo";
import EventAdditionalInfo from "./components/EventAdditionalInfo";
import EventSources from "./components/EventSources";
import TicketChannels from "./components/TicketChannels";
import EventMedia from "./components/EventMedia";

import "dayjs/locale/zh-cn";

import {
  type EditableEvent,
  type EventItem,
  EventStatus,
  EventType,
  EventScale,
  EventLocationType,
} from "@/types/event";

dayjs.locale("zh-cn");

const { Title } = Typography;

const OfferPanel = lazy(() => import("@/components/event/edit/OfferPanel"));
const BenefitPanel = lazy(() => import("@/components/event/edit/BenefitPanel"));
const ParticipantPanel = lazy(() => import("@/components/event/edit/ParticipantPanel"));
const ParticipantEditor = lazy(() => import("@/components/event/edit/ParticipantEditor"));

export default function EventEditPage() {
  const { eventId, participantId } = useParams();
  const sectionMatch = useMatch("/dashboard/event/:eventId/:section/*");
  const section = sectionMatch?.params.section ?? "basic";
  const navigate = useNavigate();
  const { message } = App.useApp();
  const admin = isAdmin(useAuthStore((state) => state.user?.role));
  const {
    data: event,
    error,
    mutate,
  } = useSWR<EventItem, Error>(
    eventId ? ["event-detail", eventId] : null,
    () => EventAPI.getEventDetail({ id: eventId! }),
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  );
  const reloadEvent = async () => {
    const refreshed = await EventAPI.getEventDetail({ id: eventId! });
    await mutate(refreshed, { revalidate: false });
    return refreshed;
  };
  const loading = (
    <DefaultContainer>
      <Flex justify="center" align="center">
        <Spin aria-label="正在加载编辑内容" />
      </Flex>
    </DefaultContainer>
  );

  if (error) return <LoadError />;

  if (!eventId) {
    return (
      <div className="space-y-4">
        <DefaultContainer className="sticky top-0 z-20">
          <Title level={3} className="m-0">
            新建展会
          </Title>
        </DefaultContainer>
        <DefaultContainer>
          <EventEditorContent key="create" />
        </DefaultContainer>
      </div>
    );
  }

  const basePath = `/dashboard/event/${eventId}`;

  return (
    <div className="space-y-4">
      <DefaultContainer className="sticky top-0 z-20">
        <Flex justify="space-between" align="center" wrap gap={12}>
          <Space align="center">
            <Button
              type="text"
              aria-label="返回展会列表"
              icon={<IconArrowLeft size={18} />}
              onClick={() => {
                Promise.resolve(navigate("/dashboard/event")).catch((error: unknown) => {
                  message.error(apiErrorMessage(error));
                });
              }}
            />
            <div className="flex flex-col">
              <Space size={8} align="center">
                <Title level={3} className="m-0">
                  {event?.name ?? "编辑展会"}
                </Title>
                {event && (
                  <Tag color={event.isSuspended ? "red" : event.isPublished ? "green" : "default"}>
                    {event.isSuspended ? "平台暂停" : event.isPublished ? "已发布" : "已下架"}
                  </Tag>
                )}
              </Space>
              {event && (event.organizers.length > 0 || event.startAt) && (
                <Space size={12} wrap>
                  {event.organizers.length > 0 && (
                    <Typography.Text type="secondary">
                      {event.organizers.map(({ organization }) => organization.name).join("、")}
                    </Typography.Text>
                  )}
                  {event.startAt && (
                    <Typography.Text type="secondary">
                      {dayjs(event.startAt).format("YYYY年M月D日")}
                      {event.endAt ? ` 至 ${dayjs(event.endAt).format("M月D日")}` : ""}
                    </Typography.Text>
                  )}
                </Space>
              )}
            </div>
          </Space>
          {event && (
            <EventVisibility
              event={event}
              onChange={() => {
                reloadEvent().catch((error: unknown) => message.error(apiErrorMessage(error)));
              }}
            />
          )}
        </Flex>
      </DefaultContainer>
      {admin && (
        <nav aria-label="展会编辑导航">
          <Tabs
            activeKey={section === "basic" ? basePath : `${basePath}/${section}`}
            className="[&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav::before]:border-b-0"
            items={[
              { key: basePath, label: "基础资料" },
              { key: `${basePath}/offers`, label: "票档" },
              { key: `${basePath}/benefits`, label: "票档权益" },
              { key: `${basePath}/participants`, label: "参加者" },
            ]}
            onChange={(path) => {
              Promise.resolve(navigate(path)).catch((error: unknown) => {
                message.error(apiErrorMessage(error));
              });
            }}
          />
        </nav>
      )}
      {event ? (
        <Suspense key={eventId} fallback={loading}>
          {section === "offers" ? (
            <OfferPanel eventId={eventId} />
          ) : section === "benefits" ? (
            <BenefitPanel eventId={eventId} />
          ) : section === "participants" ? (
            participantId ? (
              <ParticipantEditor eventId={eventId} participantId={participantId} />
            ) : (
              <ParticipantPanel eventId={eventId} />
            )
          ) : (
            <DefaultContainer>
              <EventEditorContent event={event} onSaved={reloadEvent} />
            </DefaultContainer>
          )}
        </Suspense>
      ) : (
        loading
      )}
    </div>
  );
}

function EventEditorContent({
  event,
  onSaved,
}:
  | { event: EventItem; onSaved: () => Promise<EventItem> }
  | { event?: undefined; onSaved?: never }) {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const cleanedEvent = event ? pickBy(event, (v) => v !== "" && v != null) : {};

  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(
    event?.region ?? undefined,
  );

  const defaultStartAt = new Date(new Date().setHours(10, 0, 0, 0)).toISOString();
  const defaultEndAt = new Date(new Date().setHours(18, 0, 0, 0)).toISOString();

  const [form] = Form.useForm();

  const initialValues = {
    name: cleanedEvent.name,
    startAt: cleanedEvent.startAt
      ? dayjs(cleanedEvent.startAt)
      : event
        ? null
        : dayjs(defaultStartAt),
    endAt: cleanedEvent.endAt ? dayjs(cleanedEvent.endAt) : event ? null : dayjs(defaultEndAt),
    placeId: cleanedEvent.placeId,
    locationNotes: cleanedEvent.locationNotes,
    regionId: cleanedEvent.regionId,
    features: cleanedEvent.features || [],
    cover: cleanedEvent.cover || null,
    poster: cleanedEvent.poster || [],
    organizations:
      cleanedEvent.organizers?.map(({ organization, isPrimary }) => ({
        id: organization.id,
        isPrimary,
      })) ?? [],
    detail: cleanedEvent.detail,
    status: cleanedEvent.status || EventStatus.EventScheduled,
    type: cleanedEvent.type || EventType.AllInCon,
    scale: cleanedEvent.scale || EventScale.Cosy,
    locationType: cleanedEvent.locationType || EventLocationType.Hotel,
    sources: cleanedEvent.sources || [],
    ticketChannels: cleanedEvent.ticketChannels || [],
    extra: cleanedEvent.extra || {},
  };

  const [saving, setSaving] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  Form.useWatch([], form);
  const { allowNavigation, clearAllowedNavigation, confirmationModal } = useUnsavedChangesGuard({
    dirty: dirty || form.isFieldsTouched(),
    busy: saving || mediaUploading,
  });
  const onSubmit = async (value: EditableEvent) => {
    if (saving) return;
    setSaving(true);
    try {
      if (event) {
        await EventAPI.updateEvent(event.id, value);
        const refreshed = await onSaved();
        form.setFieldValue("features", refreshed.features);
        form.setFields(form.getFieldsError().map(({ name }) => ({ name, touched: false })));
        setDirty(false);
        message.success("已保存");
      } else {
        const res = await EventAPI.createEvent(value);
        message.success("活动已创建");
        const destination = `/dashboard/event/${res.id}`;
        allowNavigation(destination);
        await navigate(destination);
      }
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      clearAllowedNavigation();
      setSaving(false);
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    if (mediaUploading) {
      message.warning("请等待图片上传完成后再保存");
      return;
    }
    const processedValues = validateData(
      {
        ...value,
        startAt: value.startAt instanceof dayjs ? value.startAt.toISOString() : value.startAt,
        endAt: value.endAt instanceof dayjs ? value.endAt.toISOString() : value.endAt,
        features: (value.features || []).map((feature) => {
          const original = event?.features.find((item) => item.id === feature.id);
          return feature.id && (feature.isPublic || original?.name === feature.name)
            ? { id: feature.id }
            : { name: feature.name };
        }),
      },
      EditEventApiBody,
    );

    if (processedValues.errors.length > 0) {
      modal.warning({
        title: "接口数据校验失败",
        content: processedValues.prettyErrors,
      });
      return;
    }
    if (processedValues.values) {
      onSubmit(processedValues.values).catch((error: unknown) => {
        message.error(apiErrorMessage(error));
      });
    }
    return;
  };

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      onValuesChange={() => setDirty(true)}
      layout="vertical"
      initialValues={initialValues}
    >
      {confirmationModal}
      <BasicInfo organizations={event?.organizers.map(({ organization }) => organization) ?? []} />

      <Divider dashed size="small" />

      <GeographicInfo
        form={form}
        event={event}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />

      <Divider dashed size="small" />

      <EventAdditionalInfo />

      <Divider dashed size="small" />

      <EventSources form={form} />

      <Divider dashed size="small" />

      <TicketChannels form={form} />

      <Divider dashed size="small" />

      <EventMedia disabled={saving} onBusyChange={setMediaUploading} />

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={saving} disabled={mediaUploading}>
          {event?.id ? "保存" : "创建活动"}
        </Button>
      </Flex>
    </Form>
  );
}
