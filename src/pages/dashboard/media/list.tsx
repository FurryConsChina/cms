import { useState } from "react";
import useSWR from "swr";
import { isAxiosError } from "axios";
import { IconRefresh } from "@tabler/icons-react";
import { Alert, App, Button, Flex, Image, Select, Space, Table, Tag, Typography } from "antd";
import ParticipantSelector from "@/components/participant/ParticipantSelector";
import EventSelector from "@/components/event/EventSelector";
import OrganizationSelector from "@/components/organization/OrganizationSelector";
import ProfileSelector from "@/components/profile/ProfileSelector";
import { deleteMediaAsset, isImageAsset, listMediaAssets } from "@/api/cms/upload";
import { mediaOwnerLabels, toOptions } from "@/consts/labels";
import type { MediaAsset, MediaOwner } from "@/types/media";
import type { List } from "@/types/request";
import { apiErrorMessage } from "@/utils/apiError";
import { imageUrl } from "@/utils/imageLoader";
import DefaultContainer from "@/components/layout/Container";

const statusLabels = {
  pending: "待确认",
  ready: "可用",
  failed: "失败",
  deleting: "删除中",
  deleted: "已删除",
};
const statusColors = {
  pending: "orange",
  ready: "green",
  failed: "red",
  deleting: "default",
  deleted: "default",
};
const sourceLabels = { upload: "上传", external: "外部链接", legacy: "历史资源" };

export default function MediaPage() {
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [entityType, setEntityType] = useState<MediaOwner["entityType"]>("event");
  const [entityId, setEntityId] = useState<string | null>(null);
  const owner = entityId ? { entityType, entityId } : undefined;
  const { data, error, isLoading, isValidating, mutate } = useSWR<List<MediaAsset>, Error>(
    ["media-library", current, owner],
    () => listMediaAssets({ current, pageSize: 20, owner }),
  );
  const selectOwner = (id: string | null) => {
    setEntityId(id);
    setCurrent(1);
  };

  return (
    <div className="space-y-4">
      <DefaultContainer className="sticky top-0 z-20">
        <Flex className="md:flex-row flex-col gap-2" justify="space-between" align="center">
          <Typography.Title level={3} className="m-0">
            媒体资源库
          </Typography.Title>
          <Button
            icon={<IconRefresh size={16} stroke={1.5} />}
            loading={isValidating}
            onClick={() => void mutate().catch((e) => message.error(apiErrorMessage(e)))}
          >
            刷新
          </Button>
        </Flex>
      </DefaultContainer>
      <DefaultContainer>
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <Flex gap={8} wrap align="end">
            <Flex className="flex-col" gap={4}>
              <label htmlFor="media-owner-type">内容类型</label>
              <Select
                id="media-owner-type"
                value={entityType}
                style={{ width: 140 }}
                onChange={(value) => {
                  setEntityType(value);
                  selectOwner(null);
                }}
                options={toOptions(mediaOwnerLabels)}
              />
            </Flex>
            <Flex className="flex-col" gap={4}>
              <label htmlFor="media-owner-id">内容</label>
              {entityType === "event_participation" ? (
                <ParticipantSelector
                  id="media-owner-id"
                  value={entityId}
                  onChange={(value) => selectOwner(value ?? null)}
                  antdSelectProps={{ style: { width: 280 } }}
                />
              ) : entityType === "event" ? (
                <EventSelector
                  id="media-owner-id"
                  value={entityId}
                  onChange={(value) => selectOwner(value ?? null)}
                  antdSelectProps={{ style: { width: 280 } }}
                />
              ) : entityType === "organization" ? (
                <OrganizationSelector
                  id="media-owner-id"
                  searchOnly
                  value={entityId}
                  onChange={(value) => selectOwner(typeof value === "string" ? value : null)}
                  antdSelectProps={{ allowClear: true, style: { width: 280 } }}
                />
              ) : (
                <ProfileSelector
                  id="media-owner-id"
                  searchOnly
                  value={entityId}
                  onChange={(value) => selectOwner(value ?? null)}
                  antdSelectProps={{ style: { width: 280 } }}
                />
              )}
            </Flex>
            <Button disabled={!entityId} onClick={() => selectOwner(null)}>
              重置
            </Button>
          </Flex>
        </Space>
      </DefaultContainer>
      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action={
            <Button
              loading={isValidating}
              onClick={() => void mutate().catch((e) => message.error(apiErrorMessage(e)))}
            >
              重试
            </Button>
          }
        />
      )}
      <div className="shadow-sm p-4 rounded-xl bg-white">
        <Table<MediaAsset>
          rowKey="id"
          loading={isLoading}
          dataSource={data?.records ?? []}
          pagination={{
            current,
            pageSize: 20,
            total: data?.total,
            showSizeChanger: false,
            onChange: setCurrent,
          }}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "预览",
              render: (_, v) =>
                isImageAsset(v) ? (
                  <Image
                    width={90}
                    height={70}
                    style={{ objectFit: "contain" }}
                    src={imageUrl(v.url)}
                  />
                ) : (
                  <Typography.Text type="secondary">外部媒体</Typography.Text>
                ),
            },
            {
              title: "地址",
              render: (_, v) => (
                <Typography.Text ellipsis copyable style={{ maxWidth: 300 }}>
                  {v.url}
                </Typography.Text>
              ),
            },
            {
              title: "状态",
              render: (_, v) => <Tag color={statusColors[v.status]}>{statusLabels[v.status]}</Tag>,
            },
            { title: "来源", render: (_, v) => sourceLabels[v.sourceType] },
            {
              title: "大小",
              render: (_, v) =>
                v.sizeBytes == null ? "—" : `${(v.sizeBytes / 1024).toFixed(1)} KB`,
            },
            { title: "添加时间", render: (_, v) => new Date(v.createdAt).toLocaleString("zh-CN") },
            {
              title: "操作",
              render: (_, v) => (
                <Button
                  danger
                  disabled={v.status === "deleted" || v.status === "deleting"}
                  onClick={() => {
                    modal.confirm({
                      title: "删除这个媒体资源？",
                      content: "上传的文件会从存储中删除。外部链接仅删除资源记录。",
                      okButtonProps: { danger: true },
                      onOk: async () => {
                        try {
                          await deleteMediaAsset(v.id);
                        } catch (e) {
                          message.error(
                            isAxiosError(e) && e.response?.status === 409
                              ? "无法删除。资源可能仍被内容引用，或上传时间不足 1 小时。"
                              : apiErrorMessage(e),
                          );
                          throw e;
                        }
                        message.success("资源已删除");
                        try {
                          const refreshed = await mutate(
                            listMediaAssets({ current, pageSize: 20, owner }),
                            { revalidate: false },
                          );
                          if (refreshed) {
                            const lastPage = Math.max(1, Math.ceil(refreshed.total / 20));
                            setCurrent((page) => Math.min(page, lastPage));
                          }
                        } catch (e) {
                          message.warning(
                            `资源已删除，但列表刷新失败。请点击刷新。${apiErrorMessage(e)}`,
                          );
                        }
                      },
                    });
                  }}
                >
                  删除
                </Button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
