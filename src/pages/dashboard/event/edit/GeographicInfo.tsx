import type { EventItem } from "@/types/event";
import type { Region } from "@/types/region";
import type { Place } from "@/types/place";
import PlaceEditor from "@/components/Place/PlaceEditor";
import RegionEditor from "@/components/Region/RegionEditor";
import RegionSelector, { type RegionSelectorHandle } from "@/components/Region/RegionSelector";
import { PlaceAPI } from "@/api/dashboard/place";
import { Typography, Form, Input, Select, Alert, Row, Col, App, Button, Flex, Space } from "antd";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
import { apiErrorMessage } from "@/utils/apiError";
import type { FormInstance } from "antd";
import { useRef, useState } from "react";
import useSWR from "swr";

interface GeographicInfoProps {
  form: FormInstance;
  event?: EventItem;
  selectedRegion?: Region;
  setSelectedRegion: (region?: Region) => void;
}

export default function GeographicInfo({ form, event, selectedRegion, setSelectedRegion }: GeographicInfoProps) {
  const { message } = App.useApp();
  const platform = isPlatform(useAuthStore((state) => state.user?.role));
  const regionSelector = useRef<RegionSelectorHandle>(null);
  const [refreshingRegions, setRefreshingRegions] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState<"region" | "place">();
  const [createdPlace, setCreatedPlace] = useState<Place>();
  const { data, isLoading, isValidating, error, mutate } = useSWR(
    selectedRegion ? ["places", selectedRegion.id, search] : null,
    () => PlaceAPI.list({ current: 1, pageSize: 100, regionId: selectedRegion?.id, name: search || undefined }),
  );
  const refreshRegions = async () => {
    setRefreshingRegions(true);
    try {
      await regionSelector.current?.refresh();
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setRefreshingRegions(false);
    }
  };
  const refreshPlaces = async () => {
    try {
      await mutate();
    } catch (error) {
      message.error(apiErrorMessage(error));
    }
  };
  const places = data?.records || [];
  const selectedPlace = createdPlace ?? event?.place;
  const options = (
    selectedPlace && selectedPlace.regionId === selectedRegion?.id && !places.some((p) => p.id === selectedPlace.id)
      ? [selectedPlace, ...places]
      : places
  ).map((p) => ({ value: p.id, label: `${p.name}${p.address ? `（${p.address}）` : ""}` }));
  return (
    <div>
      <Typography.Title level={5}>地理信息</Typography.Title>
      {error && <Alert type="error" title="场地加载失败，请稍后重试" />}
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Flex justify="space-between" align="center" gap={8} className="mb-2">
            <label htmlFor="regionId">举办地区</label>
            <Space size={4}>
              <Button
                size="small"
                icon={<IconRefresh size={14} />}
                aria-label="刷新举办地区"
                title="刷新举办地区"
                loading={refreshingRegions}
                onClick={() => void refreshRegions()}
              />
              {platform && (
                <Button
                  size="small"
                  icon={<IconPlus size={14} />}
                  aria-label="新建举办地区"
                  title="新建举办地区"
                  onClick={() => setCreating("region")}
                />
              )}
            </Space>
          </Flex>
          <Form.Item name="regionId">
            <RegionSelector
              ref={regionSelector}
              selectedOption={selectedRegion}
              onSelect={(region) => {
                setSelectedRegion(region);
                form.setFieldValue("placeId", null);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={16}>
          <Flex justify="space-between" align="center" gap={8} className="mb-2">
            <label htmlFor="placeId">活动场地</label>
            <Space size={4}>
              <Button
                size="small"
                icon={<IconRefresh size={14} />}
                aria-label="刷新活动场地"
                title="刷新活动场地"
                loading={isValidating}
                disabled={!selectedRegion}
                onClick={() => void refreshPlaces()}
              />
              {platform && (
                <Button
                  size="small"
                  icon={<IconPlus size={14} />}
                  aria-label="新建活动场地"
                  title="新建活动场地"
                  onClick={() => setCreating("place")}
                />
              )}
            </Space>
          </Flex>
          <Form.Item name="placeId">
            <Select
              disabled={!selectedRegion}
              allowClear
              showSearch
              filterOption={false}
              loading={isLoading || isValidating}
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
      {platform && creating === "region" && (
        <RegionEditor
          onCancel={() => setCreating(undefined)}
          onSaved={(region) => {
            setSelectedRegion(region);
            setCreatedPlace(undefined);
            setSearch("");
            form.setFieldsValue({ regionId: region.id, placeId: null });
            setCreating(undefined);
            void refreshRegions();
          }}
        />
      )}
      {platform && creating === "place" && (
        <PlaceEditor
          regionId={selectedRegion?.id}
          onCancel={() => setCreating(undefined)}
          onSaved={(place) => {
            setCreatedPlace(place);
            setSelectedRegion(place.region);
            setSearch("");
            form.setFieldsValue({ regionId: place.regionId, placeId: place.id });
            setCreating(undefined);
            void refreshPlaces();
          }}
        />
      )}
    </div>
  );
}
