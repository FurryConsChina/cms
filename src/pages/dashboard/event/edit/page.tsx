import { useNavigate, useParams } from "react-router-dom";

import {
  type EditableEvent,
  EventItem,
  EditEventSchema,
  EventStatus,
  EventType,
  EventScale,
  EventLocationType,
} from "@/types/event";
import { Button, Divider, Typography, Flex, App, Form } from "antd";
import { Spin } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Organization } from "@/types/organization";
import { createEvent, getEventDetail, updateEvent } from "@/api/dashboard/event";

import "dayjs/locale/zh-cn";
import DefaultContainer from "@/components/Container";
import LoadError from "@/components/Error";
import { useState } from "react";
import { Region } from "@/types/region";

// 导入子组件
import BasicInfo from "./BasicInfo";
import GeographicInfo from "./GeographicInfo";
import UriBuilder from "./UriBuilder";
import EventAdditionalInfo from "./EventAdditionalInfo";
import EventSources from "./EventSources";
import TicketChannels from "./TicketChannels";
import EventMedia from "./EventMedia";
import useSWR from "swr";
import { InferZodType } from "@/types/common";

export default function EventEditPage() {
  const { eventId } = useParams();
  const isEditing = !!eventId;

  const {
    data: event,
    isLoading,
    error: isError,
  } = useSWR([`event-detail`, eventId], eventId ? () => getEventDetail({ id: eventId! }) : null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (isError) {
    return <LoadError />;
  }

  return (
    <div className="relative">
      <DefaultContainer className="sticky top-0 z-20">
        <h2 className="text-2xl font-bold">{eventId ? "编辑展会" : "新建展会"}</h2>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isEditing ? (
          isLoading ? (
            <Flex justify="center" align="center">
              <Spin />
            </Flex>
          ) : (
            <EventEditorContent event={event} />
          )
        ) : (
          <EventEditorContent />
        )}
      </DefaultContainer>
    </div>
  );
}

function EventEditorContent({ event }: { event?: EventItem }) {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(event?.region || null);

  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(event?.organization || null);

  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[] | null>(
    event?.organizations || null,
  );
  console.log("event", event);

  const form = useForm({
    defaultValues: {
      name: event?.name || "",
      startAt: event?.startAt ? event?.startAt : new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      endAt: event?.endAt ? event?.endAt : new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
      address: event?.address || "",
      regionId: event?.regionId || "",
      features: event?.features || { self: [], common: [] },
      source: event?.source || null,
      thumbnail: event?.thumbnail || "fec-event-default-cover.png",
      media: {
        images: event?.media?.images || [],
        videos: event?.media?.videos || [],
        lives: event?.media?.lives || [],
      },
      organization: event?.organization?.id,
      organizations: event?.organizations?.map((o) => o.id) || [],
      slug: event?.slug || "",
      detail: event?.detail || "",
      status: event?.status || EventStatus.EventScheduled,
      type: event?.type || EventType.AllInCon,
      scale: event?.scale || EventScale.Cosy,
      locationType: event?.locationType || EventLocationType.Hotel,
      addressLat: event?.addressLat || null,
      addressLon: event?.addressLon || null,
      sources: event?.sources || [],
      ticketChannels: event?.ticketChannels || [],
    },
    resolver: zodResolver(EditEventSchema),
  });

  const { handleSubmit, getValues } = form;
  console.log("getValues", getValues());

  const onSubmit = async (formData: InferZodType<typeof EditEventSchema>) => {
    try {
      const validatedData = EditEventSchema.parse(formData);
      const transFormData: EditableEvent = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        media: formData.media,
        name: validatedData.name,
        slug: validatedData.slug,
        organizations: [
          { id: validatedData.organization, isPrimary: true },
          ...validatedData.organizations.map((id) => ({
            id,
            isPrimary: false,
          })),
        ],
        featureIds: validatedData.featureIds,
        regionId: validatedData.regionId,
      };
      if (event?.id) {
        const res = await updateEvent(event.id, transFormData);
        if (res) {
          message.success("更新展会数据成功");
        }
      } else {
        const res = await createEvent(transFormData);
        if (res) {
          message.success("创建展会数据成功");
          navigate(`/dashboard/event/${res.id}/edit`);
        }
      }
    } catch (error) {
      message.error(`有错误发生: ${JSON.stringify(error)}`);
    }
  };

  return (
    <div>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <BasicInfo
          form={form}
          event={event}
          selectedOrganization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
          selectedOrganizations={selectedOrganizations}
          setSelectedOrganizations={setSelectedOrganizations}
        />

        <Divider dashed />

        <GeographicInfo
          form={form}
          event={event}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />

        <Divider dashed />

        <UriBuilder form={form} selectedRegion={selectedRegion} />

        <Divider dashed />

        <EventAdditionalInfo form={form} event={event} />

        <Divider dashed />

        <EventSources form={form} />

        <Divider dashed />

        <TicketChannels form={form} />

        <Divider dashed />

        <EventMedia
          form={form}
          pathPrefix={`organizations/${selectedOrganization?.slug}/${event?.slug}/`}
          disabled={!selectedOrganization?.slug || !event?.slug}
        />

        <div>
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Flex>
        </div>
      </Form>
    </div>
  );
}
