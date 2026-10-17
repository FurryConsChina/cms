import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import {
  Alert,
  App,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { AccessAPI } from "@/api/cms/access";
import type { EntityKind, Invitation, Member } from "@/types/access";
import { auditActionLabel, targetTypeLabels } from "@/consts/labels";
import useAuthStore from "@/stores/auth";
import { apiErrorMessage } from "@/utils/apiError";

const inviteLink = (kind: EntityKind, token: string) =>
  `${window.location.origin}/dashboard/access?kind=${kind}&token=${encodeURIComponent(token)}`;

export function OrganizationAccessPage() {
  return <EntityAccess kind="organization" />;
}
export function ProfileAccessPage() {
  return <EntityAccess kind="profile" />;
}
export default function EntityAccess({ kind }: { kind: EntityKind }) {
  const { entityId } = useParams();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const id = entityId!;
  const [memberPage, setMemberPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [tab, setTab] = useState("members");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [createdToken, setCreatedToken] = useState<string>();
  const [form] = Form.useForm();
  const { data: entity, error: entityError } = useSWR(["access-entity", kind, id], () =>
    AccessAPI.entityName(kind, id),
  );
  const {
    data: members,
    error: membersError,
    isLoading: loadingMembers,
    mutate: refreshMembers,
  } = useSWR(["members", kind, id, memberPage], () =>
    AccessAPI.members(kind, id, { current: memberPage, pageSize: 20 }),
  );
  const canManage = !!members && !membersError;
  const {
    data: invitations,
    error: invitesError,
    mutate: refreshInvites,
  } = useSWR(canManage ? ["invitations", kind, id] : null, () => AccessAPI.invitations(kind, id));
  const { data: audit, error: auditError } = useSWR(
    tab === "audit" && kind === "organization" && canManage ? ["audit", id, auditPage] : null,
    () => AccessAPI.auditLogs(id, { current: auditPage, pageSize: 20 }),
  );
  const run = async (work: () => Promise<unknown>, refresh: () => unknown) => {
    try {
      await work();
      message.success("操作成功");
      await refresh();
    } catch (e) {
      message.error(apiErrorMessage(e));
      throw e;
    }
  };
  if (entityError) return <Alert type="error" title={apiErrorMessage(entityError)} />;
  return (
    <div className="space-y-4">
      <Space wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {entity?.name ?? "成员管理"}
        </Typography.Title>
        <Button onClick={() => navigate(`/dashboard/${kind}`)}>返回列表</Button>
      </Space>
      <Alert
        type="info"
        title="所有者可邀请和移除成员；所有者转移暂不支持。普通成员可以主动退出。"
      />
      {membersError && (
        <Alert
          type="warning"
          title="当前账号无法管理该实体成员。"
          description={apiErrorMessage(membersError)}
        />
      )}
      <Space>
        {canManage && (
          <Button type="primary" onClick={() => setInviteOpen(true)}>
            邀请成员
          </Button>
        )}
        <Button
          danger
          disabled={members?.records.some(
            (member) => member.userId === user?.id && member.role === "owner",
          )}
          onClick={() =>
            modal.confirm({
              title: "退出此实体？",
              content: "退出后将失去相应管理权限。所有者不能通过此入口退出。",
              onOk: async () => {
                await run(
                  () => AccessAPI.leave(kind, id),
                  () => {},
                );
                navigate(`/dashboard/${kind}`);
              },
            })
          }
        >
          退出成员关系
        </Button>
      </Space>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: "members",
            label: "成员",
            children: (
              <Table<Member>
                rowKey="id"
                loading={loadingMembers}
                dataSource={members?.records ?? []}
                pagination={{
                  current: memberPage,
                  pageSize: 20,
                  total: members?.total,
                  onChange: setMemberPage,
                  showSizeChanger: false,
                }}
                columns={[
                  { title: "名称", dataIndex: "name" },
                  { title: "邮箱", dataIndex: "email" },
                  {
                    title: "角色",
                    render: (_, v) => <Tag>{v.role === "owner" ? "所有者" : "成员"}</Tag>,
                  },
                  {
                    title: "操作",
                    render: (_, v) => (
                      <Button
                        danger
                        disabled={!canManage || v.role === "owner" || v.userId === user?.id}
                        onClick={() =>
                          modal.confirm({
                            title: `移除成员 ${v.name}？`,
                            onOk: () =>
                              run(() => AccessAPI.removeMember(kind, id, v.id), refreshMembers),
                          })
                        }
                      >
                        移除
                      </Button>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: "invitations",
            label: "邀请",
            disabled: !canManage,
            children: (
              <>
                {invitesError && <Alert type="error" title={apiErrorMessage(invitesError)} />}
                <Table<Invitation>
                  rowKey="id"
                  dataSource={invitations ?? []}
                  columns={[
                    { title: "邮箱", dataIndex: "email" },
                    {
                      title: "有效期",
                      render: (_, v) => new Date(v.expiresAt).toLocaleString("zh-CN"),
                    },
                    {
                      title: "状态",
                      render: (_, v) =>
                        v.revokedAt
                          ? "已撤销"
                          : v.acceptedAt
                            ? "已接受"
                            : new Date(v.expiresAt).getTime() < Date.now()
                              ? "已过期"
                              : "待接受",
                    },
                    {
                      title: "操作",
                      render: (_, v) => (
                        <Button
                          danger
                          disabled={
                            !!v.revokedAt ||
                            !!v.acceptedAt ||
                            new Date(v.expiresAt).getTime() <= Date.now()
                          }
                          onClick={() =>
                            modal.confirm({
                              title: "撤销邀请？",
                              onOk: () =>
                                run(() => AccessAPI.revokeInvitation(kind, v.id), refreshInvites),
                            })
                          }
                        >
                          撤销
                        </Button>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          ...(kind === "organization"
            ? [
                {
                  key: "audit",
                  label: "操作日志",
                  disabled: !canManage,
                  children: (
                    <>
                      {auditError && <Alert type="error" title={apiErrorMessage(auditError)} />}
                      <Table
                        rowKey="id"
                        dataSource={audit?.records ?? []}
                        pagination={{
                          current: auditPage,
                          pageSize: 20,
                          total: audit?.total,
                          onChange: setAuditPage,
                          showSizeChanger: false,
                        }}
                        columns={[
                          {
                            title: "时间",
                            render: (_, v) => new Date(v.createdAt).toLocaleString("zh-CN"),
                          },
                          { title: "操作", render: (_, v) => auditActionLabel(v.action) },
                          {
                            title: "操作者",
                            render: (_, v) => v.actor?.name ?? v.actor?.email ?? "系统",
                          },
                          {
                            title: "对象",
                            render: (_, v) => targetTypeLabels[v.targetType] ?? v.targetType,
                          },
                        ]}
                        expandable={{
                          expandedRowRender: (v) => (
                            <Descriptions
                              column={1}
                              items={Object.entries(v.metadata).map(([label, value]) => ({
                                key: label,
                                label,
                                children:
                                  typeof value === "object" ? JSON.stringify(value) : String(value),
                              }))}
                            />
                          ),
                        }}
                      />
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />
      <Modal
        title="邀请成员"
        open={inviteOpen}
        onCancel={() => setInviteOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={busy}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async ({ email }: { email: string }) => {
            setBusy(true);
            try {
              const result = await AccessAPI.invite(kind, id, email);
              setCreatedToken(result.token);
              setInviteOpen(false);
              form.resetFields();
              await refreshInvites();
            } catch (e) {
              message.error(apiErrorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Form.Item
            label="成员邮箱"
            name="email"
            rules={[{ required: true }, { type: "email" }, { max: 254 }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="邀请已生成"
        open={!!createdToken}
        onCancel={() => setCreatedToken(undefined)}
        footer={<Button onClick={() => setCreatedToken(undefined)}>完成</Button>}
      >
        <Alert
          type="warning"
          showIcon
          title="这个链接只显示一次。关闭前请复制并发给对方。"
          className="mb-4"
        />
        <Typography.Paragraph>
          对方使用被邀请的邮箱登录后，打开链接即可接受邀请。
        </Typography.Paragraph>
        {createdToken && (
          <Typography.Paragraph copyable={{ tooltips: ["复制邀请链接", "已复制"] }} code>
            {inviteLink(kind, createdToken)}
          </Typography.Paragraph>
        )}
      </Modal>
    </div>
  );
}
