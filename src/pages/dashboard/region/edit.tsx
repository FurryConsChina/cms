import { apiErrorMessage } from "@/utils/apiError";
import { EditRegionApiBody, RegionAPI } from "@/api/dashboard/region";
import DefaultContainer from "@/components/Layout/Container";
import LoadError from "@/components/Layout/LoadError";
import RegionSelector from "@/components/Region/RegionSelector";
import { InferZodType } from "@/types/common";
import { Region, RegionType, RegionTypeLabel } from "@/types/region";
import { useZodValidateData } from "@/utils/form";
import { App, Button, Flex, Form, Input, InputNumber, Select, Spin, Typography } from "antd";
import { pickBy } from "es-toolkit";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";

const { Title } = Typography;

export default function RegionEditPage() {
  const { regionId } = useParams();

  const { data, isLoading, error } = useSWR(
    ["region-detail", regionId],
    regionId ? () => RegionAPI.getRegion(regionId) : null,
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
          {regionId ? "编辑地区" : "新建地区"}
        </Title>
      </DefaultContainer>

      <DefaultContainer className="mt-4">
        {isLoading ? (
          <Flex justify="center" align="center">
            <Spin />
          </Flex>
        ) : (
          <RegionEditorContent region={data} />
        )}
      </DefaultContainer>
    </div>
  );
}

function RegionEditorContent({ region }: { region?: Region }) {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const cleanedRegion = region ? pickBy(region, (v) => v !== "" && v != null) : {};

  const [form] = Form.useForm();

  const initialValues = {
    name: cleanedRegion.name,
    slug: cleanedRegion.slug,
    kind: cleanedRegion.kind || RegionType.STATE,
    parentId: cleanedRegion.parentId || null,
    localName: cleanedRegion.localName,
    timezone: cleanedRegion.timezone,
    isoCode: cleanedRegion.isoCode,
    displayOrder: cleanedRegion.displayOrder ?? 0,
  };

  const onSubmit = async (value: InferZodType<typeof EditRegionApiBody>) => {
    try {
      if (region?.id) {
        await RegionAPI.updateRegion(region.id, value);
        message.success("更新地区数据成功");
      } else {
        const res = await RegionAPI.createRegion(value);
        message.success("创建地区数据成功");
        navigate(`/dashboard/region/${res.id}/edit`);
      }
    } catch (error) {
      message.error(apiErrorMessage(error));
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    const processedValues = useZodValidateData({ ...value, parentId: value.parentId || null }, EditRegionApiBody);
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
      <Title level={5}>基础信息</Title>
      <Form.Item label="地区名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="本地名称" name="localName">
        <Input />
      </Form.Item>
      <Form.Item
        label="地区 Slug"
        name="slug"
        rules={[{ required: true }, { pattern: /^[a-zA-Z0-9-]+$/, message: "仅支持字母、数字和连字符" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="地区类型" name="kind" rules={[{ required: true }]}>
        <Select options={Object.values(RegionType).map((value) => ({ value, label: RegionTypeLabel[value] }))} />
      </Form.Item>
      <Form.Item label="父级地区" name="parentId" extra="国家无父级，其他地区必须选择父级。">
        <RegionSelector selectedOption={region?.parent ?? undefined} antdSelectProps={{ allowClear: true }} />
      </Form.Item>
      <Form.Item label="时区" name="timezone">
        <Input placeholder="Asia/Shanghai" />
      </Form.Item>
      <Form.Item label="ISO 代码" name="isoCode">
        <Input maxLength={10} />
      </Form.Item>
      <Form.Item label="显示排序" name="displayOrder">
        <InputNumber min={0} />
      </Form.Item>

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Flex>
    </Form>
  );
}
