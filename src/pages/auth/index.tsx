import useAuthStore from "@/stores/auth";
import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/api/auth";
import { Button, Card, Flex, App, Typography, Form, Input, Segmented } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconFileDescription } from "@tabler/icons-react";

const { Link } = Typography;

export default function Auth() {
  const { login, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [currentSegment, setCurrentSegment] = useState<"login" | "register" | "reset">("login");

  const { mutate, isPending } = useMutation({
    mutationFn: AuthAPI.login,
    onSuccess: (data) => {
      login(data.user);
      refreshToken(data.token);
      navigate("/dashboard");
      message.success("登录成功");
    },
    onError: (error) => {
      message.error(`登录失败: ${error instanceof Error ? error.message : "未知错误"}`);
    },
  });

  const handleFinish = (values: { email: string; password: string }) => {
    mutate(values);
  };

  return (
    <div
      className="h-screen"
      style={{
        background: "radial-gradient(#e0f2fe,transparent)",
        backdropFilter: "blur(5px)",
      }}
    >
      <Flex justify="center" align="flex-end" style={{ height: "100%" }} vertical>
        <Card
          className="w-full md:w-96 h-full"
          style={{ margin: 20, borderRadius: 8 }}
          styles={{ body: { height: "100%" } }}
        >
          <Flex vertical justify="space-between" style={{ height: "100%" }}>
            <div>
              <Segmented
                value={currentSegment}
                block
                size="middle"
                style={{ marginBottom: 8 }}
                onChange={setCurrentSegment}
                options={[
                  { label: "登录", value: "login" },
                  { label: "注册", value: "register" },
                ]}
              />

              <Form form={form} onFinish={handleFinish} layout="vertical">
                <Form.Item
                  label="邮箱"
                  name="email"
                  rules={[
                    { required: true, message: "请输入邮箱" },
                    { type: "email", message: "无效的邮箱" },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Input type="email" autoComplete="email" placeholder="请输入您的注册邮箱" />
                </Form.Item>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[
                    { required: true, message: "请输入密码" },
                    { min: 6, message: "密码长度至少为6位" },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Input.Password placeholder="请输入您的密码" />
                </Form.Item>
                <Flex justify="space-between" style={{ marginTop: 8 }}>
                  <Link style={{ fontSize: 14 }}>忘记密码了吗？</Link>
                </Flex>
                <Button type="primary" htmlType="submit" block loading={isPending} style={{ marginTop: 24 }}>
                  登录
                </Button>
              </Form>
            </div>
            <Flex justify="center">
              <Link href="https://docs.furrycons.cn" target="_blank">
                <IconFileDescription color="gray" size="18" />
              </Link>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </div>
  );
}
