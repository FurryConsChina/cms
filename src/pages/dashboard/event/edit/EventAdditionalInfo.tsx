import { EditEventSchema, EventItem } from "@/types/event";
import {
  EventLocationType,
  EventScale,
  type EventScaleKeyType,
  EventStatus,
  type EventStatusKeyType,
  EventType,
} from "@/types/event";
import { UseFormReturn, Controller } from "react-hook-form";
import { EventLocationTypeLabel, EventScaleLabel, EventStatusLabel, EventTypeLabel } from "@/consts/event";
import EventFeatureSelector from "@/components/EventFeature/EventFeatureSelector";
import { Typography, Flex, Form, Select, Input } from "antd";
import { InferZodType } from "@/types/common";

const { Title } = Typography;
const { TextArea } = Input;

interface EventAdditionalInfoProps {
  form: UseFormReturn<InferZodType<typeof EditEventSchema>>;
  event?: EventItem;
}

export default function EventAdditionalInfo({ form, event }: EventAdditionalInfoProps) {
  return (
    <div>
      <h5 className="text-lg font-bold">展会附加信息</h5>
      <Form.Item
        label="展会状态"
        required
        validateStatus={form.formState.errors.status ? "error" : undefined}
        help={form.formState.errors.status?.message}
      >
        <Controller
          name="status"
          control={form.control}
          render={({ field }) => (
            <Select
              placeholder="选一个"
              options={Object.keys(EventStatus).map((key) => ({
                label: EventStatusLabel[EventStatus[key as EventStatusKeyType]],
                value: EventStatus[key as EventStatusKeyType],
              }))}
              {...field}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="展会规模"
        required
        validateStatus={form.formState.errors.scale ? "error" : undefined}
        help={form.formState.errors.scale?.message}
      >
        <Controller
          name="scale"
          control={form.control}
          render={({ field }) => (
            <Select
              placeholder="选一个"
              options={Object.keys(EventScale).map((key) => ({
                label: EventScaleLabel[EventScale[key as EventScaleKeyType]],
                value: EventScale[key as EventScaleKeyType],
                disabled: ["Mega", "XXLarge"].includes(key),
              }))}
              {...field}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="展会类型"
        required
        validateStatus={form.formState.errors.type ? "error" : undefined}
        help={form.formState.errors.type?.message}
      >
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Select
              placeholder="选一个"
              options={Object.keys(EventType).map((key) => ({
                label: EventTypeLabel[EventType[key as keyof typeof EventType]],
                value: EventType[key as keyof typeof EventType],
              }))}
              {...field}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="展会场地"
        required
        validateStatus={form.formState.errors.locationType ? "error" : undefined}
        help={form.formState.errors.locationType?.message}
      >
        <Controller
          name="locationType"
          control={form.control}
          render={({ field }) => (
            <Select
              placeholder="选一个"
              options={Object.keys(EventLocationType).map((key) => ({
                label: EventLocationTypeLabel[EventLocationType[key as keyof typeof EventLocationType]],
                value: EventLocationType[key as keyof typeof EventLocationType],
              }))}
              {...field}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="展会专属标签"
        validateStatus={form.formState.errors.features?.self ? "error" : undefined}
        help={form.formState.errors.features?.self?.message}
      >
        <Controller
          name="features.self"
          control={form.control}
          render={({ field }) => <Select mode="tags" placeholder="请输入展会专属的标签" {...field} />}
        />
      </Form.Item>

      <Controller
        name="featureIds"
        control={form.control}
        render={({ field }) => (
          <EventFeatureSelector label="展会公共标签" placeholder="请选择展会共有的标签" {...field} />
        )}
      />

      <Form.Item
        label="展会描述"
        validateStatus={form.formState.errors.detail ? "error" : undefined}
        help={form.formState.errors.detail?.message}
      >
        <TextArea autoSize={{ minRows: 5, maxRows: 20 }} placeholder="请输入展会描述" {...form.register("detail")} />
      </Form.Item>
    </div>
  );
}
