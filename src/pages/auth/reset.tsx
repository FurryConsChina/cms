import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { App, Button, Card, Form, Input, Segmented, Typography } from "antd";
import { AuthAPI } from "@/api/auth";
import { CapWidget, type CapWidgetRef } from "@/components/cap-widget/CapWidget";
import { apiErrorMessage } from "@/utils/apiError";

export default function ResetPasswordPage() {
  const { message } = App.useApp();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("token") ? "reset" : "request");
  const [busy, setBusy] = useState(false);
  const cap = useRef<CapWidgetRef>(null);
  const [form] = Form.useForm();
  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-slate-100">
      <Card style={{ width: 450 }}>
        <Typography.Title level={3}>找回密码</Typography.Title>
        <Segmented
          block
          value={mode}
          onChange={setMode}
          options={[
            { label: "申请重置", value: "request" },
            { label: "填写重置凭证", value: "reset" },
          ]}
        />
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            email: params.get("email") ?? undefined,
            resetToken: params.get("token") ?? undefined,
          }}
          onFinish={async (values: {
            email: string;
            captchaToken: string;
            resetToken: string;
            newPassword: string;
          }) => {
            setBusy(true);
            try {
              if (mode === "request") {
                await AuthAPI.requestPasswordReset({
                  email: values.email,
                  captchaToken: values.captchaToken,
                });
                message.success("申请已受理，请查看邮箱中的重置凭证");
                setMode("reset");
              } else {
                await AuthAPI.resetPassword({
                  email: values.email,
                  resetToken: values.resetToken.trim(),
                  newPassword: values.newPassword,
                });
                message.success("密码已重置，请使用新密码登录");
                form.resetFields();
              }
            } catch (e) {
              message.error(apiErrorMessage(e));
            } finally {
              cap.current?.reset();
              form.setFieldValue("captchaToken", undefined);
              setBusy(false);
            }
          }}
          className="mt-4"
        >
          <Form.Item label="账号邮箱" name="email" rules={[{ required: true }, { type: "email" }]}>
            <Input autoComplete="email" />
          </Form.Item>
          {mode === "request" ? (
            <>
              <Form.Item
                name="captchaToken"
                hidden
                rules={[{ required: true, message: "请先完成人机验证" }]}
              >
                <Input />
              </Form.Item>
              <CapWidget
                ref={cap}
                apiEndpoint="https://cap.furrycons.cn/5ddbdcfd4c/"
                onSolve={(token) => form.setFieldValue("captchaToken", token)}
              />
            </>
          ) : (
            <>
              <Form.Item
                label="邮箱中的重置凭证"
                name="resetToken"
                rules={[
                  { required: true },
                  { pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[{ required: true }, { min: 8 }, { max: 64 }]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </>
          )}
          <Button type="primary" htmlType="submit" loading={busy} block>
            {mode === "request" ? "申请重置" : "重置密码"}
          </Button>
        </Form>
        <Link to="/auth">返回登录</Link>
      </Card>
    </div>
  );
}
