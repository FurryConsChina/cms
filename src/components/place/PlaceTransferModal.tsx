import { useRef, useState } from "react";
import { Alert, App, Form, Modal, Typography } from "antd";
import PlaceSelector from "@/components/place/PlaceSelector";
import type { Place } from "@/types/place";
import { apiErrorMessage } from "@/utils/apiError";

export default function PlaceTransferModal({
  place,
  onCancel,
  onTransfer,
}: {
  place: Place;
  onCancel: () => void;
  onTransfer: (targetPlaceId: string) => Promise<void>;
}) {
  const { message } = App.useApp();
  const [targetPlaceId, setTargetPlaceId] = useState<string>();
  const [transferring, setTransferring] = useState(false);
  const submitting = useRef(false);

  const transfer = () => {
    if (!targetPlaceId || targetPlaceId === place.id || submitting.current) return;
    submitting.current = true;
    setTransferring(true);
    onTransfer(targetPlaceId)
      .finally(() => {
        submitting.current = false;
        setTransferring(false);
      })
      .catch((error: unknown) => {
        message.error(apiErrorMessage(error, "转移活动失败，请重试"));
      });
  };

  return (
    <Modal
      title="转移活动"
      open
      centered
      okText="确认转移"
      cancelText="取消"
      onOk={transfer}
      onCancel={() => {
        if (!submitting.current) onCancel();
      }}
      confirmLoading={transferring}
      okButtonProps={{ disabled: !targetPlaceId || targetPlaceId === place.id }}
      cancelButtonProps={{ disabled: transferring }}
      closable={!transferring}
      keyboard={!transferring}
      mask={{ closable: false }}
    >
      <Alert
        type="warning"
        showIcon
        className="mb-4"
        title="转移该地点下的所有活动"
        description="转移包括已下架和已删除的活动。目标地点必须属于同一地区；来源地点、活动地区和地点补充说明保持不变。"
      />
      <Form layout="vertical">
        <Form.Item label="来源地点">
          <Typography.Text>
            {place.name}
            {place.address ? `（${place.address}）` : ""}
          </Typography.Text>
        </Form.Item>
        <Form.Item label="目标地点（同一地区）" htmlFor="transfer-target-place" required>
          <PlaceSelector
            id="transfer-target-place"
            regionId={place.regionId}
            value={targetPlaceId}
            onChange={setTargetPlaceId}
            disabledIds={[place.id]}
            antdSelectProps={{ disabled: transferring, placeholder: "搜索并选择目标地点" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
