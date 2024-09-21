import { EventScaleLabel, EventStatusLabel } from "@/consts/event";
import "dayjs/locale/zh-cn";

import {
  EditableEventSchema,
  EditableEventType,
  EventScale,
  EventScaleKeyType,
  EventStatus,
  EventStatusKeyType,
  EventType,
} from "@/types/event";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Chip,
  Container,
  Divider,
  Fieldset,
  Group,
  Image,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Textarea,
  Title,
  rem,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconPhoto,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { OrganizationType } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import { getAllOrganizations } from "@/api/dashboard/organization";
import { createEvent, updateEvent } from "@/api/dashboard/event";
import { uploadStatic } from "@/api/dashboard/upload";
import { z } from "zod";
import { start } from "repl";

function EventEditor({
  event,
  opened,
  onClose,
}: {
  event?: EventType;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={event ? "编辑展会" : "新建展会"}
      centered
      size="xl"
    >
      <EventEditorContent event={event} onClose={onClose} />
    </Modal>
  );
}

function EventEditorContent({
  event,
  onClose,
}: {
  event?: EventType;
  onClose: () => void;
}) {
  console.log(event?.startAt);
  const form = useForm({
    initialValues: {
      name: event?.name || "",
      startAt: event?.startAt ? new Date(event?.startAt) : new Date(),
      endAt: event?.endAt ? new Date(event?.endAt) : new Date(),
      city: event?.addressExtra?.city || "",
      citySlug: event?.addressExtra?.citySlug || "",
      address: event?.address || "",
      addressExtra: event?.addressExtra || { city: null },
      features: event?.features || {},
      source: event?.source || "",
      thumbnail: event?.thumbnail || "fec-event-default-cover.png",
      poster: event?.poster?.all || [],
      organization: event?.organization?.id || "",
      slug: event?.slug || "",
      detail: event?.detail || "",
      status: event?.status || EventStatus.EventScheduled,
      scale: event?.scale || EventScale.Cosy,
      addressLat: event?.addressLat || "",
      addressLon: event?.addressLon || "",
    },
    validate: zodResolver(
      z.object({
        name: z.string().min(1),
        startAt: z.date(),
        endAt: z.date().nullable(),
        city: z.string(),
        citySlug: z.string(),
      })
    ),
    // validate: zodResolver(EditableEventSchema),
  });

  type formType = typeof form.values;

  const { data: organizationList } = useQuery({
    queryKey: ["organization-list"],
    queryFn: () => getAllOrganizations({ search: "" }),
  });

  const organizationSelectOptions = organizationList?.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const selectedOrganization = organizationList?.find(
    (item) => item.id == form.values.organization
  );

  const generateEventSlug = () => {
    const selectedYear = form.values.startAt?.getFullYear();
    const selectedMonth = form.values.startAt
      ?.toLocaleString("en-us", { month: "short" })
      .toLocaleLowerCase();
    const city = form.values.city;
    if (!selectedYear || !selectedMonth || !city) {
      return;
    }

    return `${selectedYear}-${selectedMonth}-${city}-con`;
  };

  const handleSubmit = async (formData: formType) => {
    console.log(formData);

    const transFormData: EditableEventType = {
      ...formData,
      startAt: formData.startAt.toISOString(),
      endAt: formData.endAt.toISOString(),
      poster: { all: formData.poster },
      addressExtra: {
        city: formData.city,
        citySlug: formData.citySlug,
      },
      organizations: [{ id: formData.organization, isPrimary: true }],
    };
    if (event?.id) {
      const res = await updateEvent({
        id: event.id,
        ...transFormData,
      });
      if (res) {
        onClose();
        notifications.show({
          title: "更新成功",
          message: "更新展会数据成功",
          color: "teal",
        });
      }
      console.log("update res", res);
    } else {
      const res = await createEvent(transFormData);
      console.log("create res", res);
      if (res) {
        onClose();
        notifications.show({
          title: "更新成功",
          message: "创建展会数据成功",
          color: "teal",
        });
      }
    }
  };

  return (
    <Box mx="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Container my="md">
          <Title order={5} my="sm">
            基础信息
          </Title>
          <Stack gap="xs">
            <TextInput
              withAsterisk
              label="展会名称"
              {...form.getInputProps("name")}
            />

            <Select
              label="展会展方"
              data={organizationSelectOptions}
              {...form.getInputProps("organization")}
            />

            <Group gap="xs" grow>
              <DateTimePicker
                withAsterisk
                valueFormat="YYYY年MM月DD日 hh:mm A"
                locale="zh-cn"
                label="开始日期"
                placeholder="Pick date"
                {...form.getInputProps("startAt")}
              />
              <DateTimePicker
                withAsterisk
                label="结束日期"
                locale="zh-cn"
                placeholder="Pick date"
                valueFormat="YYYY年MM月DD日 hh:mm A"
                {...form.getInputProps("endAt")}
              />
            </Group>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md">
          <Title order={5}>地理信息</Title>
          <Stack>
            <Group grow>
              <TextInput
                withAsterisk
                label="展会城市"
                {...form.getInputProps("city")}
              />

              <TextInput
                withAsterisk
                label="城市Slug"
                {...form.getInputProps("citySlug")}
              />
            </Group>

            <TextInput
              // withAsterisk
              label="展会地址"
              {...form.getInputProps("address")}
            />

            <Group gap="xs" grow>
              <NumberInput
                label="经度"
                placeholder="一般是三位整数"
                hideControls
                {...form.getInputProps("addressLon")}
              />

              <NumberInput
                label="纬度"
                placeholder="一般是两位整数"
                hideControls
                {...form.getInputProps("addressLat")}
              />
            </Group>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container>
          <Title order={5}>URI构建</Title>
          <Stack>
            <TextInput
              withAsterisk
              label="展会Slug"
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

        <Container my="md">
          <Title order={5}>展会附加信息</Title>
          <Stack>
            <Select
              label="展会状态"
              placeholder="Pick value"
              data={Object.keys(EventStatus).map((key) => ({
                label: EventStatusLabel[EventStatus[key as EventStatusKeyType]],
                value: EventStatus[key as EventStatusKeyType],
              }))}
              {...form.getInputProps("status")}
            />

            <Select
              label="展会规模"
              placeholder="Pick value"
              data={Object.keys(EventScale).map((key) => ({
                label: EventScaleLabel[EventScale[key as EventScaleKeyType]],
                value: EventScale[key as EventScaleKeyType],
              }))}
              {...form.getInputProps("scale")}
            />

            <TextInput
              // withAsterisk
              label="展会信源"
              {...form.getInputProps("source")}
            />

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

        <Container my="md">
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
                onClick={() => {
                  const organizationSlug = organizationList?.find(
                    (item) => item.id === form.values.organization
                  )?.slug;
                  form.setFieldValue(
                    "thumbnail",
                    `organizations/${organizationSlug}/${form.values.slug}/cover.webp`
                  );
                }}
              >
                通用格式
              </Chip>
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

              <UploadImgae
                pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
                defaultImageName="cover"
                onUploadSuccess={(s) => form.setFieldValue("thumbnail", s)}
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
                    <UploadImgae
                      pathPrefix={`organizations/${selectedOrganization?.slug}/${form.values.slug}/`}
                      defaultImageName={`details-${index + 1}`}
                      onUploadSuccess={(s) =>
                        form.setFieldValue(`poster.${index}`, s)
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

        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}

function UploadImgae({
  pathPrefix,
  defaultImageName,
  onUploadSuccess,
}: {
  pathPrefix: string;
  defaultImageName?: string;
  onUploadSuccess: (imagePath: string) => void;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<FileWithPath[]>([]);
  const [imageName, setImageName] = useState(() => {
    if (defaultImageName) {
      return `${defaultImageName}-${nanoid()}`;
    }
    return nanoid();
  });
  const [imageMIME, setImageMINE] = useState("");

  const previews = images.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Image
        alt={imageUrl}
        key={index}
        src={imageUrl}
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />
    );
  });

  const onUpload = async () => {
    try {
      setLoading(true);
      if (!images[0]) {
        setLoading(false);
        return notifications.show({
          message: "没有图片",
        });
      }

      let formData = new FormData();
      const imagePath = `${pathPrefix}${imageName}.${imageMIME}`;
      formData.append("imageKey", `${pathPrefix}${imageName}.${imageMIME}`);
      formData.append("image", images[0], images[0].name);
      const uploadRes = await uploadStatic(formData);
      // const uploadRes = await fetch("/api/upload-image", {
      //   cache: "no-cache",
      //   method: "POST",
      //   body: formData,
      // }).then((res) => res.json());
      console.log("uploadRes", uploadRes);
      if (uploadRes?.S3UploadRes?.ETag) {
        setLoading(false);
        onUploadSuccess(imagePath);
        notifications.show({
          message: "图片上传成功",
        });
        close();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={open}>上传</Button>
      <Modal
        opened={opened}
        onClose={close}
        title="上传图片"
        centered
        size="xl"
      >
        <Group wrap={"nowrap"} justify="flex-start" align="flex-start" gap="xl">
          <Stack style={{ width: "50%" }}>
            <Dropzone
              onDrop={(files) => {
                console.log("accepted files", files);
                setImages(files);
                if (files[0]) {
                  setImageMINE(files[0].type.replace("image/", ""));
                }
              }}
              onReject={(files) => console.log("rejected files", files)}
              maxSize={3 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}
              multiple={false}
            >
              <Group
                justify="center"
                gap="xl"
                // mih={220}
                style={{ pointerEvents: "none" }}
              >
                {images.length ? (
                  <SimpleGrid
                    cols={{ base: 1, sm: 4 }}
                    // mt={previews.length > 0 ? "xl" : 0}
                  >
                    {previews}
                  </SimpleGrid>
                ) : (
                  <>
                    <Dropzone.Accept>
                      <IconUpload
                        style={{
                          width: rem(52),
                          height: rem(52),
                          color: "var(--mantine-color-blue-6)",
                        }}
                        stroke={1.5}
                      />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconX
                        style={{
                          width: rem(52),
                          height: rem(52),
                          color: "var(--mantine-color-red-6)",
                        }}
                        stroke={1.5}
                      />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconPhoto
                        style={{
                          width: rem(52),
                          height: rem(52),
                          color: "var(--mantine-color-dimmed)",
                        }}
                        stroke={1.5}
                      />
                    </Dropzone.Idle>
                  </>
                )}
              </Group>
            </Dropzone>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              onPaste={(e) => {
                if (e.clipboardData.files.length) {
                  setImages([e.clipboardData.files[0]]);
                  if (e.clipboardData.files[0]) {
                    setImageMINE(
                      e.clipboardData.files[0].type.replace("image/", "")
                    );
                  }
                }
              }}
            >
              <Center>在这里粘贴</Center>
            </Card>
          </Stack>
          <Stack style={{ flexShrink: 0, width: "50%" }}>
            <TextInput
              description={`${pathPrefix}${imageName}.${imageMIME}`}
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
            />
            <Button loading={loading} onClick={onUpload}>
              上传
            </Button>
          </Stack>
        </Group>
      </Modal>
    </>
  );
}

export default EventEditor;
