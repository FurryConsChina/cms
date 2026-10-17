import { useState } from "react";
import { App, Button, Space, Tag } from "antd";
import { EventAPI } from "@/api/cms/event";
import type { EventItem } from "@/types/event";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
import { apiErrorMessage } from "@/utils/apiError";

export default function EventVisibility({
  event,
  onChange,
}: {
  event: Pick<EventItem, "id" | "isPublished" | "isSuspended">;
  onChange: () => void;
}) {
  const { message, modal } = App.useApp();
  const platform = isPlatform(useAuthStore((state) => state.user?.role));
  const [busy, setBusy] = useState(false);
  const change = (input: { isPublished?: boolean; isSuspended?: boolean }, title: string) =>
    modal.confirm({
      title,
      content: "操作立即生效，不会修改活动资料。",
      onOk: async () => {
        setBusy(true);
        try {
          await EventAPI.setVisibility(event.id, input);
          message.success("状态已更新");
          onChange();
        } catch (e) {
          message.error(apiErrorMessage(e));
          throw e;
        } finally {
          setBusy(false);
        }
      },
    });
  return (
    <Space wrap>
      <Tag color={event.isSuspended ? "red" : event.isPublished ? "green" : "default"}>
        {event.isSuspended ? "平台暂停" : event.isPublished ? "已发布" : "已下架"}
      </Tag>
      <Button
        loading={busy}
        onClick={() =>
          change(
            { isPublished: !event.isPublished },
            event.isPublished ? "下架活动？" : "发布活动？",
          )
        }
      >
        {event.isPublished ? "下架" : "发布"}
      </Button>
      {platform && (
        <Button
          danger={!event.isSuspended}
          loading={busy}
          onClick={() =>
            change(
              { isSuspended: !event.isSuspended },
              event.isSuspended ? "解除平台暂停？" : "暂停展示此活动？",
            )
          }
        >
          {event.isSuspended ? "解除暂停" : "暂停展示"}
        </Button>
      )}
    </Space>
  );
}
