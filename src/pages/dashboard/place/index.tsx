import { useState } from "react";
import { App, Button, Collapse, Form, Input, InputNumber, Select, Space } from "antd";
import ResourcePage from "@/components/Cms/ResourcePage";
import EntitySelect from "@/components/Cms/EntitySelect";
import { PlaceAPI, placeSchema, type PlaceInput } from "@/api/dashboard/place";
import { toOptions } from "@/consts/labels";
import type { Place } from "@/types/place";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
import { apiErrorMessage } from "@/utils/apiError";

const kinds = { venue: "场馆", food: "餐饮", attraction: "景点", hotel: "酒店", transport_hub: "交通枢纽" };

export default function PlacePage() {
  const platform = isPlatform(useAuthStore((state) => state.user?.role));
  const { message, modal } = App.useApp();
  const [search, setSearch] = useState("");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [kind, setKind] = useState<Place["kind"]>();
  return (
    <ResourcePage<Place, PlaceInput>
      title="地点"
      queryKey={["places", search, regionId, kind]}
      list={(page) => PlaceAPI.list({ ...page, name: search || undefined, regionId: regionId || undefined, kind })}
      schema={placeSchema}
      initialValues={(record) => ({ kind: "venue", regionId, latitude: null, longitude: null, ...record })}
      save={PlaceAPI.save}
      remove={PlaceAPI.delete}
      canCreate={platform}
      canEdit={platform}
      canDelete={platform}
      columns={[
        { title: "名称", dataIndex: "name" },
        { title: "类型", render: (_, v) => kinds[v.kind] },
        { title: "地区", render: (_, v) => v.region?.name },
        { title: "地址", dataIndex: "address" },
        { title: "坐标", render: (_, v) => (v.latitude == null ? "未设置" : `${v.latitude}, ${v.longitude}`) },
      ]}
      filters={
        <Space wrap>
          <Input.Search allowClear placeholder="搜索地点名称" onSearch={setSearch} style={{ width: 240 }} />
          <EntitySelect kind="region" value={regionId} onChange={setRegionId} placeholder="全部地区" />
          <Select
            allowClear
            placeholder="全部类型"
            style={{ width: 140 }}
            value={kind}
            onChange={setKind}
            options={toOptions(kinds)}
          />
          {platform && (
            <Button
              onClick={() =>
                modal.confirm({
                  title: "重建地点地理索引？",
                  content: "网站的附近地点搜索使用这个索引。批量导入或修改坐标后再执行。",
                  onOk: async () => {
                    try {
                      const res = await PlaceAPI.rebuildGeoIndex();
                      message.success(`已索引 ${res.indexed} 个地点`);
                    } catch (e) {
                      message.error(apiErrorMessage(e));
                      throw e;
                    }
                  },
                })
              }
            >
              重建地理索引
            </Button>
          )}
        </Space>
      }
      editor={() => (
        <>
          <Form.Item label="地点名称" name="name" rules={[{ required: true, message: "请填写地点名称" }]}>
            <Input />
          </Form.Item>
          <Space wrap>
            <Form.Item label="所属地区" name="regionId" rules={[{ required: true, message: "请选择所属地区" }]}>
              <EntitySelect kind="region" style={{ width: 240 }} />
            </Form.Item>
            <Form.Item label="地点类型" name="kind">
              <Select style={{ width: 160 }} options={toOptions(kinds)} />
            </Form.Item>
            <Form.Item label="子类型" name="subtype">
              <Input placeholder="例如 会展中心" />
            </Form.Item>
          </Space>
          <Form.Item label="地址" name="address">
            <Input.TextArea autoSize={{ minRows: 2 }} />
          </Form.Item>
          <Space wrap>
            <Form.Item label="纬度" name="latitude" extra="与经度一起填写">
              <InputNumber min={-90} max={90} style={{ width: 180 }} />
            </Form.Item>
            <Form.Item label="经度" name="longitude">
              <InputNumber min={-180} max={180} style={{ width: 180 }} />
            </Form.Item>
          </Space>
          <Collapse
            ghost
            items={[
              {
                key: "source",
                label: "更多信息（时区与坐标来源）",
                forceRender: true,
                children: (
                  <>
                    <Form.Item label="时区" name="timezone">
                      <Input placeholder="Asia/Shanghai" />
                    </Form.Item>
                    <Form.Item label="坐标来源" name="coordinateSource">
                      <Input placeholder="例如 tencent" />
                    </Form.Item>
                    <Form.Item label="原始坐标系" name="sourceCoordinateSystem">
                      <Select allowClear options={["WGS84", "GCJ02", "BD09"].map((value) => ({ value, label: value }))} />
                    </Form.Item>
                    <Form.Item label="来源地点标识" name="sourcePlaceId">
                      <Input />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </>
      )}
    />
  );
}
