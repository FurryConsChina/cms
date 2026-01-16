import { EditEventSchema, EventItem } from "@/types/event";
import { Region } from "@/types/region";
import { UseFormReturn, Controller } from "react-hook-form";
import { IconSearch } from "@tabler/icons-react";
import RegionSelector from "@/components/Region/RegionSelector";
import LocationSearch from "@/components/Event/LocationSearch";
import { Typography, Button, Flex, Row, Col, App, Form, Input, AutoComplete } from "antd";
import { useState } from "react";
import { InferZodType } from "@/types/common";

const { Title } = Typography;

interface GeographicInfoProps {
  form: UseFormReturn<InferZodType<typeof EditEventSchema>>;
  event?: EventItem;
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region | null) => void;
}

export default function GeographicInfo({ form, event, selectedRegion, setSelectedRegion }: GeographicInfoProps) {
  const { message } = App.useApp();
  const [isLocationSearchModalOpen, setIsLocationSearchModalOpen] = useState(false);

  const address = form.watch("address");

  return (
    <div>
      <h5 className="text-lg font-bold">地理信息</h5>

      <Flex vertical gap={8}>
        <Controller
          name="regionId"
          control={form.control}
          render={({ field, fieldState }) => (
            <RegionSelector
              required
              label="展会区域"
              placeholder="请选择展会区域"
              selectedOption={event?.region}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
              }}
              onSelect={(value) => {
                setSelectedRegion(value);
              }}
              error={fieldState.error?.message}
            />
          )}
        />

        <Form.Item
          label="展会地址"
          validateStatus={form.formState.errors.address ? "error" : undefined}
          help={form.formState.errors.address?.message}
        >
          <Controller
            name="address"
            control={form.control}
            render={({ field }) => (
              <AutoComplete
                placeholder="请输入展会地址"
                suffixIcon={<IconSearch size="14" className="cursor-pointer" />}
                {...field}
              />
            )}
          />
        </Form.Item>

        <Row gutter={8}>
          <Col flex={1}>
            <Form.Item
              label="经度"
              validateStatus={form.formState.errors.addressLon ? "error" : undefined}
              help={form.formState.errors.addressLon?.message}
            >
              <Controller
                name="addressLon"
                control={form.control}
                render={({ field }) => (
                  <Input placeholder="一般是三位整数" value={field.value || ""} onChange={field.onChange} />
                )}
              />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item
              label="纬度"
              validateStatus={form.formState.errors.addressLat ? "error" : undefined}
              help={form.formState.errors.addressLat?.message}
            >
              <Controller
                name="addressLat"
                control={form.control}
                render={({ field }) => (
                  <Input placeholder="一般是两位整数" value={field.value || ""} onChange={field.onChange} />
                )}
              />
            </Form.Item>
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
              form.setValue("addressLat", location.location.lat.toString());
              form.setValue("addressLon", location.location.lng.toString());
            }
          }}
          handleCancel={() => {
            setIsLocationSearchModalOpen(false);
          }}
          region={selectedRegion!}
          keyword={address}
        />
      </Flex>
    </div>
  );
}
