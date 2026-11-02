import { useRef, useState } from "react";
import {
  Alert,
  App,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  Modal,
} from "antd";
import { PlaceAPI, placeSchema } from "@/api/cms/place";
import { RegionAPI } from "@/api/cms/region";
import type { Place } from "@/types/place";
import type { Region } from "@/types/region";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";
import LocationSearch, { type LocationSearchQuery } from "@/components/event/LocationSearch";
import RegionSelector from "@/components/region/RegionSelector";
import { toOptions } from "@/consts/labels";
import { timezoneOptions } from "@/consts/timezones";

export const placeKinds = {
  venue: "场馆",
  food: "餐饮",
  attraction: "景点",
  hotel: "酒店",
  transport_hub: "交通枢纽",
};
const coordinateSources = { tencent: "腾讯地图", manual: "手动" };
const coordinateSystems = [
  { value: "WGS84", label: "WGS84（GPS）", description: "全球通用的 GPS 坐标，未做地图偏移。" },
  {
    value: "GCJ02",
    label: "GCJ-02（腾讯／高德）",
    description: "腾讯、高德等地图在中国大陆使用的偏移坐标。",
  },
  {
    value: "BD09",
    label: "BD-09（百度）",
    description: "百度地图使用的坐标，在 GCJ-02 基础上再次偏移。",
  },
];

