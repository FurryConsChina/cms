import {
  createOrganization,
  getOrganizationDetail,
  updateOrganization,
} from "@/api/dashboard/organization";
import DefaultContainer from "@/components/Container";
import UploadImage from "@/components/UploadImage";
import {
  EditableOrganizationSchema,
  OrganizationStatus,
  type OrganizationType,
} from "@/types/organization";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { useParams } from "react-router-dom";

export default function OrganizationEditPage() {
  const { organizationId } = useParams();
  const {
    data: organization,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organization-detail", organizationId],
    queryFn: () => getOrganizationDetail({ id: organizationId as string }),
    refetchOnWindowFocus: false,
    enabled: !!organizationId,
  });

  console.log(isError);

  if (isError) {
    return <div>Hmm... something went wrong.</div>;
  }
  return (
    <div className="relative">
      <DefaultContainer className="shadow sticky top-0 z-10">
        <Title order={2}>{organizationId ? "编辑展商" : "新建展商"}</Title>
      </DefaultContainer>

      {isLoading ? (
        <Spin />
      ) : (
        <DefaultContainer className="mt-4">
          <OrganizationEditorContent organization={organization} />
        </DefaultContainer>
      )}
    </div>
  );
}

function OrganizationEditorContent({
  organization,
}: {
  organization?: OrganizationType;
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
              <UploadImage
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
