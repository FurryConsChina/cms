import { getTencentLocation, getTencentNearbyLocations } from "@/api/cms/map";
import type { TencentLocation } from "@/types/map";
import { apiErrorMessage } from "@/utils/apiError";
import { Alert, Empty, Input, Modal, Radio, Spin, Tag, Typography, theme } from "antd";
import { useState } from "react";
import useSWR from "swr";
import styles from "./LocationSearch.module.css";

export type LocationSearchQuery =
  | { kind: "address"; keyword: string; region?: string }
  | { kind: "coordinates"; latitude: number; longitude: number };

export default function LocationSearch({
  handleOk,
  handleCancel,
  query,
}: {
  handleOk: (location: TencentLocation) => void;
  handleCancel: () => void;
  query: LocationSearchQuery;
}) {
  const { token } = theme.useToken();
  const [search, setSearch] = useState(query.kind === "address" ? query.keyword : "");
  const [input, setInput] = useState(search);
  const [selectedLocation, setSelectedLocation] = useState<TencentLocation | null>(null);
  const key =
    query.kind === "address"
      ? (["tencent-location", query.region, search] as const)
      : (["tencent-nearby", query.latitude, query.longitude] as const);
  const { data, error, isLoading, mutate } = useSWR<
    Awaited<ReturnType<typeof getTencentLocation>>,
    Error
  >(
    key,
    () =>
      query.kind === "address"
        ? getTencentLocation({ keyword: search, region: query.region })
        : getTencentNearbyLocations({ latitude: query.latitude, longitude: query.longitude }),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return (
    <Modal
      title={query.kind === "coordinates" ? "查看附近地点" : "从腾讯地图搜索地点"}
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
      {query.kind === "address" ? (
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
      ) : (
        <Typography.Text type="secondary">
          搜索中心：纬度 {query.latitude}，经度 {query.longitude}；范围：500 米
        </Typography.Text>
      )}
      <div className="mt-4">
        {error ? (
          <Alert type="error" showIcon title={apiErrorMessage(error, "地点搜索失败，请重试")} />
        ) : isLoading ? (
          <div className="flex justify-center p-4">
            <Spin />
          </div>
        ) : !data?.data.length ? (
          <Empty
            description={
              query.kind === "coordinates"
                ? "附近没有找到地点，请调整经纬度后重试"
                : "没有找到地点，请调整地址或关键词后重试"
            }
          />
        ) : (
          <Radio.Group
            aria-label="地点搜索结果"
            value={selectedLocation?.id}
            onChange={(event) =>
              setSelectedLocation(
                data.data.find((location) => location.id === event.target.value) ?? null,
              )
            }
            className={styles.results}
          >
            {data.data.map((location) => {
              const isSelected = location.id === selectedLocation?.id;
              const area = [location.province, location.city, location.district]
                .filter(Boolean)
                .join(" / ");

              return (
                <Radio
                  key={location.id}
                  value={location.id}
                  className={styles.result}
                  styles={{
                    root: {
                      background: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
                      borderColor: isSelected ? token.colorPrimary : token.colorBorderSecondary,
                      borderRadius: token.borderRadius,
                    },
                    label: { flex: 1, minWidth: 0 },
                  }}
                >
                  <span className={styles.details}>
                    <span className={styles.heading}>
                      <Typography.Text
                        strong
                        className={styles.title}
                        style={{ color: token.colorTextHeading }}
                      >
                        {location.title || "未提供地点名称"}
                      </Typography.Text>
                      {location.category && (
                        <Tag color="blue" className={styles.category}>
                          {location.category}
                        </Tag>
                      )}
                    </span>
                    {query.kind === "coordinates" && location.distance != null && (
                      <Typography.Text
                        className={styles.metadata}
                        style={{ color: token.colorText }}
                      >
                        <span style={{ color: token.colorTextSecondary }}>距离：</span>
                        {Math.round(location.distance)} 米
                      </Typography.Text>
                    )}
                    <Typography.Text className={styles.address} style={{ color: token.colorText }}>
                      {location.address || "未提供地址"}
                    </Typography.Text>
                    <Typography.Text className={styles.metadata} style={{ color: token.colorText }}>
                      <span style={{ color: token.colorTextSecondary }}>所属地区：</span>
                      {area || "未提供"}
                    </Typography.Text>
                    <Typography.Text className={styles.metadata} style={{ color: token.colorText }}>
                      <span style={{ color: token.colorTextSecondary }}>坐标：</span>
                      纬度 {location.location?.lat ?? "未提供"}，经度{" "}
                      {location.location?.lng ?? "未提供"}
                    </Typography.Text>
                  </span>
                </Radio>
              );
            })}
          </Radio.Group>
        )}
      </div>
    </Modal>
  );
}
