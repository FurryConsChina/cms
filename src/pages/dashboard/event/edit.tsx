import { apiErrorMessage } from "@/utils/apiError";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { pickBy } from "es-toolkit";
import useSWR from "swr";
import dayjs from "dayjs";
import { Button, Divider, Typography, Flex, App, Form, Spin } from "antd";
import { Region } from "@/types/region";
import { EditEventApiBody, EventAPI } from "@/api/cms/event";
import DefaultContainer from "@/components/layout/Container";
import LoadError from "@/components/layout/LoadError";
import { useZodValidateData as validateData } from "@/utils/form";

import BasicInfo from "./components/BasicInfo";
import GeographicInfo from "./components/GeographicInfo";
import EventAdditionalInfo from "./components/EventAdditionalInfo";
import EventSources from "./components/EventSources";
import TicketChannels from "./components/TicketChannels";
import EventMedia from "./components/EventMedia";

import "dayjs/locale/zh-cn";

import {
  type EditableEvent,
  EventItem,
  EventStatus,
  EventType,
  EventScale,
  EventLocationType,
} from "@/types/event";

dayjs.locale("zh-cn");

const { Title } = Typography;

export default function EventEditPage() {
  const { eventId } = useParams();

  const { data, isLoading, error, mutate } = useSWR<EventItem, Error>(
    ["event-detail", eventId],
    eventId ? () => EventAPI.getEventDetail({ id: eventId }) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (error) {
    return <LoadError />;
  }

  return (
    <div className="relative">
      <DefaultContainer className="sticky top-0 z-20">
        <Title level={3} className="m-0">
          {eventId ? "编辑展会" : "新建展会"}
        </Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Flex justify="center" align="center">
            <Spin />
          </Flex>
        ) : (
          <EventEditorContent
            key={eventId ?? "create"}
            event={data}
            reloadEvent={async () => {
              const refreshed = await EventAPI.getEventDetail({ id: eventId! });
              await mutate(refreshed, { revalidate: false });
              return refreshed;
            }}
          />
        )}
      </DefaultContainer>
    </div>
  );
}

function EventEditorContent({
  event,
  reloadEvent,
}: {
  event?: EventItem;
  reloadEvent: () => Promise<EventItem>;
}) {
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
  const onSubmit = async (value: EditableEvent) => {
    if (saving) return;
    setSaving(true);
    try {
      if (event?.id) {
        await EventAPI.updateEvent(event.id, value);
        const refreshed = await reloadEvent();
        form.setFieldValue("features", refreshed.features);
        message.success("已保存");
      } else {
        const res = await EventAPI.createEvent(value);
        message.success("活动已创建");
        void navigate(`/dashboard/event/${res.id}/edit`);
      }
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
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
      return modal.warning({
        title: "接口数据校验失败☹️",
        content: processedValues.prettyErrors,
      });
    }
    if (processedValues.values) {
      void onSubmit(processedValues.values);
    }
    return;
  };

  return (
    <Form
      form={form}
      onFinish={(value: typeof initialValues) => {
        void handleFinish(value);
      }}
      layout="vertical"
      initialValues={initialValues}
    >
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
