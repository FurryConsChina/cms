import { createFeature, updateFeature } from "@/api/dashboard/feature";
import {
  FeatureCategory,
  FeatureCategoryLabel,
  type CrateFeatureType,
  type EditableFeatureType,
} from "@/types/feature";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Flex, App, Form, Select, Input } from "antd";
import { z } from "zod";

const { TextArea } = Input;

export default function FeatureEditor({
  opened,
  onClose,
  editingFeature,
}: {
  opened: boolean;
  onClose: () => void;
  editingFeature: EditableFeatureType | null;
}) {
  return (
    <Modal open={opened} onCancel={onClose} title="标签编辑" centered footer={null}>
      {opened && <ModalComponent editingFeature={editingFeature} onClose={onClose} />}
    </Modal>
  );
}

function ModalComponent({
  editingFeature,
  onClose,
}: {
  editingFeature: EditableFeatureType | null;
  onClose: () => void;
}) {
  const { message } = App.useApp();

  type FeatureFormValues = {
    name: string;
    category: string;
    description: string;
  };

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeatureFormValues>({
    defaultValues: {
      name: editingFeature?.name || "",
      category: editingFeature?.category || "",
      description: editingFeature?.description || "",
    },
  });

  // Create a compatible form object for child components
  const form = {
    register,
    setValue,
    watch,
    errors,
    values: watch(),
    setFieldValue: setValue,
    getInputProps: (name: string) => ({
      ...register(name),
      error: errors[name]?.message,
    }),
    onSubmit: (onValid: (values: FeatureFormValues) => void, onInvalid?: (errors: typeof errors) => void) => {
      return rhfHandleSubmit(onValid, onInvalid);
    },
  };

  const handleSubmit = async (value: FeatureFormValues) => {
    if (editingFeature?.id) {
      const res = await updateFeature({ ...value, id: editingFeature.id });
      console.log(res);
      message.success("更新标签成功");
      return onClose();
    }
    const res = await createFeature(value);
    console.log(res);
    message.success("创建标签成功");
    return onClose();
  };

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Form.Item
        label="标签名称"
        required
        validateStatus={form.getInputProps("name").error ? "error" : undefined}
        help={form.getInputProps("name").error}
      >
        <Input placeholder="请输入标签名称" {...form.getInputProps("name")} />
      </Form.Item>

      <Form.Item
        label="标签分类"
        required
        validateStatus={form.getInputProps("category").error ? "error" : undefined}
        help={form.getInputProps("category").error}
      >
        <Select
          placeholder="请选择标签分类"
          options={Object.values(FeatureCategory).map((item) => ({
            label: FeatureCategoryLabel[item],
            value: item,
          }))}
          value={form.values.category}
          onChange={(value) => form.setFieldValue("category", value)}
        />
      </Form.Item>

      <Form.Item
        label="标签简述"
        help="标签简述可能会在未来展示于筛选设置中。"
        validateStatus={form.getInputProps("description").error ? "error" : undefined}
      >
        <TextArea placeholder="请输入标签简述" {...form.getInputProps("description")} />
      </Form.Item>

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Flex>
    </form>
  );
}
