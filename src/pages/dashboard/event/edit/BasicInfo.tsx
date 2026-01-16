import { Organization } from "@/types/organization";
import { EventItem, EditEventSchema } from "@/types/event";
import { UseFormReturn, Controller } from "react-hook-form";
import { z } from "zod";
import OrganizationSelector from "@/components/Organization/OrganizatonSelector";
import { Typography, Flex, Row, Col, Form, Input, DatePicker, Space } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { RangePickerProps } from "antd/es/date-picker";

dayjs.locale("zh-cn");

const { Title } = Typography;

type EventFormValues = z.infer<typeof EditEventSchema>;

interface BasicInfoProps {
  form: UseFormReturn<EventFormValues>;
  event?: EventItem;
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization | null) => void;
  selectedOrganizations: Organization[] | null;
  setSelectedOrganizations: (orgs: Organization[] | null) => void;
}

export default function BasicInfo({
  form,
  event,
  selectedOrganization,
  setSelectedOrganization,
  selectedOrganizations,
  setSelectedOrganizations,
}: BasicInfoProps) {
  return (
    <div>
      <h5 className="text-lg font-bold">基础信息</h5>
      <Form.Item
        label="展会名称"
        required
        validateStatus={form.formState.errors.name ? "error" : undefined}
        help={form.formState.errors.name?.message}
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => <Input placeholder="请输入展会名称" {...field} />}
        />
      </Form.Item>

      <Row gutter={8}>
        <Col span={12}>
          <Form.Item label="展会主办方" help="展会目前只能通过主办方的 slug 进行访问" required>
            <Controller
              name="organization"
              control={form.control}
              render={({ field }) => (
                <OrganizationSelector
                  required
                  label="展会主办方"
                  description="展会目前只能通过主办方的 slug 进行访问"
                  selectedOptions={event?.organization ? [event.organization] : []}
                  value={field.value ? [field.value] : []}
                  onSelect={(value) => {
                    const firstOrganization = value?.[0];
                    setSelectedOrganization(firstOrganization || null);
                    field.onChange(firstOrganization?.id || null);
                  }}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="展会协办方" help="可以选很多，但是请注意，主办方不能在协办方中">
            <Controller
              name="organizations"
              control={form.control}
              render={({ field }) => (
                <OrganizationSelector
                  label="展会协办方"
                  multiple
                  description="可以选很多，但是请注意，主办方不能在协办方中"
                  selectedOptions={selectedOrganizations}
                  value={field.value}
                  onChange={field.onChange}
                  onSelect={(value) => {
                    setSelectedOrganizations(value as Organization[] | null);
                    field.onChange(value?.map((org: Organization) => org.id) || []);
                  }}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
        <Col flex={1}>
          <Form.Item
            label="开始日期"
            required
            help={form.formState.errors.startAt?.message || "除非明确知晓展会开始时间，否则请保持默认上午10点"}
            validateStatus={form.formState.errors.startAt ? "error" : undefined}
          >
            <Controller
              name="startAt"
              control={form.control}
              render={({ field }) => (
                <DatePicker
                  showTime
                  format="YYYY年MM月DD日 hh:mm A"
                  placeholder="选一个日期"
                  onChange={(value, dateString) => {
                    console.log("Selected Time: ", value);
                    console.log("Formatted Selected Time: ", dateString);
                  }}
                  value={dayjs(field.value)}
                  onOk={(value) => {
                    field.onChange(value.toISOString());
                  }}
                  style={{ width: "100%" }}
                  showNow={false}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col flex={1}>
          <Form.Item
            label="结束日期"
            required
            help={form.formState.errors.endAt?.message || "除非明确知晓展会结束时间，否则请保持默认下午6点"}
            validateStatus={form.formState.errors.endAt ? "error" : undefined}
          >
            <Controller
              name="endAt"
              control={form.control}
              render={({ field }) => (
                <DatePicker
                  showTime
                  format="YYYY年MM月DD日 hh:mm A"
                  placeholder="选一个日期"
                  onChange={(value, dateString) => {
                    console.log("Selected Time: ", value);
                    console.log("Formatted Selected Time: ", dateString);
                  }}
                  value={dayjs(field.value)}
                  onOk={(value) => {
                    field.onChange(value.toISOString());
                  }}
                  style={{ width: "100%" }}
                  showNow={false}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
