import { useRef, useState } from "react";
import { App, Avatar, Button, Flex, Form, Input, Select, Typography } from "antd";
import { IconArrowLeft, IconDeviceFloppy, IconPlus } from "@tabler/icons-react";
import { useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs } from "react-router";
import { useSWRConfig } from "swr";
import { ProfileAPI, profileSchema, type ProfileInput } from "@/api/cms/profile";
import { LinkFields } from "@/components/common/Fields";
import DefaultContainer from "@/components/layout/Container";
import MediaPicker from "@/components/media/MediaPicker";
import GalleryFields from "@/components/media/GalleryFields";
import useMediaBusy from "@/components/media/useMediaBusy";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import { toOptions } from "@/consts/labels";
import useAuthStore from "@/stores/auth";
import type { Profile } from "@/types/profile";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";
import { imageUrl } from "@/utils/imageLoader";
import { isPlatform } from "@/utils/permissions";

const kindLabels = {
  individual: "个人（个人嘉宾、画师、表演者）",
  group: "团体（社团、工作室、组合）",
  brand: "品牌（品牌或商业机构）",
  media: "媒体（媒体账号或媒体机构）",
};
const statusLabels = { active: "活跃", inactive: "停用" };

type EditorSession = { mode: "create" } | { mode: "edit"; profile: Profile };

export async function loader({ params }: LoaderFunctionArgs): Promise<EditorSession> {
  return params.profileId
    ? { mode: "edit", profile: await ProfileAPI.detail(params.profileId) }
    : { mode: "create" };
}

export default function ProfileEditPage() {
  const session = useLoaderData<typeof loader>();
  return (
    <ProfileEditor
      key={session.mode === "edit" ? session.profile.id : "create"}
      session={session}
    />
  );
}

