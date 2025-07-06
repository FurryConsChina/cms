import { useNavigate, useParams } from "react-router-dom";

import {
  type EditableEvent,
  EventItem,
  EventLocationType,
  EventScale,
  type EventScaleKeyType,
  EventStatus,
  type EventStatusKeyType,
  EventType,
  EditEventValidationSchema,
} from "@/types/event";
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Fieldset,
  Group,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
  Text,
  Center,
  TagsInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { Organization } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import {
  createEvent,
  getEventDetail,
  updateEvent,
} from "@/api/dashboard/event";

import { zodResolver } from "mantine-form-zod-resolver";

import "dayjs/locale/zh-cn";
import {
  EventLocationTypeLabel,
  EventScaleLabel,
  EventStatusLabel,
  EventTypeLabel,
} from "@/consts/event";
import { Spin } from "antd";
import UploadImage from "@/components/UploadImage";
import DefaultContainer from "@/components/Container";
import LoadError from "@/components/Error";
import RegionSelector from "@/components/Region/RegionSelector";
import { useState } from "react";
import { Region } from "@/types/region";
import OrganizationSelector from "@/components/Organization/OrganizatonSelector";
import EventFeatureSelector from "@/components/EventFeature/EventFeatureSelector";
import LocationSearch from "@/components/Event/LocationSearch";
import { useDisclosure } from "@mantine/hooks";

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

  const [
    isLocationSearchModalOpen,
    { open: openLocationSearchModal, close: closeLocationSearchModal },
  ] = useDisclosure(false);

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
      poster: event?.poster?.all || [],
      organization: event?.organization?.id || null,
      organizations: event?.organizations?.map((o) => o.id) || [],
      slug: event?.slug || null,
      detail: event?.detail || null,
      status: event?.status || EventStatus.EventScheduled,
      type: event?.type || EventType.AllInCon,
      scale: event?.scale || EventScale.Cosy,
      locationType: event?.locationType || EventLocationType.Hotel,
      addressLat: event?.addressLat || null,
      addressLon: event?.addressLon || null,
      sources: event?.sources || [],
      ticketChannels: event?.ticketChannels || [],
    },
    validate: zodResolver(EditEventValidationSchema),
  });

  type InferFormValues = typeof form.values;

  const generateEventSlug = () => {
    const selectedYear = new Date(form.values.startAt).getFullYear();
    const selectedMonth = new Date(form.values.startAt)
      .toLocaleString("en-us", { month: "short" })
      .toLocaleLowerCase();
    const city = selectedRegion?.code;

    if (!selectedYear || !selectedMonth || !city) {
      notifications.show({
        message: "活动日期或活动地区没有选择",
        color: "red",
      });
      return;
    }

    return `${selectedYear}-${selectedMonth}-${city.toLowerCase()}-con`;
  };

  const handleSubmit = async (formData: InferFormValues) => {
    console.log(formData);

    try {
      const validatedData = EditEventValidationSchema.parse(formData);
      const transFormData: EditableEvent = {
        ...formData,
        startAt: formData.startAt,
        endAt: formData.endAt,
        poster: { all: formData.poster },

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
            autoClose: false,
          });
        }
      } else {
        const res = await createEvent(transFormData);
        if (res) {
          notifications.show({
            title: "创建成功",
            message: "创建展会数据成功",
            color: "teal",
            autoClose: false,
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
        <Container fluid>
          <Title order={5} my="sm">
            基础信息
          </Title>
          <Stack gap="xs">
            <TextInput
              withAsterisk
              label="展会名称"
              {...form.getInputProps("name")}
            />

            <Group gap="xs" grow>
              <OrganizationSelector
                required
                label="展会主办方"
                description="展会目前只能通过主办方的 slug 进行访问"
                onSelect={(value) => {
                  setSelectedOrganization(value as Organization | null);
                }}
                {...form.getInputProps("organization")}
              />
              <OrganizationSelector
                label="展会协办方"
                multiple
                description="可以选很多，但是请注意，主办方不能在协办方中"
                onSelect={(value) => {
                  setSelectedOrganizations(value as Organization[] | null);
                }}
                {...form.getInputProps("organizations")}
              />
            </Group>

            <Group gap="xs" grow>
              <DateTimePicker
                withAsterisk
                valueFormat="YYYY年MM月DD日 hh:mm A"
                locale="zh-cn"
                label="开始日期"
                description="除非明确知晓展会开始时间，否则请保持默认上午10点"
                placeholder="选一个日期"
                clearable
                {...form.getInputProps("startAt")}
              />
              <DateTimePicker
                withAsterisk
                label="结束日期"
                description="除非明确知晓展会结束时间，否则请保持默认下午6点"
                locale="zh-cn"
                placeholder="选一个日期"
                valueFormat="YYYY年MM月DD日 hh:mm A"
                clearable
                {...form.getInputProps("endAt")}
              />
            </Group>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md" fluid>
          <Title order={5} mb="sm">
            地理信息
          </Title>

          <Stack>
            <RegionSelector
              required
              label="展会区域"
              placeholder="请选择展会区域"
              selectedOption={event?.region}
              onSelect={(value) => {
                setSelectedRegion(value);
              }}
              {...form.getInputProps("regionId")}
            />

            <Autocomplete
              label="展会地址"
              rightSection={<IconSearch size="14" className="cursor-pointer" />}
              {...form.getInputProps("address")}
            />

            <Group gap="xs" grow>
              <TextInput
                label="经度"
                placeholder="一般是三位整数"
                {...form.getInputProps("addressLon")}
              />

              <TextInput
                label="纬度"
                placeholder="一般是两位整数"
                {...form.getInputProps("addressLat")}
              />
            </Group>

            <Button
              onClick={() => {
                if (!selectedRegion) {
                  notifications.show({
                    title: "请先选择展会区域",
                    message: "请先选择展会区域",
                    color: "red",
                  });
                  return;
                }
                openLocationSearchModal();
              }}
            >
              搜索地址
            </Button>
            <LocationSearch
              isModalOpen={isLocationSearchModalOpen}
              handleOk={(location) => {
                closeLocationSearchModal();
                if (location) {
                  form.setFieldValue(
                    "addressLat",
                    location.location.lat.toString()
                  );
                  form.setFieldValue(
                    "addressLon",
                    location.location.lng.toString()
                  );
                }
              }}
              handleCancel={() => {
                closeLocationSearchModal();
              }}
              region={selectedRegion!}
              keyword={form.values.address}
            />
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container fluid>
          <Title order={5}>URI构建</Title>
          <Stack>
            <TextInput
              withAsterisk
              label="展会Slug"
              disabled
              {...form.getInputProps("slug")}
            />
            <Button
              onClick={() => {
                const slug = generateEventSlug();
                if (!slug) {
                  return;
                }
                form.setFieldValue("slug", slug);
              }}
            >
              生成Slug
            </Button>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md" fluid>
          <Title order={5}>展会附加信息</Title>
          <Stack>
            <Select
              label="展会状态"
              withAsterisk
              placeholder="选一个"
              data={Object.keys(EventStatus).map((key) => ({
                label: EventStatusLabel[EventStatus[key as EventStatusKeyType]],
                value: EventStatus[key as EventStatusKeyType],
              }))}
              {...form.getInputProps("status")}
            />

            <Select
              label="展会规模"
              withAsterisk
              placeholder="选一个"
              data={Object.keys(EventScale).map((key) => ({
                label: EventScaleLabel[EventScale[key as EventScaleKeyType]],
                value: EventScale[key as EventScaleKeyType],
                disabled: ["Mega", "XXLarge"].includes(key),
              }))}
              {...form.getInputProps("scale")}
            />

            <Select
              label="展会类型"
              withAsterisk
              placeholder="选一个"
              data={Object.keys(EventType).map((key) => ({
                label: EventTypeLabel[EventType[key as keyof typeof EventType]],
                value: EventType[key as keyof typeof EventType],
              }))}
              {...form.getInputProps("type")}
            />

            <Select
              label="展会场地"
              withAsterisk
              placeholder="选一个"
              data={Object.keys(EventLocationType).map((key) => ({
                label:
                  EventLocationTypeLabel[
                    EventLocationType[key as keyof typeof EventLocationType]
                  ],
                value: EventLocationType[key as keyof typeof EventLocationType],
              }))}
              {...form.getInputProps("locationType")}
            />

            <TagsInput
              label="展会专属标签"
              placeholder="请输入展会专属的标签"
              {...form.getInputProps("features.self")}
            />

            <EventFeatureSelector
              label="展会公共标签"
              placeholder="请选择展会共有的标签"
              {...form.getInputProps("featureIds")}
            />

            <TextInput label="展会信源" {...form.getInputProps("source")} />

            <Textarea
              label="展会描述"
              autosize
              minRows={5}
              maxRows={20}
              {...form.getInputProps("detail")}
            />
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md" fluid>
          <Title order={5}>展会信息来源</Title>
          <Stack>
            <Group>
              <ActionIcon
                size="sm"
                onClick={() =>
                  form.setFieldValue("sources", [
                    ...(form.values.sources || []),
                    { name: "", url: "", description: "" },
                  ])
                }
              >
                <IconPlus />
              </ActionIcon>
              <Text size="sm" c="dimmed">
                添加信息来源
              </Text>
            </Group>

            {(form.values.sources || []).map((source, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <Fieldset legend={`信息来源 ${index + 1}`}>
                  <Group align="flex-end">
                    <TextInput
                      style={{ flexGrow: 1 }}
                      label="名称"
                      placeholder="信息来源名称"
                      {...form.getInputProps(`sources.${index}.name`)}
                    />
                    <TextInput
                      style={{ flexGrow: 1 }}
                      label="链接"
                      placeholder="信息来源链接"
                      {...form.getInputProps(`sources.${index}.url`)}
                    />
                    <TextInput
                      style={{ flexGrow: 1 }}
                      label="描述"
                      placeholder="信息来源描述（可选）"
                      {...form.getInputProps(`sources.${index}.description`)}
                    />
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          if (index > 0) {
                            const items = [...(form.values.sources || [])];
                            [items[index], items[index - 1]] = [
                              items[index - 1],
                              items[index],
                            ];
                            form.setFieldValue("sources", items);
                          }
                        }}
                        disabled={index === 0}
                      >
                        <IconArrowUp size="14" />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          const items = [...(form.values.sources || [])];
                          if (index < items.length - 1) {
                            [items[index], items[index + 1]] = [
                              items[index + 1],
                              items[index],
                            ];
                            form.setFieldValue("sources", items);
                          }
                        }}
                        disabled={
                          index === (form.values.sources || []).length - 1
                        }
                      >
                        <IconArrowDown size="14" />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        color="red"
                        onClick={() =>
                          form.setFieldValue(
                            "sources",
                            (form.values.sources || []).filter(
                              (_, i) => i !== index
                            )
                          )
                        }
                      >
                        <IconTrash size="14" />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Fieldset>
              </div>
            ))}
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md" fluid>
          <Title order={5}>票务渠道</Title>
          <Stack>
            <Group>
              <ActionIcon
                size="sm"
                onClick={() =>
                  form.setFieldValue("ticketChannels", [
                    ...(form.values.ticketChannels || []),
                    {
                      type: "url",
                      name: "",
                      url: "",
                      available: true,
                    },
                  ])
                }
              >
                <IconPlus />
              </ActionIcon>
              <Text size="sm" c="dimmed">
                添加票务渠道
              </Text>
            </Group>

            {(form.values.ticketChannels || []).map((channel, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <Fieldset legend={`票务渠道 ${index + 1}`}>
                  <Stack gap="xs">
                    <Group align="flex-end">
                      <Select
                        style={{ flexGrow: 1 }}
                        label="渠道类型"
                        placeholder="选择渠道类型"
                        data={[
                          { label: "微信小程序", value: "wxMiniProgram" },
                          { label: "网页链接", value: "url" },
                          { label: "二维码", value: "qrcode" },
                          { label: "APP", value: "app" },
                        ]}
                        {...form.getInputProps(`ticketChannels.${index}.type`)}
                      />
                      <TextInput
                        style={{ flexGrow: 1 }}
                        label="渠道名称"
                        placeholder="票务渠道名称"
                        {...form.getInputProps(`ticketChannels.${index}.name`)}
                      />
                      <TextInput
                        style={{ flexGrow: 1 }}
                        label="链接/地址/图片地址"
                        placeholder="渠道链接或地址或图片地址"
                        {...form.getInputProps(`ticketChannels.${index}.url`)}
                      />
                      <Select
                        style={{ flexGrow: 1 }}
                        label="可用状态"
                        placeholder="选择状态"
                        data={[
                          { label: "可用", value: "true" },
                          { label: "不可用", value: "false" },
                        ]}
                        value={
                          form.values.ticketChannels?.[
                            index
                          ]?.available?.toString() || "true"
                        }
                        onChange={(value) => {
                          const boolValue =
                            value === "true"
                              ? true
                              : value === "false"
                              ? false
                              : null;
                          form.setFieldValue(
                            `ticketChannels.${index}.available`,
                            boolValue
                          );
                        }}
                      />
                    </Group>
                    <Group justify="flex-end">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          if (index > 0) {
                            const items = [
                              ...(form.values.ticketChannels || []),
                            ];
                            [items[index], items[index - 1]] = [
                              items[index - 1],
                              items[index],
                            ];
                            form.setFieldValue("ticketChannels", items);
                          }
                        }}
                        disabled={index === 0}
                      >
                        <IconArrowUp size="14" />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          const items = [...(form.values.ticketChannels || [])];
                          if (index < items.length - 1) {
                            [items[index], items[index + 1]] = [
                              items[index + 1],
                              items[index],
                            ];
                            form.setFieldValue("ticketChannels", items);
                          }
                        }}
                        disabled={
                          index ===
                          (form.values.ticketChannels || []).length - 1
                        }
                      >
                        <IconArrowDown size="14" />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        color="red"
                        onClick={() =>
                          form.setFieldValue(
                            "ticketChannels",
                            (form.values.ticketChannels || []).filter(
                              (_, i) => i !== index
                            )
                          )
                        }
                      >
                        <IconTrash size="14" />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Fieldset>
              </div>
            ))}
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md" fluid>
          <Title order={5}>展会媒体资源</Title>

          <Stack justify="flex-start" gap="xs">
            <TextInput
              label="封面图片"
              withAsterisk
              {...form.getInputProps("thumbnail")}
            />
            <Group>
              <Chip
                checked={false}
                variant="filled"
                onClick={() =>
                  form.setFieldValue("thumbnail", "fec-event-default-cover.png")
                }
              >
                默认图片
              </Chip>
              <Chip
                checked={false}
                variant="filled"
                onClick={() =>
                  form.setFieldValue("thumbnail", "fec-event-blank-cover.png")
                }
              >
                待揭晓图片
              </Chip>

              <Chip
                checked={false}
                variant="filled"
                onClick={() =>
                  form.setFieldValue("thumbnail", "fec-event-cancel-cover.png")
                }
              >
                取消图片
              </Chip>

              <UploadImage
                pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
                defaultImageName="cover"
                onUploadSuccess={(s) => form.setFieldValue("thumbnail", s)}
                disabled={!selectedOrganization?.slug || !form.values.slug}
              />
            </Group>

            <Group>
              <Fieldset w="100%" legend="展会详情图片">
                <ActionIcon
                  size={"sm"}
                  onClick={() =>
                    form.setFieldValue(
                      "poster",
                      form.values.poster.concat([""])
                    )
                  }
                >
                  <IconPlus />
                </ActionIcon>
                {form.values.poster.map((item, index) => (
                  <Group align="flex-end" key={index}>
                    <TextInput
                      style={{ flexGrow: 1 }}
                      label={`展会详情图片 ${index + 1}`}
                      {...form.getInputProps(`poster.${index}`)}
                    />
                    <UploadImage
                      pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
                      defaultImageName={`details-${index + 1}`}
                      onUploadSuccess={(s) =>
                        form.setFieldValue(`poster.${index}`, s)
                      }
                      disabled={
                        !selectedOrganization?.slug || !form.values.slug
                      }
                    />
                    <Button
                      color="red"
                      size={"sm"}
                      onClick={() =>
                        form.setFieldValue(
                          "poster",
                          form.values.poster.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <IconTrash />
                    </Button>
                  </Group>
                ))}
              </Fieldset>
            </Group>
          </Stack>
        </Container>

        <Container fluid>
          <Group justify="flex-end" mt="md">
            <Button type="submit">提交</Button>
          </Group>
        </Container>
      </form>
    </Box>
  );
}
