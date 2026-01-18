import DefaultContainer from "@/components/Layout/Container";
import { InferZodType } from "@/types/common";
import { useZodValidateData } from "@/utils/form";
import { App, Button, Flex, Form, Input, Typography } from "antd";
import { AuthAPI, UpdatePasswordApiBody } from "@/api/auth";
import type { User } from "@/types/User";
import useAuthStore from "@/stores/auth";

const { Title } = Typography;

interface UpdatePasswordProps {
  user?: User;
}

export default function UpdatePassword({ user }: UpdatePasswordProps) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const auth = useAuthStore();

  const onSubmit = async (value: InferZodType<typeof UpdatePasswordApiBody>) => {
    try {
      await AuthAPI.updatePassword(value);
      message.success("密码更新成功");
      form.resetFields();
      auth.logout();
    } catch (error) {
      message.error(`更新密码失败: ${JSON.stringify(error)}`);
    }
  };

  const handleFinish = (value: { newPassword: string }) => {
    const processedValues = useZodValidateData({ newPassword: value.newPassword }, UpdatePasswordApiBody);

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
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item
        label="新密码"
        required
        name="newPassword"
        rules={[
          { required: true, message: "请输入新密码" },
          { min: 8, message: "密码长度至少为8位" },
        ]}
      >
        <Input.Password placeholder="请输入新密码（至少8位）" />
      </Form.Item>

      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Flex>
    </Form>
  );
}