function ProfileEditor({ session }: { session: EditorSession }) {
  const navigate = useNavigate();
  const location = useLocation();
  const platform = isPlatform(useAuthStore((state) => state.user?.role));
  const { message } = App.useApp();
  const { mutate } = useSWRConfig();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const submitting = useRef(false);
  const { busy: mediaBusy, onBusyChange } = useMediaBusy();
  const busy = saving || mediaBusy;
  const profile = session.mode === "edit" ? session.profile : undefined;
  const backToList = () => {
    navigate(`/dashboard/profile${location.search}`);
  };
  const { portrait: _portrait, ...profileWithoutPortrait } = profile ?? {};
  const initialValues = {
    status: "active",
    kind: "individual",
    links: [],
    avatar: null,
    gallery: [],
    ...profileWithoutPortrait,
  };
  const currentName = Form.useWatch("name", form) as string | undefined;
  const currentSlug = Form.useWatch("slug", form) as string | undefined;
  const currentAvatar = Form.useWatch("avatar", form) as Profile["avatar"];
  const headerTitle =
    session.mode === "edit" ? currentName?.trim() || session.profile.name : "新建主体资料";
  const headerDescription =
    session.mode === "edit"
      ? currentSlug?.trim()
        ? `标识：${currentSlug.trim()}`
        : "维护主体公开资料"
      : currentName?.trim()
        ? `正在创建：${currentName.trim()}`
        : "填写公开身份、联系信息与图片内容";

  const { allowNavigation, clearAllowedNavigation, confirmationModal } = useUnsavedChangesGuard({
    dirty: dirty || form.isFieldsTouched(),
    busy: busy || submitting.current,
  });

  const submit = async (values: Record<string, unknown>) => {
    if (submitting.current || mediaBusy) return;
    const parsed = profileSchema.safeParse(toNullable(values));
    if (!parsed.success) {
      form.setFields(
        parsed.error.issues
          .filter((issue) => issue.path.length)
          .map((issue) => ({ name: issue.path as (string | number)[], errors: [issue.message] })),
      );
      message.error(parsed.error.issues[0]?.message ?? "请检查表单内容");
      return;
    }
    const input: ProfileInput = parsed.data;
    submitting.current = true;
    setSaving(true);
    let saved: Profile;
    try {
      saved = await (session.mode === "edit"
        ? ProfileAPI.update(session.profile.id, input)
        : ProfileAPI.create(input, platform));
    } catch (error) {
      message.error(apiErrorMessage(error));
      submitting.current = false;
      setSaving(false);
      return;
    }

    form.setFields(form.getFieldsError().map(({ name }) => ({ name, touched: false })));
    setDirty(false);
    mutate((key) => Array.isArray(key) && key[0] === "profiles", undefined, {
      revalidate: true,
    }).catch(() => message.warning("已保存，列表刷新失败，请返回列表后重试"));

    try {
      if (session.mode === "create") {
        message.success("已创建，可以继续补充内容");
        const destination = `/dashboard/profile/${saved.id}/edit${location.search}`;
        allowNavigation(destination);
        await navigate(destination, { replace: true });
      } else {
        message.success("已保存");
      }
    } finally {
      clearAllowedNavigation();
      submitting.current = false;
      setSaving(false);
    }
  };

  const handleFinish = (values: Record<string, unknown>) => {
    submit(values).catch((error: unknown) => {
      message.error(apiErrorMessage(error));
      submitting.current = false;
      setSaving(false);
    });
  };

  return (
    <div className="space-y-4">
      <DefaultContainer className="sticky top-0 z-20 p-3 sm:p-4">
        <Flex justify="space-between" align="center" wrap gap={12}>
          <Flex align="center" gap={12} className="min-w-0">
            <Button
              type="text"
              icon={<IconArrowLeft size={20} stroke={1.5} />}
              aria-label="返回主体列表"
              disabled={busy}
              onClick={backToList}
            />
            <Avatar
              size={44}
              src={currentAvatar?.url ? imageUrl(currentAvatar.url) : undefined}
              className="shrink-0 bg-slate-200 text-slate-600"
            >
              {headerTitle.slice(0, 1)}
            </Avatar>
            <div className="min-w-0">
              <Flex align="center" wrap gap={8}>
                <Typography.Title level={3} className="m-0 truncate text-lg sm:text-xl">
                  {headerTitle}
                </Typography.Title>
              </Flex>
              <Typography.Text type="secondary" className="block truncate text-xs sm:text-sm">
                {headerDescription}
              </Typography.Text>
            </div>
          </Flex>
          <Button
            type="primary"
            icon={
              session.mode === "edit" ? (
                <IconDeviceFloppy size={16} stroke={1.5} />
              ) : (
                <IconPlus size={16} stroke={1.5} />
              )
            }
            loading={saving}
            disabled={mediaBusy}
            onClick={() => form.submit()}
          >
            {session.mode === "edit" ? "保存更改" : "创建主体"}
          </Button>
        </Flex>
      </DefaultContainer>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        disabled={saving}
        onFinish={handleFinish}
        onValuesChange={() => setDirty(true)}
        scrollToFirstError
        className="space-y-4"
      >
        <DefaultContainer className="p-5 sm:p-6">
          <Form.Item label="主体头像" name="avatar">
            <MediaPicker variant="avatar" disabled={busy} onBusyChange={onBusyChange} />
          </Form.Item>
          <GalleryFields name="gallery" label="相册" disabled={busy} onBusyChange={onBusyChange} />
        </DefaultContainer>

        <DefaultContainer className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Form.Item label="名称" name="name" rules={[{ required: true, message: "请填写名称" }]}>
              <Input maxLength={256} placeholder="主体对外的名称" />
            </Form.Item>
            <Form.Item
              label="标识"
              name="slug"
              extra="用于网址，只能使用字母、数字和连字符。"
              rules={[
                { required: true, message: "请填写标识" },
                { pattern: /^[a-zA-Z0-9-]+$/, message: "只能使用字母、数字和连字符" },
              ]}
            >
              <Input maxLength={64} placeholder="例如 fox-studio" />
            </Form.Item>
            <Form.Item label="类型" name="kind">
              <Select options={toOptions(kindLabels)} />
            </Form.Item>
            <Form.Item
              label="状态"
              name="status"
              extra={!platform && session.mode === "create" ? "创建时使用默认状态。" : undefined}
            >
              <Select
                disabled={saving || (!platform && session.mode === "create")}
                options={toOptions(statusLabels)}
              />
            </Form.Item>
          </div>
          <Form.Item label="简介" name="description">
            <Input.TextArea
              autoSize={{ minRows: 6 }}
              placeholder="介绍这个主体的背景、方向和主要内容"
            />
          </Form.Item>
          <Form.Item
            label="联系邮箱"
            name="contactMail"
            rules={[{ type: "email", message: "邮箱格式不正确" }]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
          <LinkFields label="链接与账号" />
        </DefaultContainer>
      </Form>
      {confirmationModal}
    </div>
  );
}
