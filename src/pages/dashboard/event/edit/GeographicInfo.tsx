import { EventItem } from "@/types/event";
import { Region } from "@/types/region";
import { IconSearch } from "@tabler/icons-react";
import RegionSelector from "@/components/Region/RegionSelector";
import LocationSearch from "@/components/Event/LocationSearch";
import { Typography, Button, Flex, Row, Col, App, Form, Input, AutoComplete } from "antd";
import type { FormInstance } from "antd";
import { useState } from "react";

const { Title } = Typography;

interface GeographicInfoProps {
  form: FormInstance;
  event?: EventItem;
  selectedRegion?: Region;
  setSelectedRegion: (region?: Region) => void;
}

export default function GeographicInfo({ form, event, selectedRegion, setSelectedRegion }: GeographicInfoProps) {
  const { message } = App.useApp();
  const [isLocationSearchModalOpen, setIsLocationSearchModalOpen] = useState(false);

  const address = Form.useWatch("address", form);

  return (
    <div>
      <Title level={5} style={{ margin: "12px 0" }}>
        地理信息
      </Title>

      <Form.Item label="展会地区" name="regionId">
        <RegionSelector selectedOption={event?.region} onSelect={(region) => setSelectedRegion(region)} />
      </Form.Item>

      <Form.Item label="展会地址" name="address">
        <Input placeholder="请输入展会地址" />
      </Form.Item>

      <Row gutter={8}>
        <Col span={12}>
          <Form.Item label="经度" name="addressLon">
            <Input placeholder="经度小数点前一般有三位整数" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="纬度" name="addressLat">
            <Input placeholder="纬度小数点前一般有两位整数" />
          </Form.Item>
        </Col>
      </Row>

      <Button
        onClick={() => {
          if (!selectedRegion) {
            return message.warning("请先选择展会地区");
          }
          if (!address) {
            return message.warning("请先输入展会地址");
          }

          setIsLocationSearchModalOpen(true);
        }}
      >
        按展会地址搜索经纬度
      </Button>
      <LocationSearch
        isModalOpen={isLocationSearchModalOpen}
        handleOk={(location) => {
          setIsLocationSearchModalOpen(false);
          if (location) {
            form.setFieldValue("addressLat", location.location.lat.toString());
            form.setFieldValue("addressLon", location.location.lng.toString());
          }
        }}
        handleCancel={() => {
          setIsLocationSearchModalOpen(false);
        }}
        region={selectedRegion!}
        keyword={address}
      />
    </div>
  );
}