export default function PlaceEditor({
  place,
  regionId,
  onSaved,
  onCancel,
}: {
  place?: Place;
  regionId?: string | null;
  onSaved: (place: Place & { region: Region }) => void;
  onCancel: () => void;
}) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [dirty, setDirty] = useState(false);
  const close = () => {
    if (submitting.current) return;
    if (!dirty && !form.isFieldsTouched()) return onCancel();
    modal.confirm({
      title: "放弃未保存的修改？",
      okText: "放弃",
      cancelText: "继续编辑",
      okButtonProps: { danger: true },
      onOk: onCancel,
    });
  };
  const submit = async (values: Record<string, unknown>) => {
    if (submitting.current) return;
    const parsed = placeSchema.safeParse(toNullable(values));
    if (!parsed.success) {
      form.setFields(
        parsed.error.issues
          .filter((issue) => issue.path.length)
          .map((issue) => ({
            name: issue.path as (string | number)[],
            errors: [issue.message],
          })),
      );
      message.error(parsed.error.issues[0]?.message ?? "请检查表单内容");
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      const region = await RegionAPI.getRegion(parsed.data.regionId);
      const saved = await PlaceAPI.save(place?.id, parsed.data);
      message.success(place ? "已保存" : "已创建");
      onSaved({ ...saved, region });
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const [search, setSearch] = useState<LocationSearchQuery>();
  const [searching, setSearching] = useState(false);
  const [regionNeedsSelection, setRegionNeedsSelection] = useState(false);
  const watchedRegionId = Form.useWatch("regionId", form) as string | null | undefined;
  const selectedRegionId =
    watchedRegionId === undefined ? (place?.regionId ?? regionId) : watchedRegionId;
  const timezone = Form.useWatch("timezone", form) as string | null | undefined;
  const availableTimezones =
    timezone && !timezoneOptions.some((option) => option.value === timezone)
      ? [{ value: timezone, label: timezone }, ...timezoneOptions]
      : timezoneOptions;

  const searchAddress = () => {
    const keyword = (form.getFieldValue("address") as string | undefined)?.trim();
    if (!keyword) {
      message.warning("请先填写完整地址");
      return;
    }
    const selectedRegionId = form.getFieldValue("regionId") as string | null | undefined;
    if (!selectedRegionId) {
      setSearch({ kind: "address", keyword });
      return;
    }

    setSearching(true);
    RegionAPI.getRegion(selectedRegionId)
      .then((region) => setSearch({ kind: "address", keyword, region: region.name }))
      .catch((error: unknown) => message.error(apiErrorMessage(error, "加载地区失败，请重试")))
      .finally(() => setSearching(false));
  };

  const searchCoordinates = () => {
    const longitude = form.getFieldValue("longitude") as number | null | undefined;
    const latitude = form.getFieldValue("latitude") as number | null | undefined;
    if (longitude == null || latitude == null) {
      message.warning("请先填写经度和纬度");
      return;
    }
    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      message.warning("请填写有效的经度和纬度");
      return;
    }
    setSearch({ kind: "coordinates", latitude, longitude });
  };

  return (
    <Modal
      title={place ? "编辑地点" : "新建地点"}
      open
      centered
      onCancel={close}
      onOk={() => form.submit()}
      okText={place ? "保存" : "创建"}
      cancelText="取消"
      confirmLoading={saving}
      cancelButtonProps={{ disabled: saving }}
      closable={!saving}
      keyboard={!saving}
      mask={{ closable: false }}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
    >
      <Form
        form={form}
        name="place-editor"
        layout="vertical"
        style={{ paddingInline: 8 }}
        initialValues={{
          kind: "venue",
          regionId: regionId ?? null,
          latitude: null,
          longitude: null,
          coordinateSource: "manual",
          ...place,
          timezone: place?.timezone ?? "Asia/Shanghai",
        }}
        onFinish={(values: Record<string, unknown>) => void submit(values)}
        onValuesChange={() => setDirty(true)}
        scrollToFirstError
      >
        {regionNeedsSelection && !selectedRegionId && (
          <Alert
            className="mb-4"
            type="warning"
            showIcon
            title="已填入地点信息，但未匹配到唯一地区，请手动选择所属地区。"
          />
        )}
        <Form.Item
          label="所属地区"
          name="regionId"
          getValueFromEvent={(value: string | undefined) => value ?? null}
          rules={[{ required: true, message: "请选择所属地区" }]}
        >
          <RegionSelector
            selectedOption={place?.region}
            antdSelectProps={{
              allowClear: true,
              placeholder: "输入名称或代码搜索",
              style: { width: "100%", minWidth: 0 },
            }}
          />
        </Form.Item>
        <Form.Item
          label="地点名称"
          name="name"
          rules={[{ required: true, message: "请填写地点名称" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="完整地址" name="address">
          <Input.TextArea
            placeholder="例如：广东省广州市海珠区阅江中路 380 号"
            autoSize={{ minRows: 2 }}
          />
        </Form.Item>
        <Button
          type="primary"
          size="large"
          block
          className="mb-4"
          loading={searching}
          onClick={searchAddress}
        >
          按地址搜索腾讯地图
        </Button>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="地点类型" name="kind">
              <Select options={toOptions(placeKinds)} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="子类型" name="subtype">
              <Input placeholder="例如 会展中心" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="经度" name="longitude">
              <InputNumber min={-180} max={180} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="纬度" name="latitude">
              <InputNumber min={-90} max={90} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Button block className="mb-4" onClick={searchCoordinates}>
          根据经纬度查找附近地点
        </Button>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="时区" name="timezone">
              <Select
                allowClear
                showSearch={{ optionFilterProp: "label" }}
                placeholder="搜索并选择时区"
                options={availableTimezones}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="坐标来源" name="coordinateSource">
              <Select
                placeholder="请选择坐标来源"
                options={toOptions(coordinateSources)}
                labelRender={({ value, label }) =>
                  value === "tencent" || value === "manual" ? label : "历史来源，请重新选择"
                }
                onChange={(value) => {
                  if (value === "manual") form.setFieldValue("sourcePlaceId", null);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="原始坐标系"
              name="sourceCoordinateSystem"
              tooltip="记录坐标来源使用的坐标系。修改此选项不会转换上方经纬度。"
            >
              <Select
                allowClear
                placeholder="请选择，未知时可留空"
                options={coordinateSystems}
                labelRender={({ value, label }) =>
                  coordinateSystems.some((option) => option.value === value)
                    ? label
                    : "历史坐标系，请重新选择"
                }
                optionRender={(option) => (
                  <div className="whitespace-normal">
                    <div>{option.label}</div>
                    <Typography.Text type="secondary">{option.data.description}</Typography.Text>
                  </div>
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="来源地点标识"
              name="sourcePlaceId"
              tooltip="地图服务为该地点分配的唯一编号（POI ID），用于识别来源记录。选择腾讯地图搜索结果后会自动填写；手动录入时可留空。"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        {search && (
          <LocationSearch
            query={search}
            handleCancel={() => setSearch(undefined)}
            handleOk={(location) => {
              const existingRegionId = form.getFieldValue("regionId") as string | null | undefined;
              form.setFieldsValue({
                longitude: location.location.lng,
                latitude: location.location.lat,
                address: location.address,
                name: location.title,
                subtype:
                  location.category
                    ?.split(/[:：;；]/)
                    .map((category) => category.trim())
                    .filter(Boolean)
                    .pop() ?? null,
                regionId:
                  location.matchedRegion?.id ??
                  (search.kind === "coordinates" ? (existingRegionId ?? null) : null),
                timezone:
                  location.matchedRegion?.timezone ??
                  (form.getFieldValue("timezone") as string | null | undefined),
                coordinateSource: "tencent",
                sourceCoordinateSystem: search.kind === "coordinates" ? null : "GCJ02",
                sourcePlaceId: location.id,
              });
              setDirty(true);
              setRegionNeedsSelection(!location.matchedRegion);
              setSearch(undefined);
              if (search.kind === "coordinates" && !location.matchedRegion && existingRegionId) {
                message.warning("已填入地点信息，请确认所属地区");
              } else {
                message.success("已填入地点信息，请确认后保存");
              }
            }}
          />
        )}
      </Form>
    </Modal>
  );
}
