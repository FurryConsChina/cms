import { getTencentLocation } from "@/api/dashboard/map";
import { TencentLocation } from "@/types/map";
import { Region } from "@/types/region";
import { Center, SimpleGrid, Stack } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Card, Modal, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

export default function LocationSearch({
  isModalOpen,
  handleOk,
  handleCancel,
  region,
  keyword,
}: {
  isModalOpen: boolean;
  handleOk: (location: TencentLocation | null) => void;
  handleCancel: () => void;
  region: Region;
  keyword?: string | null;
}) {
  const [selectedLocation, setSelectedLocation] =
    useState<TencentLocation | null>(null);
  return (
    <Modal
      title="搜索地址"
      destroyOnHidden
      open={isModalOpen}
      onOk={() => handleOk(selectedLocation)}
      onCancel={handleCancel}
      okText="确定"
      cancelText="取消"
      width={800}
    >
      <ModalContent
        onSelect={setSelectedLocation}
        region={region}
        keyword={keyword}
        selectedLocation={selectedLocation}
      />
    </Modal>
  );
}

function ModalContent({
  onSelect,
  region,
  keyword,
  selectedLocation,
}: {
  onSelect: (location: TencentLocation | null) => void;
  region: Region;
  keyword?: string | null;
  selectedLocation: TencentLocation | null;
}) {
  const [insideKeyword, setInsideKeyword] = useState(keyword);

  const {
    data: addressSearchResult,
    mutate: searchLocation,
    isPending,
  } = useMutation({
    mutationFn: (params: { region: string; keyword: string }) =>
      getTencentLocation({ region: params.region, keyword: params.keyword }),
  });

  useEffect(() => {
    if (insideKeyword) {
      searchLocation({ region: region.name, keyword: insideKeyword });
    }
  }, [keyword, region]);

  return isPending ? (
    <Center>
      <Spin />
    </Center>
  ) : (
    <SimpleGrid cols={2}>
      {addressSearchResult?.data.map((location) => (
        <LocationItem
          key={location.id}
          location={location}
          onSelect={onSelect}
          selected={selectedLocation?.id === location.id}
        />
      ))}
    </SimpleGrid>
  );
}

function LocationItem({
  location,
  onSelect,
  selected,
}: {
  location: TencentLocation;
  onSelect: (location: TencentLocation | null) => void;
  selected: boolean;
}) {
  return (
    <Card
      title={location.title}
      variant="borderless"
      onClick={() => onSelect(location)}
      className="cursor-pointer"
      style={{
        border: selected ? "1px solid #1677ff" : "1px solid #e8e8e8",
      }}
    >
      <p>{location.category}</p>
      <p>{`${location.province} ${location.city} ${location.district}`}</p>
      <p>{location.address}</p>
      <p>{`${location.location.lat}, ${location.location.lng}`}</p>
    </Card>
  );
}
