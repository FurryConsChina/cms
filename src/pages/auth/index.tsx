import useAuthStore from "@/stores/auth";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";

import { login as userLogin } from "@/api/auth";
import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Flex,
  Divider,
  Image,
  UnstyledButton,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { Segmented } from "antd";
import { useState } from "react";
import { IconHome } from "@tabler/icons-react";

export default function Auth() {
  const { login, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const [currentSegment, setCurrentSegment] = useState<
    "login" | "register" | "reset"
  >("login");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },

    validate: zodResolver(
      z.object({
        email: z.string().email("无效的邮箱"),
        password: z.string().min(6, "密码长度至少为6位"),
      })
    ),
  });

  const { mutate } = useMutation({
    mutationFn: userLogin,
    onSuccess: (data) => {
      login(data.user);
      refreshToken(data.token);
      navigate("/dashboard");
      notifications.show({
        message: "登录成功",
      });
    },
  });

  return (
    <Container
      fluid
      className="h-screen"
      style={{
        background: "radial-gradient(#e0f2fe,transparent)",
        // backgroundImage: `url("http://s-sh-11810-static.oss.dogecdn.com/jesse.jpg")`,
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        // backgroundRepeat: "no-repeat",
        // backgroundAttachment: "fixed",
        backdropFilter: "blur(5px)",
      }}
    >
      <Flex
        justify={"center"}
        align={"flex-end"}
        style={{ height: "100%" }}
        direction="column"
      >
        <Paper
          withBorder
          shadow="sm"
          p={20}
          radius="md"
          my="20"
          className="w-full md:w-96 h-full"
        >
          <Flex direction="column" justify="space-between" h="100%">
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
                onSubmit={form.onSubmit((values) => {
                  mutate(values);
                })}
                className="space-y-6"
              >
                <TextInput
                  type="email"
                  required
                  autoComplete="email"
                  label="邮箱"
                  placeholder="请输入您的注册邮箱"
                  radius="md"
                  mt="lg"
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                />
                <PasswordInput
                  label="密码"
                  placeholder="请输入您的密码"
                  required
                  mt="lg"
                  radius="md"
                  key={form.key("password")}
                  {...form.getInputProps("password")}
                />
                <Group justify="space-between" mt="sm">
                  <Anchor component="button" size="sm">
                    忘记密码了吗？
                  </Anchor>
                  {/* <Anchor component="button" size="sm">
                    使用一次性登录代码
                  </Anchor> */}
                </Group>
                <Button type="submit" fullWidth mt="xl" radius="md">
                  登录
                </Button>
              </form>
            </div>
            <Center>
              <Anchor href="https://docs.furrycons.cn" target="_blank">
                <IconHome color="gray" size="18" />
              </Anchor>
            </Center>
          </Flex>
        </Paper>
      </Flex>
    </Container>
  );
}
