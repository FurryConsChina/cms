import type { EventItem } from "@/types/event";
import type { Region } from "@/types/region";
import RegionSelector from "@/components/Region/RegionSelector";
import { PlaceAPI } from "@/api/dashboard/place";
import { Typography, Form, Input, Select, Alert } from "antd";
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
      <Form.Item label="展会地区" name="regionId">
        <RegionSelector
          selectedOption={event?.region ?? undefined}
          onSelect={(region) => {
            setSelectedRegion(region);
            form.setFieldValue("placeId", null);
          }}
        />
      </Form.Item>
      {error && <Alert type="error" title="场地加载失败，请稍后重试" />}
      <Form.Item label="活动场地" name="placeId" extra="地址与经纬度由所选场地提供。">
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
      <Form.Item label="场地补充说明" name="locationNotes">
        <Input.TextArea />
      </Form.Item>
    </div>
  );
}
