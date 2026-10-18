import type { EventFeature } from "@/types/event";
import type { Feature } from "@/types/feature";
import { Alert, Form, Input, Modal, Tabs } from "antd";
import { useState } from "react";
import EventFeatureSelector from "./EventFeatureSelector";

interface EventFeatureModalProps {
  editingFeature?: EventFeature;
  features: EventFeature[];
  platform: boolean;
  onClose: () => void;
  onConfirm: (features: EventFeature[]) => void;
}

export default function EventFeatureModal({
  editingFeature,
  features,
  platform,
  onClose,
  onConfirm,
}: EventFeatureModalProps) {
  const [tab, setTab] = useState(platform ? "public" : "private");
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [form] = Form.useForm<{ name: string; featureIds: string[] }>();
  const privateTab = !!editingFeature || tab === "private";

  const handleConfirm = async () => {
    const values = await form.validateFields();
    if (privateTab) {
      onConfirm([{ ...editingFeature, name: values.name.trim(), isPublic: false }]);
    } else {
      onConfirm(
        values.featureIds.map((id: string) => {
          const feature = selectedFeatures.find((item) => item.id === id)!;
          return { id: feature.id, name: feature.name, isPublic: true };
        }),
      );
    }
  };

  return (
    <Modal
      open
      centered
      title={editingFeature ? "编辑活动专属标签" : "添加标签"}
      okText={editingFeature ? "确定" : "添加"}
      cancelText="取消"
      onCancel={onClose}
      onOk={() => void handleConfirm().catch(() => {})}
    >
      {!editingFeature && (
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            { key: "public", label: "公共标签", disabled: !platform },
            { key: "private", label: "活动专属标签" },
          ]}
        />
      )}
      <Form
        form={form}
        name="event-feature"
        layout="vertical"
        initialValues={{ name: editingFeature?.name, featureIds: [] }}
      >
        {privateTab ? (
          <>
            <Alert
              type="info"
              showIcon
              title="仅用于当前活动，随活动一起保存。"
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              name="name"
              label="标签名称"
              rules={[
                { required: true, whitespace: true, message: "请输入标签名称" },
                { max: 256, message: "标签名称不能超过 256 个字符" },
                {
                  validator: (_, value: string) =>
                    features.some(
                      (feature) =>
                        feature !== editingFeature &&
                        !feature.isPublic &&
                        feature.name === value?.trim(),
                    )
                      ? Promise.reject(new Error("已添加同名活动专属标签"))
                      : Promise.resolve(),
                },
              ]}
            >
              <Input autoFocus placeholder="请输入活动专属标签名称" maxLength={256} />
            </Form.Item>
          </>
        ) : (
          <Form.Item
            name="featureIds"
            label="选择公共标签"
            extra="可搜索并选择多个标签。已添加的标签不可重复选择。"
            rules={[{ required: true, message: "请选择公共标签" }]}
          >
            <EventFeatureSelector
              selectedOptions={selectedFeatures}
              onSelect={(selected) => setSelectedFeatures(selected || [])}
              disabledIds={features.flatMap((feature) =>
                feature.isPublic && feature.id ? [feature.id] : [],
              )}
              antdSelectProps={{ placeholder: "搜索公共标签" }}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
