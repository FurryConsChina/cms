import { useState } from "react";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
import UploadImage from "@/components/UploadImage";
import { LinkFields } from "@/components/Cms/Fields";
import { apiErrorMessage } from "@/utils/apiError";
import { CreateOrganizationApiBody, EditOrganizationApiBody, OrganizationAPI } from "@/api/cms/organization";
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
import {
  Alert,
  App,
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Result,
  Row,
  Select,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { pickBy } from "es-toolkit";
import { Link, useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";

const { Title } = Typography;
const { TextArea } = Input;

export default function OrganizationEditPage() {
  const { organizationId } = useParams();
  const canCreate = isPlatform(useAuthStore((state) => state.user?.role));

  const { data, isLoading, error } = useSWR(
    ["organization-detail", organizationId],
    organizationId ? () => OrganizationAPI.getOrganizationDetail({ id: organizationId as string }) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (!organizationId && !canCreate) {
    return (
      <Result
        status="403"
        title="没有组织创建权限"
        subTitle="仅管理员和编辑可以创建组织。"
        extra={
          <Link to="/dashboard/organization">
            <Button>返回组织列表</Button>
          </Link>
        }
      />
    );
  }

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
  const [avatarBusy, setAvatarBusy] = useState(false);
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
    if (avatarBusy) {
      message.warning("请完成头像裁剪和上传后再提交");
      return;
    }
    const processedValues = useZodValidateData(
      {
        ...value,
        foundedOn: value.foundedOn ? value.foundedOn.format("YYYY-MM-DD") : null,
      },
      organization ? EditOrganizationApiBody : CreateOrganizationApiBody,
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
        <div className="grid grid-cols-1 gap-x-6 md:grid-cols-[144px_minmax(0,1fr)]">
          <Form.Item label="组织头像" name="logo" tooltip="支持 JPEG、PNG、WebP、GIF、AVIF 和 BMP，最大 50 MB。">
            <UploadImage
              crop
              aspect={1}
              label="组织头像"
              owner={organization?.id ? { entityType: "organization", entityId: organization.id } : undefined}
              disabled={saving}
              onBusyChange={setAvatarBusy}
            />
          </Form.Item>
          <div className="min-w-0">
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  label="展商名称"
                  required
                  name="name"
                  rules={[{ required: true, message: "请输入展商名称" }]}
                >
                  <Input placeholder="请输入展商名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="创立日期" name="foundedOn">
                  <DatePicker format="YYYY年MM月DD日" placeholder="请选择日期" allowClear style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={12}>
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
              <Col span={12}>
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
          </div>
        </div>

        <Form.Item
          label="展商Slug"
          required
          name="slug"
          rules={[
            { required: true },
            ...(!organization ? [{ pattern: /^[a-z0-9-]+$/, message: "只能使用小写英文字母、数字和连字符 -" }] : []),
          ]}
        >
          <Input
            disabled={!!organization?.id}
            placeholder="可以是展商的英文名字或者拼音。只能使用小写英文字母、数字和连字符 -"
          />
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
          <Form.Item label="展商描述" name="description">
            <TextArea placeholder="可以是展商的自我简介之类的东西，不填也没关系。" autoSize={{ minRows: 10 }} />
          </Form.Item>
        </Flex>
      </div>

      <Form.Item label="联系邮箱" name="contactMail" rules={[{ type: "email", message: "邮箱格式不正确" }]}>
        <Input />
      </Form.Item>
      <LinkFields label="社交链接与联系方式" />

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={saving} disabled={avatarBusy}>
          提交
        </Button>
      </Flex>
    </Form>
  );
}
