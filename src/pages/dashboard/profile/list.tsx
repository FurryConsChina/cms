import { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Alert,
  App,
  Flex,
  Table,
  Typography,
  Drawer,
} from "antd";
import { useNavigate } from "react-router";

import useSWR from "swr";
import { type ColumnsType } from "antd/es/table";
import { toNullable } from "@/utils/form";
import { apiErrorMessage } from "@/utils/apiError";
import useMediaBusy from "@/components/media/useMediaBusy";
import MediaPicker, { MediaListFields } from "@/components/media/MediaPicker";
import { LinkFields } from "@/components/common/Fields";
import { ProfileAPI, profileSchema } from "@/api/cms/profile";
import { toOptions } from "@/consts/labels";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";
import { imageUrl } from "@/utils/imageLoader";
import type { Profile } from "@/types/profile";

const kindLabels = { individual: "个人", group: "团体", brand: "品牌", media: "媒体" };
const statusLabels = { active: "活跃", inactive: "停用" };

export default function ProfilePage() {
  const { user } = useAuthStore();
  const platform = isPlatform(user?.role);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<Profile["kind"]>();
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  useEffect(() => {
    setCurrent(1);
  }, [search, kind]);
  const { data, error, isLoading, mutate } = useSWR(
    ["profiles", search, kind, current, pageSize],
    () => ProfileAPI.list({ current, pageSize, name: search || undefined, kind }),
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Profile>();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const { busy: mediaBusy, onBusyChange } = useMediaBusy();
  const [dirty, setDirty] = useState(false);
  const [openingId, setOpeningId] = useState<string>();
  const [form] = Form.useForm();
  const fill = (record?: Profile) => {
    form.resetFields();
    const values = {
      status: "active",
      kind: "individual",
      links: [],
      avatar: null,
      portrait: [],
      gallery: [],
      ...record,
    };
    form.setFieldsValue(values);
    form.setFields(Object.keys(values).map((name) => ({ name, touched: false })));
    setEditing(record);
    setDirty(false);
  };
  const open = async (record?: Profile) => {
    try {
      setOpeningId(record?.id);
      fill(record ? await ProfileAPI.detail(record.id) : undefined);
      setOpened(true);
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setOpeningId(undefined);
    }
  };
  const close = () => {
    if (submitting.current || mediaBusy) return;
    if (!dirty && !form.isFieldsTouched()) return setOpened(false);
    modal.confirm({
      title: "放弃未保存的修改？",
      okText: "放弃",
      okButtonProps: { danger: true },
      cancelText: "继续编辑",
      onOk: () => setOpened(false),
    });
  };
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
    submitting.current = true;
    setSaving(true);
    try {
      const saved = await (editing?.id
        ? ProfileAPI.update(editing?.id, parsed.data)
        : ProfileAPI.create(parsed.data, platform));
      await mutate();
      if (editing) {
        message.success("已保存");
        setOpened(false);
      } else {
        fill(await ProfileAPI.detail(saved.id));
        message.success("已创建，可以继续补充内容");
      }
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const records = data?.records ?? [];
  const columns: ColumnsType<Profile> = [
    {
      title: "名称",
      render: (_, v) => (
        <Space>
          <Avatar src={v.avatarUrl ? imageUrl(v.avatarUrl) : undefined}>
            {v.name.slice(0, 1)}
          </Avatar>
          {v.name}
        </Space>
      ),
    },
    { title: "标识", dataIndex: "slug" },
    { title: "类型", render: (_, v) => kindLabels[v.kind] },
    {
      title: "状态",
      render: (_, v) => (
        <Tag color={v.status === "active" ? "green" : "default"}>{statusLabels[v.status]}</Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button loading={openingId === record.id} onClick={() => void open(record)}>
            编辑
          </Button>
          <Button onClick={() => void navigate(`/dashboard/profile/${record.id}/access`)}>
            成员
          </Button>
          {platform && (
            <Button
              danger
              onClick={() =>
                modal.confirm({
                  title: "确认删除这条记录？",
                  content: "删除后将不再展示。如果其他内容引用了这条记录，删除会失败。",
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await ProfileAPI.delete(record.id);
                      message.success("已删除");
                      await mutate();
                    } catch (error) {
                      message.error(apiErrorMessage(error));
                      throw error;
                    }
                  },
                })
              }
            >
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          主体资料
        </Typography.Title>
        <Space>
          <Button onClick={() => void mutate()}>刷新</Button>
          <Button type="primary" onClick={() => void open()}>
            新建主体资料
          </Button>
        </Space>
      </Flex>
      <Space wrap>
        <Input.Search
          allowClear
          placeholder="搜索名称"
          onSearch={setSearch}
          style={{ width: 260 }}
        />
        <Select
          allowClear
          placeholder="全部类型"
          style={{ width: 140 }}
          value={kind}
          onChange={setKind}
          options={toOptions(kindLabels)}
        />
      </Space>
      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action=<Button onClick={() => void mutate()}>重试</Button>
        />
      )}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isLoading}
        scroll={{ x: "max-content" }}
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
      <Drawer
        title={editing ? "编辑主体资料" : "新建主体资料"}
        open={opened}
        onClose={close}
        size={Math.min(760, window.innerWidth)}
        destroyOnHidden
        footer=<Flex justify="flex-end" gap={8}>
          <Button onClick={close} disabled={saving || mediaBusy}>
            {editing ? "关闭" : "取消"}
          </Button>
          <Button
            type="primary"
            loading={saving}
            disabled={mediaBusy}
            onClick={() => form.submit()}
          >
            {editing ? "保存" : "创建"}
          </Button>
        </Flex>
      >
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={submit}
            onValuesChange={() => setDirty(true)}
            scrollToFirstError
          >
            <>
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: "请填写名称" }]}
              >
                <Input maxLength={256} />
              </Form.Item>
              <Form.Item
                label="标识"
                name="slug"
                extra="用于网址，只能使用字母、数字和连字符，例如 fox-studio。"
                rules={[
                  { required: true, message: "请填写标识" },
                  { pattern: /^[a-zA-Z0-9-]+$/, message: "只能使用字母、数字和连字符" },
                ]}
              >
                <Input maxLength={64} />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="类型" name="kind">
                    <Select options={toOptions(kindLabels)} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="状态" name="status">
                    <Select disabled={!platform && !editing} options={toOptions(statusLabels)} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="简介" name="description">
                <Input.TextArea autoSize={{ minRows: 4 }} />
              </Form.Item>
              <Form.Item
                label="联系邮箱"
                name="contactMail"
                rules={[{ type: "email", message: "邮箱格式不正确" }]}
              >
                <Input />
              </Form.Item>
              <LinkFields />
              <Divider titlePlacement="start">图片</Divider>
              <Form.Item label="头像" name="avatar">
                <MediaPicker disabled={saving || mediaBusy} onBusyChange={onBusyChange} />
              </Form.Item>
              <MediaListFields
                name="portrait"
                label="形象图"
                disabled={saving || mediaBusy}
                onBusyChange={onBusyChange}
              />
              <MediaListFields
                name="gallery"
                label="相册"
                disabled={saving || mediaBusy}
                onBusyChange={onBusyChange}
              />
            </>
          </Form>
        </>
      </Drawer>
    </div>
  );
}
