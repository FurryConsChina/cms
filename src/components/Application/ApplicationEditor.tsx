import { ApplicationApi, EditApplicationApiBody } from "@/api/developer/application";
import { InferZodType } from "@/types/common";
import { Application } from "@/types/application";
import { useZodValidateData } from "@/utils/form";
import { pickBy } from "es-toolkit";
import { App, Button, Flex, Form, Input, Modal } from "antd";

const { TextArea } = Input;

export default function ApplicationEditor({
  opened,
  onClose,
  editingApplication,
}: {
  opened: boolean;
  onClose: () => void;
  editingApplication: Application | null;
}) {
  return (
    <Modal
      open={opened}
      onCancel={onClose}
      title={editingApplication?.id ? "编辑应用" : "添加应用"}
      centered
      destroyOnHidden
      footer={null}
    >
      <EditorContent editingApplication={editingApplication} onClose={onClose} />
    </Modal>
  );
}

function EditorContent({
  editingApplication,
  onClose,
}: {
  editingApplication: Application | null;
  onClose: () => void;
}) {
  const { message, modal } = App.useApp();
  const cleanedApplication = editingApplication ? pickBy(editingApplication, (v) => v !== "" && v != null) : {};
  const [form] = Form.useForm();

  const initialValues = {
    name: cleanedApplication.name,
    description: cleanedApplication.description,
  };

  const onSubmit = async (value: InferZodType<typeof EditApplicationApiBody>) => {
    try {
      if (editingApplication?.id) {
        await ApplicationApi.updateApplication(editingApplication.id, value);
        message.success("更新应用成功");
        return onClose();
      }
      await ApplicationApi.createApplication(value);
      message.success("创建应用成功");
      return onClose();
    } catch (error) {
      message.error(`有错误发生: ${JSON.stringify(error)}`);
    }
  };

  const handleFinish = (value: typeof initialValues) => {
    const processedValues = useZodValidateData(value, EditApplicationApiBody);
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
      <Form.Item label="应用名称" required name="name" rules={[{ required: true, message: "请输入应用名称" }]}>
        <Input placeholder="请输入应用名称" />
      </Form.Item>

      <Form.Item label="应用描述" name="description">
        <TextArea placeholder="请输入应用描述" autoSize={{ minRows: 4 }} />
      </Form.Item>

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Flex>
    </Form>
  );
}
