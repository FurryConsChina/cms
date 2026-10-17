import { getTencentLocation } from "@/api/cms/map";
import type { TencentLocation } from "@/types/map";
import { apiErrorMessage } from "@/utils/apiError";
import { Alert, Empty, Input, Modal, Radio, Spin, Typography } from "antd";
import { useState } from "react";
import useSWR from "swr";

export default function LocationSearch({
  handleOk,
  handleCancel,
  keyword,
}: {
  handleOk: (location: TencentLocation) => void;
  handleCancel: () => void;
  keyword: string;
}) {
  const [search, setSearch] = useState(keyword);
  const [input, setInput] = useState(keyword);
  const [selectedLocation, setSelectedLocation] = useState<TencentLocation | null>(null);
  const { data, error, isLoading, mutate } = useSWR(
    ["tencent-location", search],
    () => getTencentLocation({ keyword: search }),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return (
    <Modal
      title="从腾讯地图搜索地点"
      open
      onOk={() => selectedLocation && handleOk(selectedLocation)}
      onCancel={handleCancel}
      okText="使用此地点"
      cancelText="取消"
      okButtonProps={{ disabled: !selectedLocation || isLoading || !!error }}
      mask={{ closable: false }}
      width={720}
      centered
      styles={{ body: { maxHeight: "65vh", overflowY: "auto" } }}
    >
      <Input.Search
        aria-label="地点搜索关键词"
        placeholder="输入地址或地点名称"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onSearch={(value) => {
          const next = value.trim();
          if (!next) return;
          setSelectedLocation(null);
          if (next === search) void mutate();
          else setSearch(next);
        }}
        enterButton="搜索"
        loading={isLoading}
      />
      <div className="mt-4">
        {error ? (
          <Alert type="error" showIcon title={apiErrorMessage(error, "地点搜索失败，请重试")} />
        ) : isLoading ? (
          <div className="flex justify-center p-4">
            <Spin />
          </div>
        ) : !data?.data.length ? (
          <Empty description="没有找到地点，请调整地址或关键词后重试" />
        ) : (
          <Radio.Group
            value={selectedLocation?.id}
            onChange={(event) =>
              setSelectedLocation(
                data.data.find((location) => location.id === event.target.value) ?? null,
              )
            }
            className="w-full"
          >
            {data.data.map((location) => (
              <div key={location.id} className="rounded-lg border border-gray-200 p-3 mb-2">
                <Radio value={location.id} className="w-full">
                  <Typography.Text strong>{location.title}</Typography.Text>
                  <div className="mt-1">
                    <Typography.Text type="secondary">
                      {[location.province, location.city, location.district]
                        .filter(Boolean)
                        .join(" ")}
                    </Typography.Text>
                  </div>
                  <div className="mt-1 break-words">{location.address}</div>
                </Radio>
              </div>
            ))}
          </Radio.Group>
        )}
      </div>
    </Modal>
  );
}
