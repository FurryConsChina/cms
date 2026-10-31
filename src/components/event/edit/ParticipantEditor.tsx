import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import useSWR, { useSWRConfig } from "swr";
import { Alert, App, Button, Flex, Form, Space, Spin, Typography } from "antd";
import { ParticipantAPI, participantSchema } from "@/api/cms/participant";
import DefaultContainer from "@/components/layout/Container";
import useMediaBusy from "@/components/media/useMediaBusy";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import type { Participant } from "@/types/participant";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";
import ParticipantFields from "./ParticipantFields";

export default function EventParticipantEditor({
  eventId,
  participantId,
}: {
  eventId: string;
  participantId: string;
}) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const {
    data: participant,
    error,
    isValidating,
    mutate,
  } = useSWR<Participant, Error>(
    ["participant-editor", eventId, participantId],
    () => ParticipantAPI.detailById(eventId, participantId),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (!error && !isValidating && participant) {
    return (
      <ParticipantEditor
        key={`${eventId}/${participantId}`}
        eventId={eventId}
        participant={participant}
      />
    );
  }

  return (
    <DefaultContainer className="space-y-6">
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Typography.Title level={4} className="m-0">
          编辑参加者
        </Typography.Title>
        <Button
          onClick={() => {
            navigate(`/dashboard/event/${eventId}/participants`);
          }}
        >
          返回参加者列表
        </Button>
      </Flex>
      {error ? (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action={
            <Button
              loading={isValidating}
              onClick={() => {
                mutate().catch((error: unknown) => message.error(apiErrorMessage(error)));
              }}
            >
              重试
            </Button>
          }
        />
      ) : (
        <Flex justify="center" className="py-12">
          <Spin aria-label="正在加载参加者资料" />
        </Flex>
      )}
    </DefaultContainer>
  );
}

function ParticipantEditor({
  eventId,
  participant,
}: {
  eventId: string;
  participant: Participant;
}) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { mutate } = useSWRConfig();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const submitting = useRef(false);
  const { busy: mediaBusy, onBusyChange } = useMediaBusy();
  const initialValues = {
    portrait: [],
    gallery: [],
    ...participant,
    subjectType: participant.organizationId ? "organization" : "profile",
  };
  Form.useWatch([], form);
  const { confirmationModal } = useUnsavedChangesGuard({
    dirty: dirty || form.isFieldsTouched(),
    busy: saving || mediaBusy || submitting.current,
  });

  const submit = async ({ subjectType, ...values }: Record<string, unknown>) => {
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
      await ParticipantAPI.save(participant.id, parsed.data);
      form.setFields(form.getFieldsError().map(({ name }) => ({ name, touched: false })));
      setDirty(false);
      mutate(
        (key) => Array.isArray(key) && key[0] === "participants" && key[1] === eventId,
        undefined,
        { revalidate: true },
      ).catch(() => message.warning("已保存，列表刷新失败，请返回列表后重试"));
      message.success("已保存");
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <DefaultContainer>
      {confirmationModal}
      <Flex justify="space-between" align="center" wrap gap={12} className="mb-6">
        <Typography.Title level={4} className="m-0">
          编辑参加者
        </Typography.Title>
        <Space wrap>
          <Button
            disabled={saving || mediaBusy}
            onClick={() => {
              navigate(`/dashboard/event/${eventId}/participants`);
            }}
          >
            返回参加者列表
          </Button>
          <Button
            type="primary"
            loading={saving}
            disabled={mediaBusy}
            onClick={() => form.submit()}
          >
            保存
          </Button>
        </Space>
      </Flex>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        disabled={saving}
        onFinish={(values: Record<string, unknown>) => {
          submit(values).catch((error: unknown) => message.error(apiErrorMessage(error)));
        }}
        onValuesChange={() => setDirty(true)}
        scrollToFirstError
      >
        <ParticipantFields form={form} disabled={saving || mediaBusy} onBusyChange={onBusyChange} />
      </Form>
    </DefaultContainer>
  );
}
