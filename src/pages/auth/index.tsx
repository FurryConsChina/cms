import useAuthStore from "@/stores/auth";
import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/api/auth";
import { Button, Card, Flex, App, Typography, Form, Input, Segmented } from "antd";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconFileDescription } from "@tabler/icons-react";
import { CapWidget, CapWidgetRef } from "@/components/CapWidget";
import { AxiosError } from "axios";

const { Link } = Typography;

export default function Auth() {
  const { login, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const capWidgetRef = useRef<CapWidgetRef>(null);

  const [currentSegment, setCurrentSegment] = useState<"login" | "register" | "reset">("login");

  const loginMutation = useMutation({
    mutationFn: AuthAPI.login,
    onSuccess: (data) => {
      login(data.user);
      refreshToken(data.token);
      navigate("/dashboard");
      message.success("登录成功");
    },
    onError: (error) => {
      capWidgetRef.current?.reset();
      form.setFieldValue("captchaToken", undefined);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          message.error("邮箱或密码错误");
          return;
        }
        message.error(error.response?.data?.message || "登录失败");
      } else {
        message.error("登录失败: 未知错误");
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: AuthAPI.register,
    onSuccess: (data) => {
      login(data.user);
      refreshToken(data.token);
      navigate("/dashboard");
      message.success("注册成功");
    },
    onError: (error) => {
      capWidgetRef.current?.reset();
      form.setFieldValue("captchaToken", undefined);
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          message.error("该邮箱已被注册");
          return;
        }
        message.error(error.response?.data?.message || "注册失败");
      } else {
        message.error("注册失败: 未知错误");
      }
    },
  });

  const handleFinish = (values: { name: string; email: string; password: string; captchaToken: string }) => {
    if (currentSegment === "login") {
      loginMutation.mutate(values);
    } else if (currentSegment === "register") {
      registerMutation.mutate({
        name: values.name,
        email: values.email,
        password: values.password,
        captchaToken: values.captchaToken,
      });
    }
  };

  return (
    <div
      className="h-screen"
      style={{
        background: "radial-gradient(#e0f2fe,transparent)",
        backdropFilter: "blur(5px)",
      }}
    >
      <Flex justify="center" className="items-center md:items-end" style={{ height: "100%" }} vertical>
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
                onChange={(value) => {
                  setCurrentSegment(value as "login" | "register" | "reset");
                  form.resetFields();
                }}
                options={[
                  { label: "登录", value: "login" },
                  { label: "注册", value: "register" },
                ]}
              />

              <Form form={form} onFinish={handleFinish} layout="vertical">
                {currentSegment === "register" && (
                  <Form.Item
                    label="用户名"
                    name="name"
                    rules={[
                      { required: true, message: "请输入您的昵称" },
                      { min: 2, message: "昵称至少2个字符" },
                      { max: 20, message: "昵称最多20个字符" },
                    ]}
                    style={{ marginBottom: 16 }}
                  >
                    <Input autoComplete="username" placeholder="请输入您的昵称" />
                  </Form.Item>
                )}
                <Form.Item
                  label="邮箱"
                  name="email"
                  rules={[
                    { required: true, message: "请输入邮箱" },
                    { type: "email", message: "无效的邮箱" },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Input type="email" autoComplete="email" placeholder="请输入您的邮箱" />
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
                  <Input.Password
                    placeholder="请输入您的密码"
                    autoComplete={currentSegment === "register" ? "new-password" : "current-password"}
                  />
                </Form.Item>
                {currentSegment === "login" && (
                  <Flex justify="space-between" style={{ marginTop: 8 }}>
                    <Link style={{ fontSize: 14 }}>忘记密码了吗？</Link>
                  </Flex>
                )}
                <Form.Item
                  name="captchaToken"
                  hidden
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) {
                          message.error("请先完成人机验证");
                          return Promise.reject();
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                />
                <CapWidget
                  ref={capWidgetRef}
                  apiEndpoint="https://cap.furrycons.cn/98300af613/"
                  onSolve={(token) => {
                    console.log("token:", token);
                    form.setFieldValue("captchaToken", token);
                  }}
                  onProgress={(progress) => console.log(progress)}
                  onCapError={(message) => console.error(message)}
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loginMutation.isPending || registerMutation.isPending}
                  style={{ marginTop: 24 }}
                >
                  {currentSegment === "login" ? "登录" : "注册"}
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
