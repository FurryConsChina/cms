import {
  createOrganization,
  updateOrganization,
} from "@/api/dashboard/organization";
import { uploadStatic } from "@/api/dashboard/upload";
import {
  EditableOrganizationSchema,
  OrganizationStatus,
  OrganizationType,
} from "@/types/organization";
import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Image,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Textarea,
  Title,
  rem,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { pickBy } from "lodash";
import { useState } from "react";
import { z } from "zod";

function OrganizationEditor({
  organization,
  opened,
  onClose,
}: {
  organization?: OrganizationType;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={organization ? "编辑展商" : "新建展商"}
      centered
      size="xl"
    >
      <OrganizationEditorContent
        organization={organization}
        onClose={onClose}
      />
    </Modal>
  );
}

function OrganizationEditorContent({
  organization,
  onClose,
}: {
  organization?: OrganizationType;
  onClose: () => void;
}) {
  const form = useForm({
    initialValues: {
      name: organization?.name || "",
      slug: organization?.slug || "",
      description: organization?.description || "",
      creationTime: organization?.creationTime
        ? new Date(organization.creationTime)
        : null,
      logoUrl: organization?.logoUrl || "",
      website: organization?.website || "",
      contactMail: organization?.contactMail || "",
      status: organization?.status || "",
      twitter: organization?.twitter || "",
      weibo: organization?.weibo || "",
      bilibili: organization?.bilibili || "",
      wikifur: organization?.wikifur || "",
      qqGroup: organization?.qqGroup || "",
    },

    validate: {
      //   email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  type formType = typeof form.values;

  const handleSubmit = async (formData: formType) => {
    const validFormData = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) => value !== null && value !== ""
      )
    );
    const validResult = EditableOrganizationSchema.safeParse({
      ...validFormData,
      creationTime: formData.creationTime
        ? formData.creationTime.toISOString()
        : null,
    });
    const validPayload = validResult.data;

    console.log(formData, validResult);

    if (validPayload) {
      if (organization?.id) {
        const res = await updateOrganization({
          ...validPayload,
          id: organization.id,
        });
        if (res) {
          onClose();
          notifications.show({
            title: "更新成功",
            message: "更新展商数据成功",
            color: "teal",
          });
        }
        console.log("update res", res);
      } else {
        const res = await createOrganization(validPayload);
        console.log("create res", res);
        if (res) {
          onClose();
          notifications.show({
            title: "更新成功",
            message: "创建展商数据成功",
            color: "teal",
          });
        }
      }
    } else {
      notifications.show({
        title: "数据校验不通过",
        message: "请检查表单",
        color: "teal",
      });
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
            <Group justify="space-between" grow>
              <TextInput
                withAsterisk
                label="展会名称"
                {...form.getInputProps("name")}
              />

              <Select
                label="展会状态"
                data={Object.keys(OrganizationStatus).map((key) => ({
                  label: key,
                  value:
                    OrganizationStatus[key as keyof typeof OrganizationStatus],
                }))}
                {...form.getInputProps("status")}
              />

              <DatePickerInput
                withAsterisk
                valueFormat="YYYY年MM月DD日"
                label="开始日期"
                placeholder="Pick date"
                clearable
                {...form.getInputProps("creationTime")}
              />
            </Group>

            <TextInput
              withAsterisk
              label="展商Slug"
              {...form.getInputProps("slug")}
            />
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md">
          <Title order={5}>媒体信息</Title>
          <Stack>
            <Group grow>
              <TextInput
                withAsterisk
                label="网站"
                {...form.getInputProps("website")}
              />

              <TextInput
                withAsterisk
                label="联系邮箱"
                {...form.getInputProps("contactMail")}
              />

              <TextInput
                withAsterisk
                label="QQ群"
                {...form.getInputProps("qqGroup")}
              />
            </Group>

            <Group gap="xs" grow>
              <TextInput
                label="Twitter"
                placeholder="Hide controls"
                {...form.getInputProps("twitter")}
              />

              <TextInput
                label="Weibo"
                placeholder="Hide controls"
                {...form.getInputProps("weibo")}
              />
            </Group>

            <Group gap="xs" grow>
              <TextInput label="Bilibili" {...form.getInputProps("bilibili")} />

              <TextInput label="Wikifur" {...form.getInputProps("wikifur")} />
            </Group>
          </Stack>
        </Container>

        <Divider my="sm" variant="dotted" />

        <Container my="md">
          <Title order={5}>展会附加信息</Title>
          <Stack>
            {/* <Select
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

             */}

            <Textarea
              label="展商描述"
              description="Input description"
              placeholder="Input placeholder"
              autosize
              maxRows={20}
              {...form.getInputProps("description")}
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
              {...form.getInputProps("logoUrl")}
            />
            <Group>
              <UploadImgae
                pathPrefix={`organizations/${form.values.slug}/`}
                defaultImageName="logo"
                onUploadSuccess={(s) => form.setFieldValue("logoUrl", s)}
              />
            </Group>
          </Stack>
        </Container>

        <Group justify="flex-end" mt="md">
          <Button type="submit">保存</Button>
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
  const [imageName, setImageName] = useState(defaultImageName || "");
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

export default OrganizationEditor;
