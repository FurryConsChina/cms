import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { pickBy, uniqBy } from "es-toolkit";
import useSWR from "swr";
import dayjs from "dayjs";
import { Button, Divider, Typography, Flex, App, Form, Spin } from "antd";
import { Organization } from "@/types/organization";
import { Region } from "@/types/region";
import { EditEventApiBody, EventAPI } from "@/api/dashboard/event";
import DefaultContainer from "@/components/Layout/Container";
import LoadError from "@/components/Layout/LoadError";
import { useZodValidateData } from "@/utils/form";

import BasicInfo from "./BasicInfo";
import GeographicInfo from "./GeographicInfo";
import UriBuilder from "./UriBuilder";
import EventAdditionalInfo from "./EventAdditionalInfo";
import EventSources from "./EventSources";
import TicketChannels from "./TicketChannels";
import EventMedia from "./EventMedia";

import "dayjs/locale/zh-cn";

import { type EditableEvent, EventItem, EventStatus, EventType, EventScale, EventLocationType } from "@/types/event";

dayjs.locale("zh-cn");

const { Title } = Typography;

export default function EventEditPage() {
  const { eventId } = useParams();

  const { data, isLoading, error } = useSWR(
    ["event-detail", eventId],
    eventId ? () => EventAPI.getEventDetail({ id: eventId as string }) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (error) {
    return <LoadError />;
  }

  return (
    <div className="relative">
      <DefaultContainer className="sticky top-0 z-20">
        <Title level={2} style={{ margin: 0 }}>
          {eventId ? "编辑展会" : "新建展会"}
        </Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Flex justify="center" align="center">
            <Spin />
          </Flex>
        ) : (
          <EventEditorContent event={data} />
        )}
      </DefaultContainer>
    </div>
  );
}

function EventEditorContent({ event }: { event?: EventItem }) {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const cleanedEvent = event ? pickBy(event, (v) => v !== "" && v != null) : {};

  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(event?.region);
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>(() => {
    return uniqBy([...(event?.organization ? [event.organization] : []), ...(event?.organizations || [])], (o) => o.id);
  });

  const defaultStartAt = new Date(new Date().setHours(10, 0, 0, 0)).toISOString();
  const defaultEndAt = new Date(new Date().setHours(18, 0, 0, 0)).toISOString();

  const [form] = Form.useForm();
  const slugValue = Form.useWatch("slug", form);
  const organizationId = Form.useWatch("organization", form);
  const organization = selectedOrganizations.find((o) => o.id === organizationId);

  const initialValues = {
    name: cleanedEvent.name,
    startAt: cleanedEvent.startAt ? dayjs(cleanedEvent.startAt) : dayjs(defaultStartAt),
    endAt: cleanedEvent.endAt ? dayjs(cleanedEvent.endAt) : dayjs(defaultEndAt),
    address: cleanedEvent.address,
    regionId: cleanedEvent.regionId,
    features: cleanedEvent.features?.self || [],
    featureIds: cleanedEvent.features?.common || [],
    source: cleanedEvent.source,
    thumbnail: cleanedEvent.thumbnail || "fec-event-default-cover.png",
    media: {
      images: cleanedEvent.media?.images || [],
      videos: cleanedEvent.media?.videos || [],
      lives: cleanedEvent.media?.lives || [],
    },
    organization: cleanedEvent.organization?.id,
    organizations: cleanedEvent.organizations?.map((o) => o.id) || [],
    slug: cleanedEvent.slug,
    detail: cleanedEvent.detail,
    status: cleanedEvent.status || EventStatus.EventScheduled,
    type: cleanedEvent.type || EventType.AllInCon,
    scale: cleanedEvent.scale || EventScale.Cosy,
    locationType: cleanedEvent.locationType || EventLocationType.Hotel,
    addressLat: cleanedEvent.addressLat,
    addressLon: cleanedEvent.addressLon,
    sources: cleanedEvent.sources || [],
    ticketChannels: cleanedEvent.ticketChannels || [],
    extra: cleanedEvent.extra || {},
  };

  const onSubmit = async (value: EditableEvent) => {
    try {
      if (event?.id) {
        await EventAPI.updateEvent(event.id, value);
        message.success("更新展会数据成功");
      } else {
        const res = await EventAPI.createEvent(value);
        message.success("创建展会数据成功");
        navigate(`/dashboard/event/${res.id}/edit`);
      }
    } catch (error) {
      message.error(`有错误发生: ${JSON.stringify(error)}`);
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    console.info("表单原始数据:", value);
    const processedValues = useZodValidateData(
      {
        ...value,
        startAt: value.startAt instanceof dayjs ? value.startAt.toISOString() : value.startAt,
        endAt: value.endAt instanceof dayjs ? value.endAt.toISOString() : value.endAt,
        features: {
          self: value.features || [],
        },
        featureIds: value.featureIds || [],
        organizations: [
          { id: value.organization, isPrimary: true },
          ...value.organizations.map((id) => ({
            id,
            isPrimary: false,
          })),
        ],
      },
      EditEventApiBody
    );

    if (processedValues.errors.length > 0) {
      return modal.warning({
        title: "接口数据校验失败☹️",
        content: processedValues.prettyErrors,
      });
    }
    if (processedValues.values) {
      return onSubmit(processedValues.values);
    }
    return;
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical" initialValues={initialValues}>
      <BasicInfo
        selectedOrganizations={selectedOrganizations}
        setSelectedOrganizations={(v) => setSelectedOrganizations(v || [])}
      />

      <Divider dashed size="small" />

      <GeographicInfo form={form} event={event} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />

      <Divider dashed size="small" />

      <UriBuilder form={form} selectedRegion={selectedRegion} />

      <Divider dashed size="small" />

      <EventAdditionalInfo form={form} event={event} />

      <Divider dashed size="small" />

      <EventSources form={form} />

      <Divider dashed size="small" />

      <TicketChannels form={form} />

      <Divider dashed size="small" />

      <EventMedia
        form={form}
        pathPrefix={`organizations/${organization?.slug}/${slugValue}/`}
        disabled={!organization?.slug || !slugValue}
      />

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Flex>
    </Form>
  );
}
