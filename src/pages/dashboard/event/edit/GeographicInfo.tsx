import type { EventItem } from "@/types/event";
import type { Region } from "@/types/region";
import RegionSelector from "@/components/Region/RegionSelector";
import { PlaceAPI } from "@/api/dashboard/place";
import { Typography, Form, Input, Select, Alert, Row, Col } from "antd";
import type { FormInstance } from "antd";
import { useState } from "react";
import useSWR from "swr";

interface GeographicInfoProps {
  form: FormInstance;
  event?: EventItem;
  selectedRegion?: Region;
  setSelectedRegion: (region?: Region) => void;
}

export default function GeographicInfo({ form, event, selectedRegion, setSelectedRegion }: GeographicInfoProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useSWR(["places", selectedRegion?.id, search], () =>
    PlaceAPI.list({ current: 1, pageSize: 100, regionId: selectedRegion?.id, name: search || undefined }),
  );
  const places = data?.records || [];
  const options = (
    event?.place && event.place.regionId === selectedRegion?.id && !places.some((p) => p.id === event.place?.id)
      ? [event.place, ...places]
      : places
  ).map((p) => ({ value: p.id, label: `${p.name}${p.address ? `（${p.address}）` : ""}` }));
  return (
    <div>
      <Typography.Title level={5}>地理信息</Typography.Title>
      {error && <Alert type="error" title="场地加载失败，请稍后重试" />}
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="举办地区" name="regionId">
            <RegionSelector
              selectedOption={event?.region ?? undefined}
              onSelect={(region) => {
                setSelectedRegion(region);
                form.setFieldValue("placeId", null);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={16}>
          <Form.Item label="活动场地" name="placeId">
            <Select
              disabled={!selectedRegion}
              allowClear
              showSearch
              filterOption={false}
              loading={isLoading}
              options={options}
              onSearch={setSearch}
              onClear={() => form.setFieldValue("placeId", null)}
              placeholder="搜索并选择场地"
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="场地补充说明" name="locationNotes">
        <Input.TextArea placeholder="选填，仅需补充入口或路线指引时填写。例如：从全家便利店旁的侧门进入，乘扶梯到二楼后直行。" />
      </Form.Item>
    </div>
  );
}
