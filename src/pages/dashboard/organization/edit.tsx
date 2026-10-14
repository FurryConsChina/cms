import { useState } from "react";
import useAuthStore from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import MediaPicker from "@/components/Cms/MediaPicker";
import { LinkFields } from "@/components/Cms/Fields";
import { apiErrorMessage } from "@/utils/apiError";
import { EditOrganizationApiBody, OrganizationAPI } from "@/api/dashboard/organization";
import DefaultContainer from "@/components/Layout/Container";
import LoadError from "@/components/Layout/LoadError";
import type { MediaBinding } from "@/types/media";
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
    },
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

function OrganizationEditorContent({ organization }: { organization?: Organization & { logo?: MediaBinding | null } }) {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const admin = isAdmin(useAuthStore((state) => state.user?.role));
  const cleanedOrganization = organization ? pickBy(organization, (v) => v !== "" && v != null) : {};

  const [form] = Form.useForm();

  const initialValues = {
    name: cleanedOrganization.name,
    slug: cleanedOrganization.slug,
    description: cleanedOrganization.description,
    status: cleanedOrganization.status || OrganizationStatus.Active,
    type: cleanedOrganization.type,
    logo: cleanedOrganization.logo || null,
    contactMail: cleanedOrganization.contactMail,
    links: cleanedOrganization.links || [],
    foundedOn: cleanedOrganization.foundedOn ? dayjs(cleanedOrganization.foundedOn) : undefined,
  };

  const [saving, setSaving] = useState(false);
  const onSubmit = async (value: InferZodType<typeof EditOrganizationApiBody>) => {
    if (saving) return;
    setSaving(true);
    try {
      if (organization?.id) {
        await OrganizationAPI.updateOrganization(organization.id, value);
        message.success("更新展商数据成功");
      } else {
        const res = await OrganizationAPI.createOrganization(value);
        message.success("组织创建成功");
        navigate(`/dashboard/organization/${res.id}/edit`);
      }
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    const processedValues = useZodValidateData(
      {
        ...value,
        foundedOn: value.foundedOn ? value.foundedOn.format("YYYY-MM-DD") : null,
      },
      EditOrganizationApiBody,
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
            <Form.Item label="创立日期" extra={!organization && !admin ? "创建后可编辑" : undefined} name="foundedOn">
              <DatePicker
                disabled={!organization && !admin}
                format="YYYY年MM月DD日"
                placeholder="请选择日期"
                allowClear
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item label="展商状态" required name="status">
              <Select
                disabled={!organization && !admin}
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

        <Form.Item
          label="展商Slug"
          required
          extra="请不要使用大写"
          name="slug"
          rules={[
            { required: true },
            ...(!organization && !admin ? [{ min: 2, message: "标识至少需要两个字符" }] : []),
          ]}
        >
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

      <Form.Item label="联系邮箱" name="contactMail" rules={[{ type: "email", message: "邮箱格式不正确" }]}>
        <Input />
      </Form.Item>
      <LinkFields label="社交链接与联系方式" />

      <Divider dashed />

      <div>
        <Title level={5}>展会媒体资源</Title>

        <Flex vertical>
          <Form.Item label="组织标志图片" name="logo">
            <MediaPicker
              owner={organization?.id ? { entityType: "organization", entityId: organization.id } : undefined}
            />
          </Form.Item>
        </Flex>
      </div>

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={saving}>
          提交
        </Button>
      </Flex>
    </Form>
  );
}
