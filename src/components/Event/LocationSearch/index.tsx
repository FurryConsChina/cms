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
        `https://apis.map.qq.com/ws/place/v1/suggestion?region=${params.region}&keyword=${params.keyword}&key=PXEBZ-QLM6C-RZX2K-AV2XX-SBBW5-VGFC4`
      ),
  });

  const mockData = {
    status: 0,
    message: "query ok",
    request_id: "3322205237242690465",
    count: 100,
    data: [
      {
        id: "5646138039615211307",
        title: "如家酒店·neo(北京长安街北京站店)",
        address: "北京市东城区站站前街1号3楼4楼",
        category: "酒店宾馆:经济型酒店",
        type: 0,
        location: {
          lat: 39.905433,
          lng: 116.426255,
        },
        adcode: 110101,
        province: "北京市",
        city: "北京市",
        district: "东城区",
      },
      {
        id: "2686208156655995489",
        title: "如家精选酒店(北京天安门广场前门大栅栏步行街店)",
        address: "北京市西城区大栅栏商业街32号",
        category: "酒店宾馆:经济型酒店",
        type: 0,
        location: {
          lat: 39.895805,
          lng: 116.395672,
        },
        adcode: 110102,
        province: "北京市",
        city: "北京市",
        district: "西城区",
      },
      {
        id: "13244641270080590529",
        title: "如家驿居酒店(北京天桥地铁站店)",
        address: "北京市西城区永定门内大街1号天桥百货商场F1层",
        category: "酒店宾馆:酒店宾馆",
        type: 0,
        location: {
          lat: 39.880544,
          lng: 116.397471,
        },
        adcode: 110102,
        province: "北京市",
        city: "北京市",
        district: "西城区",
      },
      {
        id: "5194232529788876475",
        title: "如家酒店·neo(北京景泰蒲黄榆地铁站店)",
        address: "北京市丰台区定安路定安东里18号楼1楼",
        category: "酒店宾馆:经济型酒店",
        type: 0,
        location: {
          lat: 39.860191,
          lng: 116.416047,
        },
        adcode: 110106,
        province: "北京市",
        city: "北京市",
        district: "丰台区",
      },
      {
        id: "12767012109846373363",
        title: "如家酒店·neo(北京什刹海鼓楼交道口店)",
        address:
          "北京市东城区交道口北头条与安定门内大街交叉口正东方向137米左右",
        category: "酒店宾馆:经济型酒店",
        type: 0,
        location: {
          lat: 39.941627,
          lng: 116.410131,
        },
        adcode: 110101,
        province: "北京市",
        city: "北京市",
        district: "东城区",
      },
      {
        id: "2626525559100274995",
        title: "如家精选酒店(北京西站地铁站店)",
        address: "北京市丰台区莲花池东路126号A座",
        category: "酒店宾馆:经济型酒店",
        type: 0,
        location: {
          lat: 39.896,
          lng: 116.312943,
        },
        adcode: 110106,
        province: "北京市",
        city: "北京市",
        district: "丰台区",
      },
      {
        id: "14633723098269635192",
        title: "如家精选酒店(北京建国门首都儿研所店)",
        address: "北京市朝阳区外交部南街10号万邦商贸大厦20~25层",
        category: "酒店宾馆:酒店宾馆",
        type: 0,
        location: {
          lat: 39.916598,
          lng: 116.436934,
        },
        adcode: 110105,
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
      },
      {
        id: "1885327577795337788",
        title: "如家商旅酒店(北京前门地铁站北京坊店)",
        address: "北京市西城区前门西河沿街114号",
        category: "酒店宾馆:经济型酒店",
        type: 0,
        location: {
          lat: 39.898875,
          lng: 116.393489,
        },
        adcode: 110102,
        province: "北京市",
        city: "北京市",
        district: "西城区",
      },
      {
        id: "13226320484847849843",
        title: "如家精选酒店(北京国展三元桥店)",
        address: "北京市朝阳区西坝河东里36号",
        category: "酒店宾馆:酒店宾馆",
        type: 0,
        location: {
          lat: 39.966181,
          lng: 116.450042,
        },
        adcode: 110105,
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
      },
      {
        id: "3206347918074819100",
        title: "如家酒店·neo(北京昌平地铁站店)",
        address: "北京市昌平区鼓楼南大街15号",
        category: "酒店宾馆:经济型酒店",
        type: 0,
        location: {
          lat: 40.220183,
          lng: 116.233131,
        },
        adcode: 110114,
        province: "北京市",
        city: "北京市",
        district: "昌平区",
      },
    ],
  };

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
      {mockData?.data.map((location) => (
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
