import { Organization } from "@/types/organization";
import EventOrganizerList from "@/components/organization/EventOrganizerList";
import { Typography, Row, Col, Form, Input, DatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

const { Title } = Typography;

export default function BasicInfo({ organizations }: { organizations: Organization[] }) {
  return (
    <div>
      <Title level={5} style={{ margin: "12px 0" }}>
        基础信息
      </Title>
      <Form.Item
        label="展会名称"
        required
        name="name"
        rules={[{ required: true, message: "请输入展会名称" }]}
      >
        <Input placeholder="请输入展会名称" />
      </Form.Item>

      <Form.Item
        name="organizations"
        rules={[{ required: true, type: "array", min: 1, message: "请选择至少一个主办组织" }]}
      >
        <EventOrganizerList organizations={organizations} />
      </Form.Item>

      <Row gutter={8}>
        <Col flex={1}>
          <Form.Item
            label="开始日期"
            name="startAt"
            help="除非明确知晓展会开始时间，否则请保持默认上午10点"
          >
            <DatePicker
              showTime
              format="YYYY年MM月DD日 hh:mm A"
              placeholder="选一个日期"
              style={{ width: "100%" }}
              showNow={false}
            />
          </Form.Item>
        </Col>
        <Col flex={1}>
          <Form.Item
            label="结束日期"
            name="endAt"
            help="除非明确知晓展会结束时间，否则请保持默认下午6点"
          >
            <DatePicker
              showTime
              format="YYYY年MM月DD日 hh:mm A"
              placeholder="选一个日期"
              style={{ width: "100%" }}
              showNow={false}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
