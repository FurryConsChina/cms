import {
  createOrganization,
  getOrganizationDetail,
  updateOrganization,
} from "@/api/dashboard/organization";
import DefaultContainer from "@/components/Container";
import LoadError from "@/components/Error";
import UploadImage from "@/components/UploadImage";
import {
  EditableOrganizationSchema,
  OrganizationStatus,
  OrganizationStatusLabel,
  Organization,
  OrganizationTypeLabel,
  OrganizationType,
} from "@/types/organization";
import {
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { Alert, Spin, Typography, Button, Flex, Divider, Row, Col, App } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";

const { Title } = Typography;

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
  console.log(organization);

  if (isError) {
    return <LoadError />;
  }
  return (
    <div className="relative">
      <DefaultContainer className="sticky top-0 z-10">
        <Title level={2} style={{ margin: 0 }}>{organizationId ? "编辑展商" : "新建展商"}</Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Flex justify="center" align="center">
            <Spin />
          </Flex>
        ) : (
          <OrganizationEditorContent organization={organization} />
        )}
      </DefaultContainer>
    </div>
  );
}

function OrganizationEditorContent({
  organization,
}: {
  organization?: Organization;
}) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const form = useForm({
    initialValues: {
      name: organization?.name || "",
      slug: organization?.slug || "",
      description: organization?.description || "",
      creationTime: organization?.creationTime
        ? organization.creationTime
        : new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      logoUrl: organization?.logoUrl || "",
      website: organization?.website || "",
      contactMail: organization?.contactMail || "",
      status: organization?.status || OrganizationStatus.Active,
      twitter: organization?.twitter || "",
      weibo: organization?.weibo || "",
      bilibili: organization?.bilibili || "",
      wikifur: organization?.wikifur || "",
      qqGroup: organization?.qqGroup || "",
      rednote: organization?.rednote || "",
      facebook: organization?.facebook || "",
      plurk: organization?.plurk || "",
      extraMedia: organization?.extraMedia || {
        qqGroups: [],
      },
      richMediaConfig: organization?.richMediaConfig || {},
      type: organization?.type || OrganizationType.Agency,
    },
    validate: zodResolver(
      z.object({
        name: z.string().min(1, { message: "展商名称不能为空" }),
        slug: z.string().regex(/^[a-z0-9-]+$/, {
          message: "只允许小写英文字母、数字和连字符-",
        }),
      })
    ),
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
        ? new Date(formData.creationTime).toISOString()
        : undefined,
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
          message.success("更新展商数据成功");
        }
        console.log("update res", res);
      } else {
        const res = await createOrganization(validPayload);
        console.log("create res", res);
        if (res) {
          message.success("创建展商数据成功");
          navigate(`/dashboard/organization/${res.id}/edit`);
        }
      }
    } else {
      message.warning("数据校验不通过，请检查表单");
    }
  };

  return (
    <div style={{ margin: "0 auto" }}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div style={{ padding: "0 24px" }}>
          <Title level={5} style={{ margin: "12px 0" }}>
            基础信息
          </Title>
          <Flex vertical gap={8}>
            <Row gutter={8}>
              <Col flex={1}>
                <TextInput
                  withAsterisk
                  label="展商名称"
                  {...form.getInputProps("name")}
                />
              </Col>
              <Col flex={1}>
                <DatePickerInput
                  valueFormat="YYYY年MM月DD日"
                  label="创立日期"
                  placeholder="请选择日期"
                  clearable
                  locale="zh-cn"
                  {...form.getInputProps("creationTime")}
                />
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <Select
                  withAsterisk
                  label="展商状态"
                  data={Object.values(OrganizationStatus).map((status) => ({
                    label: OrganizationStatusLabel[status],
                    value: status,
                  }))}
                  {...form.getInputProps("status")}
                />
              </Col>
              <Col flex={1}>
                <Select
                  withAsterisk
                  label="展商类型"
                  data={Object.values(OrganizationType).map((type) => ({
                    label: OrganizationTypeLabel[type],
                    value: type,
                  }))}
                  {...form.getInputProps("type")}
                />
              </Col>
            </Row>

            <TextInput
              withAsterisk
              label="展商Slug"
              disabled={!!organization?.id}
              placeholder="请输入展商Slug"
              description="请不要使用大写"
              {...form.getInputProps("slug")}
            />

            <Flex gap={8}>
              <Alert
                type="info"
                message="Slug是展商的对外唯一标识，请谨慎选择，如果要修改请联系管理员。"
                style={{ borderRadius: 8 }}
              />
              <Alert
                type="error"
                message="不到万不得已，请勿使用拼音。 如果英文名称太长，使用-连字符。"
                style={{ borderRadius: 8 }}
              />
            </Flex>
          </Flex>
        </div>

        <Divider dashed style={{ margin: "12px 0" }} />

        <div style={{ padding: "0 24px" }}>
          <Title level={5}>媒体信息</Title>
          <Flex vertical gap={8}>
            <Row gutter={8}>
              <Col flex={1}>
                <TextInput
                  label="网站"
                  placeholder="请输入网站链接"
                  {...form.getInputProps("website")}
                />
              </Col>
              <Col flex={1}>
                <TextInput
                  label="联系邮箱"
                  placeholder="请输入邮箱地址"
                  {...form.getInputProps("contactMail")}
                />
              </Col>
              <Col flex={1}>
                <TextInput
                  label="QQ群"
                  placeholder="请输入QQ群号"
                  {...form.getInputProps("qqGroup")}
                />
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <TextInput
                  label="Twitter"
                  placeholder="请输入Twitter链接"
                  {...form.getInputProps("twitter")}
                />
              </Col>
              <Col flex={1}>
                <TextInput
                  label="Weibo"
                  placeholder="请输入微博链接"
                  {...form.getInputProps("weibo")}
                />
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <TextInput
                  label="Bilibili"
                  placeholder="请输入B站链接"
                  {...form.getInputProps("bilibili")}
                />
              </Col>
              <Col flex={1}>
                <TextInput
                  label="Wikifur"
                  placeholder="请输入Wikifur链接"
                  {...form.getInputProps("wikifur")}
                />
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <TextInput
                  label="小红书"
                  placeholder="请输入小红书用户链接"
                  {...form.getInputProps("rednote")}
                />
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <TextInput
                  label="Plurk"
                  placeholder="请输入Plurk用户链接"
                  {...form.getInputProps("plurk")}
                />
              </Col>
              <Col flex={1}>
                <TextInput
                  label="Facebook"
                  placeholder="请输入Facebook链接"
                  {...form.getInputProps("facebook")}
                />
              </Col>
            </Row>
          </Flex>
        </div>

        <Divider dashed style={{ margin: "12px 0" }} />

        <div style={{ padding: "0 24px" }}>
          <Title level={5}>展会附加信息</Title>
          <Flex vertical gap={8}>
            <Textarea
              label="展商描述"
              description="可以是展商的自我简介之类的东西，不填也没关系。"
              placeholder="请输入展商简介"
              autosize
              minRows={5}
              maxRows={20}
              {...form.getInputProps("description")}
            />
          </Flex>
        </div>

        <Divider dashed style={{ margin: "12px 0" }} />

        <div style={{ padding: "0 24px" }}>
          <Title level={5}>展会媒体资源</Title>

          <Flex vertical gap={8}>
            <TextInput
              label="展商标志图片"
              description="一般来说无需手动编辑，除非有两个组织的logo一致，可以直接复用另外一个组织的URL。"
              {...form.getInputProps("logoUrl")}
            />
            <Flex>
              <UploadImage
                pathPrefix={`organizations/${form.values.slug}/`}
                defaultImageName="logo"
                onUploadSuccess={(s) => form.setFieldValue("logoUrl", s)}
                disabled={!form.values.slug}
              />
            </Flex>
          </Flex>
        </div>

        <div style={{ padding: "0 24px" }}>
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit">保存</Button>
          </Flex>
        </div>
      </form>
    </div>
  );
}
