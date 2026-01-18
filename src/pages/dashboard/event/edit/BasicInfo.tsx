import { Organization } from "@/types/organization";
import OrganizationSelector from "@/components/Organization/OrganizatonSelector";
import { Typography, Row, Col, Form, Input, DatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

const { Title } = Typography;

interface BasicInfoProps {
  selectedOrganizations?: Organization[];
  setSelectedOrganizations: (orgs?: Organization[]) => void;
}

export default function BasicInfo({ selectedOrganizations, setSelectedOrganizations }: BasicInfoProps) {
  return (
    <div>
      <Title level={5} style={{ margin: "12px 0" }}>
        基础信息
      </Title>
      <Form.Item label="展会名称" required name="name" rules={[{ required: true, message: "请输入展会名称" }]}>
        <Input placeholder="请输入展会名称" />
      </Form.Item>

      <Row gutter={8}>
        <Col span={12}>
          <Form.Item
            label="展会主办方"
            help="展会目前只能通过主办方的 slug 进行访问"
            required
            name="organization"
            rules={[{ required: true, message: "请选择展会主办方" }]}
          >
            <OrganizationSelector
              selectedOptions={selectedOrganizations}
              onSelect={(value) => {
                setSelectedOrganizations(value);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="展会协办方" help="可以选很多，但是请注意，主办方不能在协办方中" name="organizations">
            <OrganizationSelector
              selectedOptions={selectedOrganizations}
              onSelect={(value) => {
                setSelectedOrganizations(value);
              }}
              antdSelectProps={{
                mode: "multiple",
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
        <Col flex={1}>
          <Form.Item label="开始日期" name="startAt" help="除非明确知晓展会开始时间，否则请保持默认上午10点">
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
          <Form.Item label="结束日期" name="endAt" help="除非明确知晓展会结束时间，否则请保持默认下午6点">
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
