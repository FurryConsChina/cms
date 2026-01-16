import { EventItem } from "@/types/event";
import { Region } from "@/types/region";
import { Autocomplete, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";
import RegionSelector from "@/components/Region/RegionSelector";
import LocationSearch from "@/components/Event/LocationSearch";
import { Typography, Button, Flex, Row, Col, App } from "antd";
import { useState } from "react";

const { Title } = Typography;

interface GeographicInfoProps {
  form: UseFormReturnType<any>;
  event?: EventItem;
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region | null) => void;
}

export default function GeographicInfo({
  form,
  event,
  selectedRegion,
  setSelectedRegion,
}: GeographicInfoProps) {
  const { message } = App.useApp();
  const [isLocationSearchModalOpen, setIsLocationSearchModalOpen] = useState(false);

  return (
    <div style={{ padding: "0 24px", margin: "16px 0" }}>
      <Title level={5} style={{ marginBottom: 12 }}>
        地理信息
      </Title>

      <Flex vertical gap={8}>
        <RegionSelector
          required
          label="展会区域"
          placeholder="请选择展会区域"
          selectedOption={event?.region}
          onSelect={(value) => {
            setSelectedRegion(value);
          }}
          {...form.getInputProps("regionId")}
        />

        <Autocomplete
          label="展会地址"
          rightSection={<IconSearch size="14" className="cursor-pointer" />}
          {...form.getInputProps("address")}
        />

        <Row gutter={8}>
          <Col flex={1}>
            <TextInput
              label="经度"
              placeholder="一般是三位整数"
              {...form.getInputProps("addressLon")}
            />
          </Col>
          <Col flex={1}>
            <TextInput
              label="纬度"
              placeholder="一般是两位整数"
              {...form.getInputProps("addressLat")}
            />
          </Col>
        </Row>

        <Button
          onClick={() => {
            if (!selectedRegion) {
              message.warning("请先选择展会区域");
              return;
            }
            setIsLocationSearchModalOpen(true);
          }}
        >
          搜索地址
        </Button>
        <LocationSearch
          isModalOpen={isLocationSearchModalOpen}
          handleOk={(location) => {
            setIsLocationSearchModalOpen(false);
            if (location) {
              form.setFieldValue(
                "addressLat",
                location.location.lat.toString()
              );
              form.setFieldValue(
                "addressLon",
                location.location.lng.toString()
              );
            }
          }}
          handleCancel={() => {
            setIsLocationSearchModalOpen(false);
          }}
          region={selectedRegion!}
          keyword={form.values.address}
        />
      </Flex>
    </div>
  );
} 