import { useState } from "react";
import { App, Button } from "antd";
import { EventAPI } from "@/api/cms/event";
import type { EventItem } from "@/types/event";
import { apiErrorMessage } from "@/utils/apiError";

export default function EventVisibility({
  event,
  onChange,
}: {
  event: Pick<EventItem, "id" | "isPublished" | "isSuspended">;
  onChange: () => void;
}) {
  const { message, modal } = App.useApp();
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
    <Button
      loading={busy}
      onClick={() =>
        change({ isPublished: !event.isPublished }, event.isPublished ? "下架活动？" : "发布活动？")
      }
    >
      {event.isPublished ? "下架" : "发布"}
    </Button>
  );
}
