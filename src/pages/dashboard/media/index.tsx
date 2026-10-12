import { useState } from "react";
import useSWR from "swr";
import { Alert, App, Button, Card, Flex, Image, Input, Modal, Select, Space, Table, Tag, Typography } from "antd";
import { ParticipantAPI } from "@/api/dashboard/participant";
import {
  confirmUpload,
  createExternalMedia,
  deleteMediaAsset,
  getMediaUsages,
  isImageAsset,
  listMediaAssets,
} from "@/api/dashboard/upload";
import EntitySelect from "@/components/Cms/EntitySelect";
import UploadImage from "@/components/UploadImage";
import { mediaOwnerLabels, mediaRoleLabels, toOptions } from "@/consts/labels";
import type { MediaAsset, MediaOwner, MediaUsage } from "@/types/media";
import { apiErrorMessage } from "@/utils/apiError";

const statusLabels = { pending: "待确认", ready: "可用", failed: "失败", deleting: "删除中", deleted: "已删除" };
const statusColors = { pending: "orange", ready: "green", failed: "red", deleting: "default", deleted: "default" };
const sourceLabels = { upload: "上传", external: "外部链接", legacy: "历史资源" };

export default function MediaPage() {
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [entityType, setEntityType] = useState<MediaOwner["entityType"]>("event");
  const [entityId, setEntityId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [usages, setUsages] = useState<MediaUsage[]>();
  const owner = entityId ? { entityType, entityId } : undefined;
  const { data, error, isLoading, mutate } = useSWR(["media-library", current, entityType, entityId], () =>
    listMediaAssets({ current, pageSize: 20, owner }),
  );
  const { data: participants } = useSWR(
    entityType === "event_participation" ? ["media-owner-participants"] : null,
    () => ParticipantAPI.list({ current: 1, pageSize: 100 }),
  );
  const run = async (work: () => Promise<unknown>) => {
    try {
      await work();
      message.success("操作成功");
      await mutate();
    } catch (e) {
      message.error(apiErrorMessage(e));
      throw e;
    }
  };
  const selectOwner = (id: string | null) => {
    setEntityId(id);
    setCurrent(1);
  };
  return (
    <div className="space-y-4">
      <Typography.Title level={3} style={{ margin: 0 }}>
        媒体资源库
      </Typography.Title>
      <Card size="small">
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <Typography.Text strong>1. 选择资源属于哪个内容</Typography.Text>
            <Flex gap={8} wrap className="mt-2">
              <Select
                value={entityType}
                style={{ width: 140 }}
                onChange={(v) => {
                  setEntityType(v);
                  selectOwner(null);
                }}
                options={toOptions(mediaOwnerLabels)}
              />
              {entityType === "event_participation" ? (
                <Select
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  value={entityId}
                  onChange={(v) => selectOwner(v ?? null)}
                  style={{ minWidth: 260 }}
                  placeholder="选择参加记录"
                  options={participants?.records.map((v) => ({
                    value: v.id,
                    label: `${v.profile?.name || v.organization?.name || "参加者"}${v.booth ? ` · ${v.booth}` : ""}`,
                  }))}
                />
              ) : (
                <EntitySelect
                  kind={entityType}
                  value={entityId}
                  onChange={selectOwner}
                  placeholder={`搜索${mediaOwnerLabels[entityType]}`}
                  style={{ width: 280 }}
                />
              )}
              <Button
                disabled={!owner}
                onClick={async () => {
                  try {
                    setUsages(await getMediaUsages(owner!));
                  } catch (e) {
                    message.error(apiErrorMessage(e));
                  }
                }}
              >
                查看已绑定的资源
              </Button>
            </Flex>
          </div>
          <div>
            <Typography.Text strong>2. 上传图片</Typography.Text>
            <Flex gap={8} wrap align="center" className="mt-2">
              <UploadImage owner={owner} pathPrefix="" onUploadSuccess={() => void mutate()} />
              {!owner && <Typography.Text type="secondary">先完成第 1 步。</Typography.Text>}
            </Flex>
          </div>
          <div>
            <Typography.Text strong>或者添加外部链接</Typography.Text>
            <Space.Compact style={{ width: "100%", maxWidth: 640 }} className="mt-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="图片、视频或直播的 https 链接"
              />
              <Button
                loading={busy}
                disabled={!url.trim()}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await createExternalMedia(url.trim());
                    message.success("外部资源已添加");
                    setUrl("");
                    await mutate();
                  } catch (e) {
                    message.error(apiErrorMessage(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                添加
              </Button>
            </Space.Compact>
          </div>
        </Space>
      </Card>
      {error && <Alert type="error" showIcon title={apiErrorMessage(error)} />}
      <Typography.Text type="secondary">
        {owner ? `正在显示所选${mediaOwnerLabels[entityType]}的资源。` : "正在显示全部资源。"}
        被引用的资源要先在对应的表单中移除，才能删除。
      </Typography.Text>
      <Table<MediaAsset>
        rowKey="id"
        loading={isLoading}
        dataSource={data?.records ?? []}
        pagination={{ current, pageSize: 20, total: data?.total, showSizeChanger: false, onChange: setCurrent }}
        scroll={{ x: "max-content" }}
        columns={[
          {
            title: "预览",
            render: (_, v) =>
              isImageAsset(v) ? (
                <Image width={90} height={70} style={{ objectFit: "contain" }} src={v.url} />
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
          { title: "状态", render: (_, v) => <Tag color={statusColors[v.status]}>{statusLabels[v.status]}</Tag> },
          { title: "来源", render: (_, v) => sourceLabels[v.sourceType] },
          {
            title: "所属",
            render: (_, v) => (v.ownerType ? (mediaOwnerLabels[v.ownerType] ?? v.ownerType) : "—"),
          },
          { title: "大小", render: (_, v) => (v.sizeBytes == null ? "—" : `${(v.sizeBytes / 1024).toFixed(1)} KB`) },
          { title: "添加时间", render: (_, v) => new Date(v.createdAt).toLocaleString("zh-CN") },
          {
            title: "操作",
            render: (_, v) => (
              <Space>
                {v.sourceType === "upload" && v.status === "pending" && (
                  <Button onClick={() => void run(() => confirmUpload(v.id)).catch(() => {})}>确认上传</Button>
                )}
                <Button
                  danger
                  disabled={v.status === "deleted" || v.status === "deleting"}
                  onClick={() =>
                    modal.confirm({
                      title: "删除这个媒体资源？",
                      content: "上传的文件也会从存储中删除。",
                      okButtonProps: { danger: true },
                      onOk: () => run(() => deleteMediaAsset(v.id)),
                    })
                  }
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal title="已绑定的资源" open={!!usages} onCancel={() => setUsages(undefined)} footer={null} width={850}>
        <Table
          rowKey={(v) => `${v.role}-${v.mediaAssetId}`}
          dataSource={usages ?? []}
          pagination={false}
          locale={{ emptyText: "还没有绑定资源" }}
          columns={[
            {
              title: "预览",
              render: (_, v) =>
                v.url && isImageAsset(v) ? <Image width={80} height={60} style={{ objectFit: "contain" }} src={v.url} /> : "—",
            },
            { title: "用途", render: (_, v) => mediaRoleLabels[v.role] ?? v.role },
            { title: "标题", dataIndex: "title" },
            {
              title: "地址",
              render: (_, v) => (
                <Typography.Text ellipsis copyable style={{ maxWidth: 300 }}>
                  {v.url}
                </Typography.Text>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
