import { Region } from "@/types/region";
import { Center, SimpleGrid, Stack } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Card, Modal, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";

// {
//     "id": "5646138039615211307",
//     "title": "如家酒店·neo(北京长安街北京站店)",
//     "address": "北京市东城区站站前街1号3楼4楼",
//     "category": "酒店宾馆:经济型酒店",
//     "type": 0,
//     "location": {
//         "lat": 39.905433,
//         "lng": 116.426255
//     },
//     "adcode": 110101,
//     "province": "北京市",
//     "city": "北京市",
//     "district": "东城区"
// },

type TencentLocation = {
  id: string;
  title: string;
  address: string;
  category: string;
  type: number;
  location: {
    lat: number;
    lng: number;
  };
  adcode: number;
  province: string;
  city: string;
  district: string;
};

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
      axios.get<{ count: number; data: TencentLocation[] }>(
        `https://apis.map.qq.com/ws/place/v1/suggestion?region=${params.region}&keyword=${params.keyword}&key=PXEBZ-QLM6C-RZX2K-AV2XX-SBBW5-VGFC4&output=jsonp`
      ),
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
      {addressSearchResult?.data?.data.map((location) => (
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
