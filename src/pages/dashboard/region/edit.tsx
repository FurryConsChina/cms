import { EditRegionApiBody, RegionAPI } from "@/api/dashboard/region";
import DefaultContainer from "@/components/Container";
import LoadError from "@/components/Error";
import RegionSelector from "@/components/Region/RegionSelector";
import { InferZodType } from "@/types/common";
import { Region, RegionType, RegionTypeLabel } from "@/types/region";
import { useZodValidateData } from "@/utils/form";
import { App, Button, Col, Divider, Flex, Form, Input, InputNumber, Row, Select, Spin, Switch, Typography } from "antd";
import { pickBy } from "es-toolkit";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";

const { Title } = Typography;
const { TextArea } = Input;

export default function RegionEditPage() {
  const { regionId } = useParams();

  const { data, isLoading, error } = useSWR(
    ["region-detail", regionId],
    regionId ? () => RegionAPI.getRegion(regionId) : null,
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
          {regionId ? "编辑区域" : "新建区域"}
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
    code: cleanedRegion.code,
    type: cleanedRegion.type || RegionType.STATE,
    level: cleanedRegion.level || 2,
    parentId: cleanedRegion.parentId,
    countryCode: cleanedRegion.countryCode,
    isOverseas: cleanedRegion.isOverseas ?? false,
    addressFormat: cleanedRegion.addressFormat,
    localName: cleanedRegion.localName,
    timezone: cleanedRegion.timezone,
    languageCode: cleanedRegion.languageCode,
    currencyCode: cleanedRegion.currencyCode,
    phoneCode: cleanedRegion.phoneCode,
    isoCode: cleanedRegion.isoCode,
    latitude: cleanedRegion.latitude,
    longitude: cleanedRegion.longitude,
    sortOrder: cleanedRegion.sortOrder,
    remark: cleanedRegion.remark,
  };

  const onSubmit = async (value: InferZodType<typeof EditRegionApiBody>) => {
    try {
      if (region?.id) {
        await RegionAPI.updateRegion(region.id, value);
        message.success("更新区域数据成功");
      } else {
        const res = await RegionAPI.createRegion(value);
        message.success("创建区域数据成功");
        navigate(`/dashboard/region/${res.id}/edit`);
      }
    } catch (error) {
      message.error(`有错误发生: ${JSON.stringify(error)}`);
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    const processedValues = useZodValidateData(value, EditRegionApiBody);
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
          <Col span={12}>
            <Form.Item
              label="区域名称"
              required
              name="name"
              rules={[{ required: true, message: "请输入区域名称" }]}
              extra="区域名称是指该地区在简体中文中的称呼。"
            >
              <Input placeholder="请输入区域名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="本地名称"
              name="localName"
              required
              extra="本地化名称是指当地人怎么称呼该地区，比如北京的本地名称是北京，而纽约的本地名称是New York。"
              rules={[{ required: true, message: "请输入本地化名称" }]}
            >
              <Input placeholder="请输入本地化名称" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="区域代码"
          required
          name="code"
          rules={[{ required: true, message: "请输入区域代码" }]}
          extra="这个代码可以看作是活动和组织的slug，会拼进URL里，中国的城市就用拼音，比如北京就是beijing，而国外的城市就用英文，比如纽约就是new-york。"
        >
          <Input placeholder="请输入区域代码" />
        </Form.Item>

        <Row gutter={8}>
          <Col span={8}>
            <Form.Item label="区域类型" required name="type" rules={[{ required: true, message: "请选择区域类型" }]}>
              <Select
                placeholder="请选择区域类型"
                options={[
                  { label: RegionTypeLabel[RegionType.COUNTRY], value: RegionType.COUNTRY, disabled: true },
                  { label: RegionTypeLabel[RegionType.STATE], value: RegionType.STATE },
                  { label: RegionTypeLabel[RegionType.CITY], value: RegionType.CITY },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="区域级别" required name="level" rules={[{ required: true, message: "请选择区域级别" }]}>
              <Select
                placeholder="请选择区域级别"
                options={[
                  { label: "省份/直辖市", value: 2 },
                  { label: "城市", value: 3 },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="父级区域" name="parentId">
              <RegionSelector placeholder="请选择父级区域" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="是否属于中国以外的地区" name="isOverseas" valuePropName="checked">
          <Switch />
        </Form.Item>
      </div>

      <Divider dashed size="small" />

      <div>
        <Title level={5} style={{ margin: "12px 0" }}>
          地理信息
        </Title>
        <Row gutter={8}>
          <Col span={8}>
            <Form.Item label="地址格式" name="addressFormat">
              <Select placeholder="请选择地址格式" options={[{ label: "中式", value: "chinese" }]} allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="ISO 3166-1 代码"
              name="countryCode"
              tooltip="请根据ISO 3166-1 标准进行选择：https://www.iban.com/country-codes"
            >
              <Select
                placeholder="请选择国家代码"
                options={[
                  { label: "中国 (China)", value: "CN" },
                  { label: "香港 (Hong Kong)", value: "HK" },
                  { label: "澳门 (Macao)", value: "MO" },
                  { label: "台湾 (Taiwan)", value: "TW" },
                ]}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="ISO 3166-2 代码"
              name="isoCode"
              tooltip="请根据ISO 3166-2 标准进行选择：https://zh.wikipedia.org/wiki/ISO_3166-2:CN，这里也可以下载：https://www.ip2location.com/free/iso3166-2"
            >
              <Input placeholder="请填写ISO 3166-2 代码" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="纬度" name="latitude">
              <InputNumber placeholder="请输入纬度" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="经度" name="longitude">
              <InputNumber placeholder="请输入经度" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Divider dashed size="small" />

      <div>
        <Title level={5} style={{ margin: "12px 0" }}>
          区域信息
        </Title>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="时区" name="timezone">
              <Select
                placeholder="请选择时区"
                options={[
                  { label: "Asia/Shanghai-UTC + 08:00", value: "Asia/Shanghai" },
                  { label: "Asia/Taipei-UTC + 08:00", value: "Asia/Taipei" },
                ]}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="语言代码" name="languageCode">
              <Select
                placeholder="请选择语言代码"
                options={[
                  { label: "中文（中国）", value: "zh-CN" },
                  { label: "中文（台湾）", value: "zh-TW" },
                  { label: "英语（美国）", value: "en-US" },
                  { label: "英语（英国）", value: "en-GB" },
                ]}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="货币代码" name="currencyCode">
              <Select
                placeholder="请选择货币代码"
                options={[
                  { label: "人民币（中国）", value: "CNY" },
                  { label: "新台币（台湾）", value: "TWD" },
                  { label: "港币（香港）", value: "HKD" },
                  { label: "澳门币（澳门）", value: "MOP" },
                ]}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="电话代码" name="phoneCode">
              <Select
                placeholder="请选择电话代码"
                options={[
                  { label: "+86（中国大陆）", value: "+86" },
                  { label: "+886（台湾）", value: "+886" },
                  { label: "+852（香港）", value: "+852" },
                  { label: "+853（澳门）", value: "+853" },
                ]}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="排序" name="sortOrder">
          <InputNumber placeholder="请输入排序" style={{ width: "100%" }} />
        </Form.Item>
      </div>

      <Divider dashed />

      <div>
        <Title level={5} style={{ margin: "12px 0" }}>
          其他信息
        </Title>
        <Form.Item label="备注" name="remark">
          <TextArea placeholder="请输入区域描述" autoSize={{ minRows: 4 }} />
        </Form.Item>
      </div>

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Flex>
    </Form>
  );
}
