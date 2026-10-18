import { apiErrorMessage } from "@/utils/apiError";
import { useState } from "react";
import { EditFeatureApiBody, FeatureAPI } from "@/api/cms/feature";
import { Feature, FeatureCategory, FeatureCategoryLabel } from "@/types/feature";
import { InferZodType } from "@/types/common";
import { useZodValidateData as validateData } from "@/utils/form";
import { pickBy } from "es-toolkit";
import { Alert, App, Button, Flex, Form, Input, Modal, Select } from "antd";

const { TextArea } = Input;

export default function FeatureEditor({
  opened,
  onClose,
  editingFeature,
  onSaved,
}: {
  opened: boolean;
  onClose: () => void;
  editingFeature: Feature | null;
  onSaved?: (feature: Feature) => void;
}) {
  return (
    <Modal
      open={opened}
      onCancel={onClose}
      title={editingFeature ? "编辑公共标签" : "添加公共标签"}
      centered
      destroyOnHidden
      footer={null}
    >
      <EditorContent editingFeature={editingFeature} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function EditorContent({
  editingFeature,
  onClose,
  onSaved,
}: {
  editingFeature: Feature | null;
  onClose: () => void;
  onSaved?: (feature: Feature) => void;
}) {
  const { message, modal } = App.useApp();
  const cleanedFeature = editingFeature ? pickBy(editingFeature, (v) => v !== "" && v != null) : {};
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const initialValues = {
    name: cleanedFeature.name,
    category: cleanedFeature.category,
    description: cleanedFeature.description,
  };

  const onSubmit = async (value: InferZodType<typeof EditFeatureApiBody>) => {
    if (saving) return;
    setSaving(true);
    try {
      const feature = editingFeature?.id
        ? await FeatureAPI.updateFeature(editingFeature.id, value)
        : await FeatureAPI.createFeature(value);
      onSaved?.(feature);
      message.success(editingFeature ? "更新标签成功" : "创建标签成功");
      onClose();
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    const processedValues = validateData(value, EditFeatureApiBody);
    if (processedValues.errors.length > 0) {
      return modal.warning({
        title: "接口数据校验失败☹️",
        content: processedValues.prettyErrors,
      });
    }
    if (processedValues.values) {
      void onSubmit(processedValues.values);
    }
    return;
  };

  return (
    <Form
      form={form}
      name="public-feature"
      onFinish={(value: typeof initialValues) => {
        void handleFinish(value);
      }}
      layout="vertical"
      initialValues={initialValues}
    >
      {editingFeature && (
        <Alert
          type="warning"
          showIcon
          title="公共标签由多个活动共用"
          description="保存后立即生效，将影响所有引用此标签的活动。"
          style={{ marginBottom: 16 }}
        />
      )}
      <Form.Item
        label="标签名称"
        required
        name="name"
        rules={[{ required: true, message: "请输入标签名称" }]}
      >
        <Input placeholder="请输入标签名称" />
      </Form.Item>

      <Form.Item
        label="标签分类"
        required
        name="category"
        rules={[{ required: true, message: "请选择标签分类" }]}
      >
        <Select
          placeholder="请选择标签分类"
          options={Object.values(FeatureCategory).map((item) => ({
            label: FeatureCategoryLabel[item],
            value: item,
          }))}
        />
      </Form.Item>

      <Form.Item label="标签简述" name="description" extra="标签简述可能会在未来展示于筛选设置中。">
        <TextArea placeholder="请输入标签简述" />
      </Form.Item>

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={saving}>
          {editingFeature ? "保存公共标签" : "添加公共标签"}
        </Button>
      </Flex>
    </Form>
  );
}
