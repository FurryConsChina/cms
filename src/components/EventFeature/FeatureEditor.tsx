import { EditFeatureApiBody, FeatureAPI } from "@/api/dashboard/feature";
import { Feature, FeatureCategory, FeatureCategoryLabel } from "@/types/feature";
import { InferZodType } from "@/types/common";
import { useZodValidateData } from "@/utils/form";
import { pickBy } from "es-toolkit";
import { App, Button, Flex, Form, Input, Modal, Select } from "antd";

const { TextArea } = Input;

export default function FeatureEditor({
  opened,
  onClose,
  editingFeature,
}: {
  opened: boolean;
  onClose: () => void;
  editingFeature: Feature | null;
}) {
  return (
    <Modal open={opened} onCancel={onClose} title="标签编辑" centered destroyOnHidden footer={null}>
      <EditorContent editingFeature={editingFeature} onClose={onClose} />
    </Modal>
  );
}

function EditorContent({
  editingFeature,
  onClose,
}: {
  editingFeature: Feature | null;
  onClose: () => void;
}) {
  const { message, modal } = App.useApp();
  const cleanedFeature = editingFeature ? pickBy(editingFeature, (v) => v !== "" && v != null) : {};
  const [form] = Form.useForm();

  const initialValues = {
    name: cleanedFeature.name,
    category: cleanedFeature.category,
    description: cleanedFeature.description,
  };

  const onSubmit = async (value: InferZodType<typeof EditFeatureApiBody>) => {
    try {
      if (editingFeature?.id) {
        await FeatureAPI.updateFeature(editingFeature.id, value);
        message.success("更新标签成功");
        return onClose();
      }
      await FeatureAPI.createFeature(value);
      message.success("创建标签成功");
      return onClose();
    } catch (error) {
      message.error(`有错误发生: ${JSON.stringify(error)}`);
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    const processedValues = useZodValidateData(value, EditFeatureApiBody);
    if (processedValues.errors.length > 0) {
      return modal.warning({
        title: "接口数据校验失败☹️",
        content: processedValues.prettyErrors,
      });
    }
    if (processedValues.values) {
      return onSubmit(processedValues.values);
    }
    return;
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical" initialValues={initialValues}>
      <Form.Item label="标签名称" required name="name" rules={[{ required: true, message: "请输入标签名称" }]}>
        <Input placeholder="请输入标签名称" />
      </Form.Item>

      <Form.Item label="标签分类" required name="category" rules={[{ required: true, message: "请选择标签分类" }]}>
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
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Flex>
    </Form>
  );
}
