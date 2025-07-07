import { EventItem } from "@/types/event";
import {
  EventLocationType,
  EventScale,
  type EventScaleKeyType,
  EventStatus,
  type EventStatusKeyType,
  EventType,
} from "@/types/event";
import { Container, Select, Stack, TagsInput, TextInput, Textarea, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import {
  EventLocationTypeLabel,
  EventScaleLabel,
  EventStatusLabel,
  EventTypeLabel,
} from "@/consts/event";
import EventFeatureSelector from "@/components/EventFeature/EventFeatureSelector";

interface EventAdditionalInfoProps {
  form: UseFormReturnType<any>;
  event?: EventItem;
}

export default function EventAdditionalInfo({ form, event }: EventAdditionalInfoProps) {
  return (
    <Container my="md" fluid>
      <Title order={5}>展会附加信息</Title>
      <Stack>
        <Select
          label="展会状态"
          withAsterisk
          placeholder="选一个"
          data={Object.keys(EventStatus).map((key) => ({
            label: EventStatusLabel[EventStatus[key as EventStatusKeyType]],
            value: EventStatus[key as EventStatusKeyType],
          }))}
          {...form.getInputProps("status")}
        />

        <Select
          label="展会规模"
          withAsterisk
          placeholder="选一个"
          data={Object.keys(EventScale).map((key) => ({
            label: EventScaleLabel[EventScale[key as EventScaleKeyType]],
            value: EventScale[key as EventScaleKeyType],
            disabled: ["Mega", "XXLarge"].includes(key),
          }))}
          {...form.getInputProps("scale")}
        />

        <Select
          label="展会类型"
          withAsterisk
          placeholder="选一个"
          data={Object.keys(EventType).map((key) => ({
            label: EventTypeLabel[EventType[key as keyof typeof EventType]],
            value: EventType[key as keyof typeof EventType],
          }))}
          {...form.getInputProps("type")}
        />

        <Select
          label="展会场地"
          withAsterisk
          placeholder="选一个"
          data={Object.keys(EventLocationType).map((key) => ({
            label:
              EventLocationTypeLabel[
                EventLocationType[key as keyof typeof EventLocationType]
              ],
            value: EventLocationType[key as keyof typeof EventLocationType],
          }))}
          {...form.getInputProps("locationType")}
        />

        <TagsInput
          label="展会专属标签"
          placeholder="请输入展会专属的标签"
          {...form.getInputProps("features.self")}
        />

        <EventFeatureSelector
          label="展会公共标签"
          placeholder="请选择展会共有的标签"
          {...form.getInputProps("featureIds")}
        />

        {/* <TextInput label="展会信源" {...form.getInputProps("source")} /> */}

        <Textarea
          label="展会描述"
          autosize
          minRows={5}
          maxRows={20}
          {...form.getInputProps("detail")}
        />
      </Stack>
    </Container>
  );
} 