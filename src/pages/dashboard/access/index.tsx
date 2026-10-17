import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  Modal,
  Radio,
  Segmented,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { AccessAPI } from "@/api/cms/access";
import type { Claim, EntityKind } from "@/types/access";
import useAuthStore from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import { apiErrorMessage } from "@/utils/apiError";

export default function AccessPage() {
  const role = useAuthStore((state) => state.user?.role);
  const { message } = App.useApp();
  const [params, setParams] = useSearchParams();
  const [kind, setKind] = useState<EntityKind>(
    params.get("kind") === "profile" ? "profile" : "organization",
  );
  const [tab, setTab] = useState(params.get("token") ? "accept" : "mine");
  const [requestOpen, setRequestOpen] = useState(false);
  const [reviewing, setReviewing] = useState<Claim>();
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [acceptForm] = Form.useForm();
  const canReview = isAdmin(role);
  const pending = tab === "pending" && canReview;
  const { data, error, isLoading, mutate } = useSWR(
    tab === "accept" ? null : ["claims", kind, pending, role],
    () => AccessAPI.claims(kind, pending),
  );
  return (
    <div className="space-y-4">
      <Typography.Title level={3}>认领与邀请</Typography.Title>
      <Segmented
        value={kind}
        onChange={(value) => {
          setKind(value as EntityKind);
          setTab("mine");
        }}
        options={[
          { value: "organization", label: "组织" },
          { value: "profile", label: "主体资料" },
        ]}
      />
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: "mine", label: "我的认领" },
          ...(canReview ? [{ key: "pending", label: "待审核认领" }] : []),
          { key: "accept", label: "接受邀请" },
        ]}
      />
      {tab === "accept" ? (
        <Form
          form={acceptForm}
          layout="vertical"
          initialValues={{ token: params.get("token") ?? undefined }}
          onFinish={async ({ token }: { token: string }) => {
            setBusy(true);
            try {
              await AccessAPI.acceptInvitation(kind, token.trim());
              message.success(
                `邀请已接受，现在可以在「${kind === "organization" ? "组织" : "主体资料"}」页面管理它`,
              );
              acceptForm.resetFields();
              setParams({});
            } catch (e) {
              message.error(apiErrorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Alert
            type="info"
            showIcon
            className="mb-4"
            title={
              params.get("token")
                ? `你收到了一个${kind === "organization" ? "组织" : "主体资料"}邀请。确认当前账号是收到邀请的邮箱，然后点击「接受邀请」。`
                : "打开邀请链接会自动填写邀请凭证。也可以把凭证粘贴到下面。"
            }
          />
          <Form.Item
            label="邀请凭证"
            name="token"
            rules={[{ required: true }, { min: 32 }, { max: 512 }]}
          >
            <Input.TextArea autoComplete="off" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={busy}>
            接受邀请
          </Button>
        </Form>
      ) : (
        <>
          <Space>
            <Button onClick={() => void mutate()}>刷新</Button>
            {!pending && (
              <Button type="primary" onClick={() => setRequestOpen(true)}>
                申请认领
              </Button>
            )}
          </Space>
          {error && <Alert type="error" title={apiErrorMessage(error)} />}
          <Table<Claim>
            rowKey="id"
            loading={isLoading}
            dataSource={data ?? []}
            columns={[
              {
                title: "认领对象",
                render: (_, v) =>
                  v.organization?.name || v.profile?.name || v.organizationId || v.profileId,
              },
              { title: "申请人", render: (_, v) => v.user?.name || v.user?.email || v.userId },
              { title: "申请理由", dataIndex: "reason" },
              {
                title: "状态",
                render: (_, v) => (
                  <Tag>
                    {{ pending: "待审核", approved: "已批准", rejected: "已拒绝" }[v.status]}
                  </Tag>
                ),
              },
              { title: "审核备注", dataIndex: "reviewNote" },
              ...(pending
                ? [
                    {
                      title: "操作",
                      render: (_: unknown, v: Claim) => (
                        <Button
                          onClick={() => {
                            reviewForm.resetFields();
                            reviewForm.setFieldsValue({ approved: true });
                            setReviewing(v);
                          }}
                        >
                          审核
                        </Button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </>
      )}
      <Modal
        title="申请认领"
        open={requestOpen}
        onCancel={() => setRequestOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={busy}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async ({ targetId, reason }: { targetId: string; reason: string }) => {
            setBusy(true);
            try {
              await AccessAPI.claim(kind, targetId.trim(), reason);
              message.success("认领申请已提交");
              setRequestOpen(false);
              form.resetFields();
              await mutate();
            } catch (e) {
              message.error(apiErrorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Form.Item
            label={kind === "organization" ? "组织标识" : "主体标识"}
            name="targetId"
            extra="填写目标实体的 UUID；未认领实体目前不在后台搜索列表中。"
            rules={[
              { required: true },
              { pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="认领理由"
            name="reason"
            rules={[{ required: true }, { min: 10 }, { max: 2000 }]}
          >
            <Input.TextArea rows={5} showCount maxLength={2000} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="审核认领"
        open={!!reviewing}
        onCancel={() => setReviewing(undefined)}
        onOk={() => reviewForm.submit()}
        confirmLoading={busy}
      >
        <Typography.Paragraph>{reviewing?.reason}</Typography.Paragraph>
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={async ({ approved, note }: { approved: boolean; note?: string }) => {
            setBusy(true);
            try {
              await AccessAPI.reviewClaim(kind, reviewing!.id, approved, note);
              message.success("审核完成");
              setReviewing(undefined);
              await mutate();
            } catch (e) {
              message.error(apiErrorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Form.Item label="审核结果" name="approved">
            <Radio.Group
              options={[
                { label: "批准", value: true },
                { label: "拒绝", value: false },
              ]}
            />
          </Form.Item>
          <Form.Item label="审核备注" name="note">
            <Input.TextArea maxLength={2000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
