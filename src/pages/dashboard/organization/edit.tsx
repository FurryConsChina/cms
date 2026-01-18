import { EditOrganizationApiBody, OrganizationAPI } from "@/api/dashboard/organization";
import DefaultContainer from "@/components/Layout/Container";
import LoadError from "@/components/Layout/LoadError";
import UploadImage from "@/components/UploadImage";
import { InferZodType } from "@/types/common";
import {
  Organization,
  OrganizationStatus,
  OrganizationStatusLabel,
  OrganizationType,
  OrganizationTypeLabel,
} from "@/types/organization";
import { useZodValidateData } from "@/utils/form";
import { Alert, App, Button, Col, DatePicker, Divider, Flex, Form, Input, Row, Select, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { pickBy } from "es-toolkit";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";

const { Title } = Typography;
const { TextArea } = Input;

export default function OrganizationEditPage() {
  const { organizationId } = useParams();

  const { data, isLoading, error } = useSWR(
    ["organization-detail", organizationId],
    organizationId ? () => OrganizationAPI.getOrganizationDetail({ id: organizationId as string }) : null,
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
          {organizationId ? "编辑展商" : "新建展商"}
        </Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Flex justify="center" align="center">
            <Spin />
          </Flex>
        ) : (
          <OrganizationEditorContent organization={data} />
        )}
      </DefaultContainer>
    </div>
  );
}

function OrganizationEditorContent({ organization }: { organization?: Organization }) {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const cleanedOrganization = organization ? pickBy(organization, (v) => v !== "" && v != null) : {};

  const [form] = Form.useForm();
  const slugValue = Form.useWatch("slug", form);

  const initialValues = {
    name: cleanedOrganization.name,
    slug: cleanedOrganization.slug,
    description: cleanedOrganization.description,
    status: cleanedOrganization.status,
    type: cleanedOrganization.type,
    logoUrl: cleanedOrganization.logoUrl,
    richMediaConfig: cleanedOrganization.richMediaConfig,
    contactMail: cleanedOrganization.contactMail,
    website: cleanedOrganization.website,
    twitter: cleanedOrganization.twitter,
    weibo: cleanedOrganization.weibo,
    qqGroup: cleanedOrganization.qqGroup,
    bilibili: cleanedOrganization.bilibili,
    rednote: cleanedOrganization.rednote,
    wikifur: cleanedOrganization.wikifur,
    facebook: cleanedOrganization.facebook,
    plurk: cleanedOrganization.plurk,
    extraMedia: cleanedOrganization.extraMedia,
    creationTime: cleanedOrganization.creationTime ? dayjs(cleanedOrganization.creationTime) : undefined,
  };

  const onSubmit = async (value: InferZodType<typeof EditOrganizationApiBody>) => {
    try {
      if (organization?.id) {
        await OrganizationAPI.updateOrganization(organization.id, value);
        message.success("更新展商数据成功");
      } else {
        const res = await OrganizationAPI.createOrganization(value);
        message.success("创建展商数据成功");
        navigate(`/dashboard/organization/${res.id}/edit`);
      }
    } catch (error) {
      message.error(`有错误发生: ${JSON.stringify(error)}`);
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    const processedValues = useZodValidateData(
      {
        ...value,
        creationTime: value.creationTime ? value.creationTime.toISOString() : undefined,
      },
      EditOrganizationApiBody
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
      <div>
        <Title level={5} style={{ margin: "12px 0" }}>
          基础信息
        </Title>
        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item label="展商名称" required name="name" rules={[{ required: true, message: "请输入展商名称" }]}>
              <Input placeholder="请输入展商名称" />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item label="创立日期" name="creationTime">
              <DatePicker format="YYYY年MM月DD日" placeholder="请选择日期" allowClear style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item label="展商状态" required name="status">
              <Select
                placeholder="请选择展商状态"
                options={Object.values(OrganizationStatus).map((status) => ({
                  label: OrganizationStatusLabel[status],
                  value: status,
                }))}
              />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item label="展商类型" required name="type">
              <Select
                placeholder="请选择展商类型"
                options={Object.values(OrganizationType).map((type) => ({
                  label: OrganizationTypeLabel[type],
                  value: type,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="展商Slug" required extra="请不要使用大写" name="slug">
          <Input disabled={!!organization?.id} placeholder="请输入展商Slug" />
        </Form.Item>

        <Flex gap={8}>
          <Alert type="info" title="Slug是展商的对外唯一标识，请谨慎选择，如果要修改请联系管理员。" />
          <Alert type="error" title="不到万不得已，请勿使用拼音。 如果英文名称太长，使用-连字符。" />
        </Flex>
      </div>

      <Divider dashed />

      <div>
        <Title level={5}>展商附加信息</Title>
        <Flex vertical gap={8}>
          <Form.Item label="展商描述" extra="可以是展商的自我简介之类的东西，不填也没关系。" name="description">
            <TextArea placeholder="请输入展商简介" autoSize={{ minRows: 10 }} />
          </Form.Item>
        </Flex>
      </div>

      <div>
        <Title level={5}>媒体信息</Title>
        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item label="网站" name="website" rules={[{ type: "url", message: "请输入正确的网站链接" }]}>
              <Input placeholder="请输入网站链接" />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item label="联系邮箱" name="contactMail" rules={[{ type: "email", message: "请输入正确的邮箱地址" }]}>
              <Input placeholder="请输入邮箱地址" />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item label="QQ群" name="qqGroup">
              <Input placeholder="请输入QQ群号" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item label="Twitter" name="twitter" rules={[{ type: "url", message: "请输入正确的Twitter链接" }]}>
              <Input placeholder="请输入Twitter链接" />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item label="Weibo" name="weibo" rules={[{ type: "url", message: "请输入正确的微博链接" }]}>
              <Input placeholder="请输入微博链接" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item label="Bilibili" name="bilibili" rules={[{ type: "url", message: "请输入正确的B站链接" }]}>
              <Input placeholder="请输入B站链接" />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item label="Wikifur" name="wikifur" rules={[{ type: "url", message: "请输入正确的Wikifur链接" }]}>
              <Input placeholder="请输入Wikifur链接" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item label="小红书" name="rednote">
              <Input placeholder="请输入小红书用户链接" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item label="Plurk" name="plurk" rules={[{ type: "url", message: "请输入正确的Plurk链接" }]}>
              <Input placeholder="请输入Plurk用户链接" />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item label="Facebook" name="facebook" rules={[{ type: "url", message: "请输入正确的Facebook链接" }]}>
              <Input placeholder="请输入Facebook链接" />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Divider dashed />

      <div>
        <Title level={5}>展会媒体资源</Title>

        <Flex vertical>
          <Form.Item
            label="展商标志图片"
            extra="一般来说无需手动编辑，除非有两个组织的logo一致，可以直接复用另外一个组织的URL。"
            name="logoUrl"
          >
            <Input placeholder="请输入展商标志图片URL" />
          </Form.Item>
          <UploadImage
            pathPrefix={`organizations/${slugValue}/`}
            defaultImageName="logo"
            onUploadSuccess={(s) => form.setFieldValue("logoUrl", s)}
            disabled={!slugValue}
          />
        </Flex>
      </div>

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Flex>
    </Form>
  );
}
