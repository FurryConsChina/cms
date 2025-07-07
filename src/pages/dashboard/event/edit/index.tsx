import { useNavigate, useParams } from "react-router-dom";

import {
  type EditableEvent,
  EventItem,
  EditEventValidationSchema,
} from "@/types/event";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Title,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Organization } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import {
  createEvent,
  getEventDetail,
  updateEvent,
} from "@/api/dashboard/event";

import { zodResolver } from "mantine-form-zod-resolver";

import "dayjs/locale/zh-cn";
import { Spin } from "antd";
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

export default function EventEditPage() {
  const { eventId } = useParams();
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event-detail", eventId],
    queryFn: () => getEventDetail({ id: eventId as string }),
    refetchOnWindowFocus: false,
    enabled: !!eventId,
    gcTime: 0,
  });

  if (isError) {
    return <LoadError />;
  }

  return (
    <div className="relative">
      <DefaultContainer className="sticky top-0 z-10">
        <Title order={2}>{eventId ? "编辑展会" : "新建展会"}</Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Center>
            <Spin />
          </Center>
        ) : (
          <EventEditorContent event={event} />
        )}
      </DefaultContainer>
    </div>
  );
}

function EventEditorContent({ event }: { event?: EventItem }) {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(
    event?.region || null
  );

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(event?.organization || null);

  const [selectedOrganizations, setSelectedOrganizations] = useState<
    Organization[] | null
  >(event?.organizations || null);

  const form = useForm({
    initialValues: {
      name: event?.name || "",
      startAt: event?.startAt
        ? event?.startAt
        : new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      endAt: event?.endAt
        ? event?.endAt
        : new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
      address: event?.address || "",
      regionId: event?.regionId || null,
      features: event?.features || { self: [] },
      featureIds: event?.commonFeatures?.map((f) => f.id) || [],
      source: event?.source || null,
      thumbnail: event?.thumbnail || "fec-event-default-cover.png",
      media: {
        images: event?.media?.images || [],
        videos: event?.media?.videos || [],
        lives: event?.media?.lives || [],
      },
      organization: event?.organization?.id || null,
      organizations: event?.organizations?.map((o) => o.id) || [],
      slug: event?.slug || null,
      detail: event?.detail || null,
      status: event?.status || "EventScheduled",
      type: event?.type || "AllInCon",
      scale: event?.scale || "Cosy",
      locationType: event?.locationType || "Hotel",
      addressLat: event?.addressLat || null,
      addressLon: event?.addressLon || null,
      sources: event?.sources || [],
      ticketChannels: event?.ticketChannels || [],
    },
    validate: zodResolver(EditEventValidationSchema),
  });

  type InferFormValues = typeof form.values;

  const handleSubmit = async (formData: InferFormValues) => {
    console.log(formData);

    try {
      const validatedData = EditEventValidationSchema.parse(formData);
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
          notifications.show({
            title: "更新成功",
            message: "更新展会数据成功",
            color: "teal",
          });
        }
      } else {
        const res = await createEvent(transFormData);
        if (res) {
          notifications.show({
            title: "创建成功",
            message: "创建展会数据成功",
            color: "teal",
          });
          navigate(`/dashboard/event/${res.id}/edit`);
        }
      }
    } catch (error) {
      notifications.show({
        title: "有错误发生",
        message: JSON.stringify(error),
        color: "red",
      });
    }
  };

  return (
    <Box mx="auto">
      <form
        onSubmit={form.onSubmit(handleSubmit, (errors) => {
          notifications.show({
            title: "有错误发生",
            message: JSON.stringify(errors),
            color: "red",
          });
        })}
      >
        <BasicInfo
          form={form}
          event={event}
          selectedOrganization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
          selectedOrganizations={selectedOrganizations}
          setSelectedOrganizations={setSelectedOrganizations}
        />

        <Divider my="sm" variant="dotted" />

        <GeographicInfo
          form={form}
          event={event}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />

        <Divider my="sm" variant="dotted" />

        <UriBuilder form={form} selectedRegion={selectedRegion} />

        <Divider my="sm" variant="dotted" />

        <EventAdditionalInfo form={form} event={event} />

        <Divider my="sm" variant="dotted" />

        <EventSources form={form} />

        <Divider my="sm" variant="dotted" />

        <TicketChannels form={form} />

        <Divider my="sm" variant="dotted" />

        <EventMedia
          form={form}
          event={event}
          selectedOrganization={selectedOrganization}
        />

        <Container fluid>
          <Group justify="flex-end" mt="md">
            <Button type="submit">提交</Button>
          </Group>
        </Container>
      </form>
    </Box>
  );
}
