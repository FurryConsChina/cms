import useAuthStore from "@/stores/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { login as userLogin } from "@/api/auth";
import { Button, Card, Flex, App, Typography, Form, Input } from "antd";
import { IconHome } from "@tabler/icons-react";
import { Segmented } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import z from "zod";

const { Link } = Typography;

export default function Auth() {
  const { login, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [currentSegment, setCurrentSegment] = useState<"login" | "register" | "reset">("login");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(
      z.object({
        email: z.string().email("无效的邮箱"),
        password: z.string().min(6, "密码长度至少为6位"),
      }),
    ),
  });

  const { mutate } = useMutation({
    mutationFn: userLogin,
    onSuccess: (data) => {
      login(data.user);
      refreshToken(data.token);
      navigate("/dashboard");
      message.success("登录成功");
    },
  });

  return (
    <div
      className="h-screen"
      style={{
        background: "radial-gradient(#e0f2fe,transparent)",
        backdropFilter: "blur(5px)",
      }}
    >
      <Flex justify="center" align="flex-end" style={{ height: "100%" }} vertical>
        <Card className="w-full md:w-96 h-full" style={{ margin: 20, borderRadius: 8 }}>
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

              <form
                onSubmit={handleSubmit((values) => {
                  mutate(values);
                })}
                className="space-y-6"
              >
                <Form.Item
                  label="邮箱"
                  required
                  validateStatus={errors.email ? "error" : undefined}
                  help={errors.email?.message}
                  style={{ marginBottom: 16 }}
                >
                  <Input type="email" autoComplete="email" placeholder="请输入您的注册邮箱" {...register("email")} />
                </Form.Item>
                <Form.Item
                  label="密码"
                  required
                  validateStatus={errors.password ? "error" : undefined}
                  help={errors.password?.message}
                  style={{ marginBottom: 16 }}
                >
                  <Input.Password placeholder="请输入您的密码" {...register("password")} />
                </Form.Item>
                <Flex justify="space-between" style={{ marginTop: 8 }}>
                  <Link style={{ fontSize: 14 }}>忘记密码了吗？</Link>
                </Flex>
                <Button type="primary" htmlType="submit" block style={{ marginTop: 24, borderRadius: 8 }}>
                  登录
                </Button>
              </form>
            </div>
            <Flex justify="center">
              <Link href="https://docs.furrycons.cn" target="_blank">
                <IconHome color="gray" size="18" />
              </Link>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </div>
  );
}
