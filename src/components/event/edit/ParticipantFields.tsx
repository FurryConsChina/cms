import {
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  type FormInstance,
} from "antd";
import { DateListInput } from "@/components/common/Fields";
import { MediaListFields } from "@/components/media/MediaPicker";
import OrganizationSelector from "@/components/organization/OrganizationSelector";
import ProfileSelector from "@/components/profile/ProfileSelector";
import { toOptions } from "@/consts/labels";

const roles = { guest: "嘉宾", exhibitor: "展商", sponsor: "赞助商", media: "媒体" };

export default function ParticipantFields({
  form,
  disabled,
  onBusyChange,
}: {
  form: FormInstance;
  disabled: boolean;
  onBusyChange: (key: string, busy: boolean) => void;
}) {
  const subjectType = Form.useWatch("subjectType", form) as "profile" | "organization" | undefined;
  return (
    <>
      <Form.Item name="eventId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="sortOrder" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item label="参加主体" required extra="找不到？请先创建主体资料或组织。">
        <Space.Compact block>
          <Form.Item name="subjectType" noStyle>
            <Select
              aria-label="参加主体类型"
              style={{ width: 120, flexShrink: 0 }}
              options={[
                { value: "profile", label: "主体资料" },
                { value: "organization", label: "组织" },
              ]}
            />
          </Form.Item>
          {subjectType === "organization" ? (
            <Form.Item
              name="organizationId"
              noStyle
              rules={[{ required: true, message: "请选择组织" }]}
            >
              <OrganizationSelector
                antdSelectProps={{ allowClear: true, style: { width: "100%" } }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="profileId"
              noStyle
              rules={[{ required: true, message: "请选择主体资料" }]}
            >
              <ProfileSelector antdSelectProps={{ style: { width: "100%" } }} />
            </Form.Item>
          )}
        </Space.Compact>
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item label="参加角色" name="role">
            <Select options={toOptions(roles)} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="摊位" name="booth">
            <Input maxLength={64} placeholder="例如 A12" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="出席日期" name="appearanceDates" extra="留空表示全部日期">
            <DateListInput />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="级别" name="tier">
            <Input maxLength={64} placeholder="例如 金牌赞助" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="重点展示" name="isFeatured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="介绍" name="description">
        <Input.TextArea autoSize={{ minRows: 3 }} />
      </Form.Item>
      <Divider titlePlacement="start">图片</Divider>
      <MediaListFields
        name="portrait"
        label="形象图"
        disabled={disabled}
        onBusyChange={onBusyChange}
      />
      <MediaListFields
        name="gallery"
        label="相册"
        disabled={disabled}
        onBusyChange={onBusyChange}
      />
    </>
  );
}
