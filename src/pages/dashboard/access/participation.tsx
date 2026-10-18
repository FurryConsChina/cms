import { Alert, App, Button, Form, Input, Typography } from "antd";
import { useSearchParams } from "react-router";
import { useState } from "react";
import { ParticipantAPI } from "@/api/cms/participant";
import { apiErrorMessage } from "@/utils/apiError";

export default function OwnParticipationPage() {
  const [params] = useSearchParams();
  const { message } = App.useApp();
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-4">
      <Typography.Title level={3}>参加者自助</Typography.Title>
      <Alert
        type="info"
        title="参加方成员可以修改自身参加记录的介绍；角色、摊位和顺序由活动管理者维护。"
        description="当前后端未提供「我的参加记录」查询，请使用活动管理者提供的参加记录标识。"
      />
      <Form
        layout="vertical"
        initialValues={{ id: params.get("id") ?? undefined }}
        onFinish={async ({ id, description }: { id: string; description?: string }) => {
          setBusy(true);
          try {
            await ParticipantAPI.updateOwn(id, description || null);
            message.success("介绍已更新");
          } catch (e) {
            message.error(apiErrorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Form.Item
          label="参加记录标识"
          name="id"
          rules={[
            { required: true },
            { pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="介绍" name="description">
          <Input.TextArea rows={8} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>
          更新介绍
        </Button>
      </Form>
    </div>
  );
}
