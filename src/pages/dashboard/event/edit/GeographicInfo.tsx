import { EventItem } from "@/types/event";
import { Region } from "@/types/region";
import { Autocomplete, Button, Container, Group, Stack, TextInput, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import RegionSelector from "@/components/Region/RegionSelector";
import LocationSearch from "@/components/Event/LocationSearch";
import { useDisclosure } from "@mantine/hooks";

interface GeographicInfoProps {
  form: UseFormReturnType<any>;
  event?: EventItem;
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region | null) => void;
}

export default function GeographicInfo({
  form,
  event,
  selectedRegion,
  setSelectedRegion,
}: GeographicInfoProps) {
  const [
    isLocationSearchModalOpen,
    { open: openLocationSearchModal, close: closeLocationSearchModal },
  ] = useDisclosure(false);

  return (
    <Container my="md" fluid>
      <Title order={5} mb="sm">
        地理信息
      </Title>

      <Stack>
        <RegionSelector
          required
          label="展会区域"
          placeholder="请选择展会区域"
          selectedOption={event?.region}
          onSelect={(value) => {
            setSelectedRegion(value);
          }}
          {...form.getInputProps("regionId")}
        />

        <Autocomplete
          label="展会地址"
          rightSection={<IconSearch size="14" className="cursor-pointer" />}
          {...form.getInputProps("address")}
        />

        <Group gap="xs" grow>
          <TextInput
            label="经度"
            placeholder="一般是三位整数"
            {...form.getInputProps("addressLon")}
          />

          <TextInput
            label="纬度"
            placeholder="一般是两位整数"
            {...form.getInputProps("addressLat")}
          />
        </Group>

        <Button
          onClick={() => {
            if (!selectedRegion) {
              notifications.show({
                title: "请先选择展会区域",
                message: "请先选择展会区域",
                color: "red",
              });
              return;
            }
            openLocationSearchModal();
          }}
        >
          搜索地址
        </Button>
        <LocationSearch
          isModalOpen={isLocationSearchModalOpen}
          handleOk={(location) => {
            closeLocationSearchModal();
            if (location) {
              form.setFieldValue(
                "addressLat",
                location.location.lat.toString()
              );
              form.setFieldValue(
                "addressLon",
                location.location.lng.toString()
              );
            }
          }}
          handleCancel={() => {
            closeLocationSearchModal();
          }}
          region={selectedRegion!}
          keyword={form.values.address}
        />
      </Stack>
    </Container>
  );
} 