import { Organization } from "@/types/organization";
import { EventItem } from "@/types/event";
import { Container, Group, Stack, TextInput, Title } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import OrganizationSelector from "@/components/Organization/OrganizatonSelector";

interface BasicInfoProps {
  form: UseFormReturnType<any>;
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
    <Container fluid>
      <Title order={5} my="sm">
        基础信息
      </Title>
      <Stack gap="xs">
        <TextInput
          withAsterisk
          label="展会名称"
          {...form.getInputProps("name")}
        />

        <Group gap="xs" grow>
          <OrganizationSelector
            required
            label="展会主办方"
            description="展会目前只能通过主办方的 slug 进行访问"
            selectedOption={event?.organization}
            onSelect={(value) => {
              setSelectedOrganization(value as Organization | null);
            }}
            {...form.getInputProps("organization")}
          />
          <OrganizationSelector
            label="展会协办方"
            multiple
            description="可以选很多，但是请注意，主办方不能在协办方中"
            selectedOptions={selectedOrganizations}
            onSelect={(value) => {
              setSelectedOrganizations(value as Organization[] | null);
            }}
            {...form.getInputProps("organizations")}
          />
        </Group>

        <Group gap="xs" grow>
          <DateTimePicker
            withAsterisk
            valueFormat="YYYY年MM月DD日 hh:mm A"
            locale="zh-cn"
            label="开始日期"
            description="除非明确知晓展会开始时间，否则请保持默认上午10点"
            placeholder="选一个日期"
            clearable
            {...form.getInputProps("startAt")}
          />
          <DateTimePicker
            withAsterisk
            label="结束日期"
            description="除非明确知晓展会结束时间，否则请保持默认下午6点"
            locale="zh-cn"
            placeholder="选一个日期"
            valueFormat="YYYY年MM月DD日 hh:mm A"
            clearable
            {...form.getInputProps("endAt")}
          />
        </Group>
      </Stack>
    </Container>
  );
} 