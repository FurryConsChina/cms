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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Alert, Spin, Typography, Button, Flex, Divider, Row, Col, App, Form, Input, Select, DatePicker } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;

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
      <DefaultContainer className="sticky top-0 z-20">
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
  
  type OrganizationFormValues = {
    name: string;
    slug: string;
    description: string;
    creationTime: string;
    logoUrl: string;
    website: string;
    contactMail: string;
    status: string;
    twitter: string;
    weibo: string;
    bilibili: string;
    wikifur: string;
    qqGroup: string;
    rednote: string;
    facebook: string;
    plurk: string;
    extraMedia: {
      qqGroups: Array<{ label: string; value: string }>;
    };
    richMediaConfig: Record<string, unknown>;
    type: string;
  };

  const formMethods = useForm<OrganizationFormValues>({
    defaultValues: {
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
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, { message: "展商名称不能为空" }),
        slug: z.string().regex(/^[a-z0-9-]+$/, {
          message: "只允许小写英文字母、数字和连字符-",
        }),
      })
    ),
  });

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  // Create a compatible form object for child components
  const form = {
    register,
    setValue,
    watch,
    errors,
    values: watch(),
    setFieldValue: setValue,
    getInputProps: (name: string) => ({
      ...register(name),
      error: errors[name]?.message,
    }),
    onSubmit: (onValid: (values: OrganizationFormValues) => void, onInvalid?: (errors: typeof formMethods.formState.errors) => void) => {
      return rhfHandleSubmit(onValid, onInvalid);
    },
  };

  const handleSubmit = async (formData: OrganizationFormValues) => {
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
                <Form.Item
                  label="展商名称"
                  required
                  validateStatus={form.getInputProps("name").error ? "error" : undefined}
                  help={form.getInputProps("name").error}
                >
                  <Input
                    placeholder="请输入展商名称"
                    {...form.getInputProps("name")}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label="创立日期"
                  validateStatus={form.getInputProps("creationTime").error ? "error" : undefined}
                  help={form.getInputProps("creationTime").error}
                >
                  <DatePicker
                    format="YYYY年MM月DD日"
                    placeholder="请选择日期"
                    allowClear
                    style={{ width: "100%" }}
                    value={form.values.creationTime ? dayjs(form.values.creationTime) : null}
                    onChange={(date) => {
                      form.setFieldValue("creationTime", date ? date.toISOString() : null);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <Form.Item
                  label="展商状态"
                  required
                  validateStatus={form.getInputProps("status").error ? "error" : undefined}
                  help={form.getInputProps("status").error}
                >
                  <Select
                    placeholder="请选择展商状态"
                    options={Object.values(OrganizationStatus).map((status) => ({
                      label: OrganizationStatusLabel[status],
                      value: status,
                    }))}
                    value={form.values.status}
                    onChange={(value) => form.setFieldValue("status", value)}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label="展商类型"
                  required
                  validateStatus={form.getInputProps("type").error ? "error" : undefined}
                  help={form.getInputProps("type").error}
                >
                  <Select
                    placeholder="请选择展商类型"
                    options={Object.values(OrganizationType).map((type) => ({
                      label: OrganizationTypeLabel[type],
                      value: type,
                    }))}
                    value={form.values.type}
                    onChange={(value) => form.setFieldValue("type", value)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="展商Slug"
              required
              help="请不要使用大写"
              validateStatus={form.getInputProps("slug").error ? "error" : undefined}
            >
              <Input
                disabled={!!organization?.id}
                placeholder="请输入展商Slug"
                {...form.getInputProps("slug")}
              />
            </Form.Item>

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
                <Form.Item
                  label="网站"
                  validateStatus={form.getInputProps("website").error ? "error" : undefined}
                  help={form.getInputProps("website").error}
                >
                  <Input
                    placeholder="请输入网站链接"
                    {...form.getInputProps("website")}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label="联系邮箱"
                  validateStatus={form.getInputProps("contactMail").error ? "error" : undefined}
                  help={form.getInputProps("contactMail").error}
                >
                  <Input
                    placeholder="请输入邮箱地址"
                    {...form.getInputProps("contactMail")}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label="QQ群"
                  validateStatus={form.getInputProps("qqGroup").error ? "error" : undefined}
                  help={form.getInputProps("qqGroup").error}
                >
                  <Input
                    placeholder="请输入QQ群号"
                    {...form.getInputProps("qqGroup")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <Form.Item
                  label="Twitter"
                  validateStatus={form.getInputProps("twitter").error ? "error" : undefined}
                  help={form.getInputProps("twitter").error}
                >
                  <Input
                    placeholder="请输入Twitter链接"
                    {...form.getInputProps("twitter")}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label="Weibo"
                  validateStatus={form.getInputProps("weibo").error ? "error" : undefined}
                  help={form.getInputProps("weibo").error}
                >
                  <Input
                    placeholder="请输入微博链接"
                    {...form.getInputProps("weibo")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <Form.Item
                  label="Bilibili"
                  validateStatus={form.getInputProps("bilibili").error ? "error" : undefined}
                  help={form.getInputProps("bilibili").error}
                >
                  <Input
                    placeholder="请输入B站链接"
                    {...form.getInputProps("bilibili")}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label="Wikifur"
                  validateStatus={form.getInputProps("wikifur").error ? "error" : undefined}
                  help={form.getInputProps("wikifur").error}
                >
                  <Input
                    placeholder="请输入Wikifur链接"
                    {...form.getInputProps("wikifur")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <Form.Item
                  label="小红书"
                  validateStatus={form.getInputProps("rednote").error ? "error" : undefined}
                  help={form.getInputProps("rednote").error}
                >
                  <Input
                    placeholder="请输入小红书用户链接"
                    {...form.getInputProps("rednote")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col flex={1}>
                <Form.Item
                  label="Plurk"
                  validateStatus={form.getInputProps("plurk").error ? "error" : undefined}
                  help={form.getInputProps("plurk").error}
                >
                  <Input
                    placeholder="请输入Plurk用户链接"
                    {...form.getInputProps("plurk")}
                  />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label="Facebook"
                  validateStatus={form.getInputProps("facebook").error ? "error" : undefined}
                  help={form.getInputProps("facebook").error}
                >
                  <Input
                    placeholder="请输入Facebook链接"
                    {...form.getInputProps("facebook")}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Flex>
        </div>

        <Divider dashed style={{ margin: "12px 0" }} />

        <div style={{ padding: "0 24px" }}>
          <Title level={5}>展会附加信息</Title>
          <Flex vertical gap={8}>
            <Form.Item
              label="展商描述"
              help="可以是展商的自我简介之类的东西，不填也没关系。"
              validateStatus={form.getInputProps("description").error ? "error" : undefined}
            >
              <TextArea
                placeholder="请输入展商简介"
                autoSize={{ minRows: 5, maxRows: 20 }}
                {...form.getInputProps("description")}
              />
            </Form.Item>
          </Flex>
        </div>

        <Divider dashed style={{ margin: "12px 0" }} />

        <div style={{ padding: "0 24px" }}>
          <Title level={5}>展会媒体资源</Title>

          <Flex vertical gap={8}>
            <Form.Item
              label="展商标志图片"
              help="一般来说无需手动编辑，除非有两个组织的logo一致，可以直接复用另外一个组织的URL。"
              validateStatus={form.getInputProps("logoUrl").error ? "error" : undefined}
            >
              <Input
                placeholder="请输入展商标志图片URL"
                {...form.getInputProps("logoUrl")}
              />
            </Form.Item>
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
