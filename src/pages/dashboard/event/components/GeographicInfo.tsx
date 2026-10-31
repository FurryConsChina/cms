import type { EventItem } from "@/types/event";
import type { Region } from "@/types/region";
import type { Place } from "@/types/place";
import PlaceEditor from "@/components/place/PlaceEditor";
import RegionEditor from "@/components/region/RegionEditor";
import RegionSelector, { type RegionSelectorHandle } from "@/components/region/RegionSelector";
import PlaceSelector, { type PlaceSelectorHandle } from "@/components/place/PlaceSelector";
import { Typography, Form, Input, Row, Col, App, Button, Flex, Space } from "antd";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
import { apiErrorMessage } from "@/utils/apiError";
import type { FormInstance } from "antd";
import { useRef, useState } from "react";

interface GeographicInfoProps {
  form: FormInstance;
  event?: EventItem;
  selectedRegion?: Region;
  setSelectedRegion: (region?: Region) => void;
}

export default function GeographicInfo({
  form,
  event,
  selectedRegion,
  setSelectedRegion,
}: GeographicInfoProps) {
  const { message } = App.useApp();
  const platform = isPlatform(useAuthStore((state) => state.user?.role));
  const regionSelector = useRef<RegionSelectorHandle>(null);
  const placeSelector = useRef<PlaceSelectorHandle>(null);
  const [refreshingRegions, setRefreshingRegions] = useState(false);
  const [refreshingPlaces, setRefreshingPlaces] = useState(false);
  const [creating, setCreating] = useState<"region" | "place">();
  const [createdPlace, setCreatedPlace] = useState<Place>();
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
    setRefreshingPlaces(true);
    try {
      await placeSelector.current?.refresh();
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setRefreshingPlaces(false);
    }
  };
  return (
    <div>
      <Typography.Title level={5}>地理信息</Typography.Title>
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
                loading={refreshingPlaces}
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
          <Form.Item
            name="placeId"
            getValueFromEvent={(value: string | undefined) => value ?? null}
          >
            <PlaceSelector
              key={`${selectedRegion?.id ?? ""}:${createdPlace?.id ?? ""}`}
              ref={placeSelector}
              regionId={selectedRegion?.id}
              selectedOption={createdPlace ?? event?.place}
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
            form.setFieldsValue({ regionId: place.regionId, placeId: place.id });
            setCreating(undefined);
            void refreshPlaces();
          }}
        />
      )}
    </div>
  );
}
