import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import useSWR from "swr";
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import type { ColumnsType } from "antd/es/table";
import { Alert, App, Button, Flex, Form, Modal, Space, Table, Tag } from "antd";
import { ParticipantAPI, participantSchema, toParticipantInput } from "@/api/cms/participant";
import type { Participant } from "@/types/participant";
import type { List } from "@/types/request";
import DefaultContainer from "@/components/layout/Container";
import useMediaBusy from "@/components/media/useMediaBusy";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";
import ParticipantFields from "./ParticipantFields";

const roles = { guest: "嘉宾", exhibitor: "展商", sponsor: "赞助商", media: "媒体" };

const participantName = (v: Participant) => v.profile?.name || v.organization?.name || "未命名";

export default function EventParticipantPanel({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const [role, setRole] = useState<Participant["role"]>();
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  useEffect(() => {
    setCurrent(1);
  }, [eventId, role]);
  const { data, error, isLoading, mutate } = useSWR<List<Participant>, Error>(
    ["participants", eventId, role, current, pageSize],
    () => ParticipantAPI.list({ current, pageSize, eventId, role }),
  );
  const [sorting, setSorting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [opening, setOpening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const submitting = useRef(false);
  const [form] = Form.useForm();
  const { busy: mediaBusy, onBusyChange } = useMediaBusy();
  Form.useWatch([], form);
  const { confirmationModal } = useUnsavedChangesGuard({
    dirty: creating && (dirty || form.isFieldsTouched()),
    busy: saving || mediaBusy || submitting.current,
  });
  const openEditor = (participantId: string) => {
    navigate(`/dashboard/event/${eventId}/participants/${participantId}/edit`);
  };
  const refresh = () => {
    mutate().catch((error: unknown) => {
      message.error(apiErrorMessage(error));
    });
  };
  const openCreate = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const { total } = await ParticipantAPI.list({ eventId, current: 1, pageSize: 1 });
      form.resetFields();
      const values = {
        eventId,
        role: "guest",
        sortOrder: total,
        isFeatured: false,
        profileId: null,
        organizationId: null,
        appearanceDates: [],
        portrait: [],
        gallery: [],
        subjectType: "profile",
      };
      form.setFieldsValue(values);
      form.setFields(Object.keys(values).map((name) => ({ name, touched: false })));
      setDirty(false);
      setCreating(true);
    } finally {
      setOpening(false);
    }
  };
  const closeCreate = () => {
    if (submitting.current || mediaBusy) return;
    if (!dirty && !form.isFieldsTouched()) {
      setCreating(false);
      return;
    }
    modal.confirm({
      title: "放弃未保存的修改？",
      okText: "放弃",
      okButtonProps: { danger: true },
      cancelText: "继续编辑",
      onOk: () => setCreating(false),
    });
  };
  const createParticipant = async ({ subjectType, ...values }: Record<string, unknown>) => {
    if (submitting.current || mediaBusy) return;
    const parsed = participantSchema.safeParse(
      toNullable({
        ...values,
        profileId: subjectType === "profile" ? values.profileId : null,
        organizationId: subjectType === "organization" ? values.organizationId : null,
      }),
    );
    if (!parsed.success) {
      form.setFields(
        parsed.error.issues
          .filter((issue) => issue.path.length)
          .map((issue) => ({ name: issue.path as (string | number)[], errors: [issue.message] })),
      );
      message.error(parsed.error.issues[0]?.message ?? "请检查表单内容");
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      await ParticipantAPI.save(undefined, parsed.data);
      setDirty(false);
      setCreating(false);
      message.success("已创建");
      mutate().catch(() => message.warning("已创建，列表刷新失败，请手动刷新"));
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const records = data?.records ?? [];
  const reorder: ((record: Participant, sortOrder: number) => Promise<Participant>) | undefined =
    role
      ? undefined
      : (record, sortOrder) =>
          ParticipantAPI.save(record.id, { ...toParticipantInput(record), sortOrder });
  const move = async (index: number, offset: -1 | 1) => {
    if (!reorder) return;
    const next = [...records];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    const base = (current - 1) * pageSize;
    setSorting(true);
    try {
      for (const [i, record] of next.entries()) {
        if (record.sortOrder !== base + i) await reorder(record, base + i);
      }
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setSorting(false);
      await mutate();
    }
  };
  const columns: ColumnsType<Participant> = [
    ...(reorder
      ? [
          {
            title: "顺序",
            key: "order",
            width: 90,
            render: (_: unknown, _record: Participant, index: number) => (
              <Space.Compact>
                <Button
                  size="small"
                  aria-label="上移"
                  disabled={sorting || index === 0}
                  icon=<IconArrowUp size={14} />
                  onClick={() => {
                    move(index, -1).catch((error: unknown) => {
                      message.error(apiErrorMessage(error));
                    });
                  }}
                />
                <Button
                  size="small"
                  aria-label="下移"
                  disabled={sorting || index === records.length - 1}
                  icon=<IconArrowDown size={14} />
                  onClick={() => {
                    move(index, 1).catch((error: unknown) => {
                      message.error(apiErrorMessage(error));
                    });
                  }}
                />
              </Space.Compact>
            ),
          },
        ]
      : []),
    {
      title: "参加者",
      render: (_, v) => (
        <Space>
          {participantName(v)}
          <Tag>{v.organization ? "组织" : "主体资料"}</Tag>
        </Space>
      ),
    },
    {
      title: "角色",
      key: "role",
      filters: Object.entries(roles).map(([value, text]) => ({ value, text })),
      filterMultiple: false,
      filteredValue: role ? [role] : null,
      render: (_, v) => roles[v.role],
    },
    { title: "摊位", dataIndex: "booth" },
    { title: "级别", dataIndex: "tier" },
    { title: "重点展示", render: (_, v) => (v.isFeatured ? <Tag color="gold">重点</Tag> : "—") },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button onClick={() => openEditor(record.id)}>编辑</Button>
          <Button
            danger
            onClick={() =>
              modal.confirm({
                title: "确认移除这位参加者？",
                content: "只移除当前展会的参加关系，不会删除主体资料或组织。",
                okText: "移除",
                cancelText: "取消",
                okButtonProps: { danger: true },
                onOk: async () => {
                  try {
                    await ParticipantAPI.delete(record.id);
                    message.success("已移除");
                    await mutate();
                  } catch (error) {
                    message.error(apiErrorMessage(error));
                    throw error;
                  }
                },
              })
            }
          >
            移除
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <DefaultContainer className="space-y-4">
      {confirmationModal}
      <Flex justify="flex-end" align="center" wrap gap={12}>
        <Space>
          <Button onClick={refresh}>刷新</Button>
          <Button
            type="primary"
            loading={opening}
            onClick={() => {
              openCreate().catch((error: unknown) => message.error(apiErrorMessage(error)));
            }}
          >
            新建参加者
          </Button>
        </Space>
      </Flex>

      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action=<Button onClick={refresh}>重试</Button>
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading || sorting}
        scroll={{ x: "max-content" }}
        onChange={(_pagination, values, _sorter, extra) => {
          if (extra.action !== "filter") return;
          setRole(values.role?.[0] as Participant["role"] | undefined);
        }}
        pagination={{
          current,
          pageSize,
          total: data?.total,
          showSizeChanger: true,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size);
          },
        }}
      />
      <Modal
        title="新建参加者"
        open={creating}
        onCancel={closeCreate}
        centered
        width={760}
        destroyOnHidden
        footer=<Flex justify="flex-end" gap={8}>
          <Button onClick={closeCreate} disabled={saving || mediaBusy}>
            取消
          </Button>
          <Button
            type="primary"
            loading={saving}
            disabled={mediaBusy}
            onClick={() => form.submit()}
          >
            创建
          </Button>
        </Flex>
      >
        <Form
          form={form}
          layout="vertical"
          disabled={saving}
          onFinish={(values: Record<string, unknown>) => {
            createParticipant(values).catch((error: unknown) =>
              message.error(apiErrorMessage(error)),
            );
          }}
          onValuesChange={() => setDirty(true)}
          scrollToFirstError
        >
          <ParticipantFields
            form={form}
            disabled={saving || mediaBusy}
            onBusyChange={onBusyChange}
          />
        </Form>
      </Modal>
    </DefaultContainer>
  );
}
