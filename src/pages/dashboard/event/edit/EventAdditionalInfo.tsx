import { EventItem } from "@/types/event";
import {
  EventLocationType,
  EventScale,
  type EventScaleKeyType,
  EventStatus,
  type EventStatusKeyType,
  EventType,
} from "@/types/event";
import { EventLocationTypeLabel, EventScaleLabel, EventStatusLabel, EventTypeLabel } from "@/consts/event";
import EventFeatureSelector from "@/components/EventFeature/EventFeatureSelector";
import { Typography, Flex, Form, Select, Input, Col, Row, Button, Space } from "antd";
import type { FormInstance } from "antd";
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from "@tabler/icons-react";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface EventAdditionalInfoProps {
  form: FormInstance;
  event?: EventItem;
}

export default function EventAdditionalInfo({ form, event }: EventAdditionalInfoProps) {
  return (
    <div>
      <Title level={5} style={{ margin: "12px 0" }}>
        展会附加信息
      </Title>
      <Row gutter={8}>
        <Col span={12}>
          <Form.Item label="展会状态" required name="status" rules={[{ required: true, message: "请选择展会状态" }]}>
            <Select
              placeholder="选择展会状态"
              options={Object.keys(EventStatus).map((key) => ({
                label: EventStatusLabel[EventStatus[key as EventStatusKeyType]],
                value: EventStatus[key as EventStatusKeyType],
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="展会规模" required name="scale" rules={[{ required: true, message: "请选择展会规模" }]}>
            <Select
              placeholder="选一个"
              options={Object.keys(EventScale).map((key) => ({
                label: EventScaleLabel[EventScale[key as EventScaleKeyType]],
                value: EventScale[key as EventScaleKeyType],
                disabled: ["Mega", "XXLarge"].includes(key),
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
        <Col span={12}>
          <Form.Item label="展会类型" required name="type" rules={[{ required: true, message: "请选择展会类型" }]}>
            <Select
              placeholder="选一个"
              options={Object.keys(EventType).map((key) => ({
                label: EventTypeLabel[EventType[key as keyof typeof EventType]],
                value: EventType[key as keyof typeof EventType],
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="展会场地类型"
            required
            name="locationType"
            rules={[{ required: true, message: "请选择展会场地" }]}
          >
            <Select
              placeholder="选一个"
              options={Object.keys(EventLocationType).map((key) => ({
                label: EventLocationTypeLabel[EventLocationType[key as keyof typeof EventLocationType]],
                value: EventLocationType[key as keyof typeof EventLocationType],
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="展会私有标签" name="features">
        <Select mode="tags" placeholder="请输入展会专属的标签" />
      </Form.Item>

      <Form.Item label="展会公共标签" name="featureIds">
        <EventFeatureSelector
          antdSelectProps={{
            placeholder: "请选择展会共有的标签",
          }}
        />
      </Form.Item>

      <Form.List name={["extra", "overrideOrganizationContact", "qqGroups"]}>
        {(fields, { add, remove, move }) => (
          <>
            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
              <Text strong>展会额外联系方式</Text>

              <Button icon={<IconPlus size={14} />} onClick={() => add({ label: "", value: "" })}>
                添加QQ群
              </Button>
            </Flex>
            {fields.map((field, index) => (
              <div key={field.key}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                  <Text strong>第{index + 1}个QQ群</Text>
                  <Space>
                    <Button icon={<IconArrowUp size={14} />} onClick={() => move(index, index - 1)} />
                    <Button icon={<IconArrowDown size={14} />} onClick={() => move(index, index + 1)} />
                    <Button danger icon={<IconTrash size={14} />} onClick={() => remove(field.name)} />
                  </Space>
                </Flex>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      required
                      name={[field.name, "label"]}
                      rules={[{ required: true, message: "请输入QQ群名称" }]}
                    >
                      <Input placeholder="请输入QQ群名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      required
                      name={[field.name, "value"]}
                      rules={[{ required: true, message: "请输入QQ群号" }]}
                    >
                      <Input placeholder="请输入QQ群号" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
          </>
        )}
      </Form.List>

      <Form.Item label="展会描述" name="detail">
        <TextArea autoSize={{ minRows: 5, maxRows: 30 }} placeholder="请输入展会描述" />
      </Form.Item>
    </div>
  );
}
