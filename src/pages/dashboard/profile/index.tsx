import { useState } from "react";
import { Avatar, Button, Divider, Form, Input, Select, Space, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import ResourcePage from "@/components/Cms/ResourcePage";
import MediaPicker, { MediaListFields } from "@/components/Cms/MediaPicker";
import { LinkFields } from "@/components/Cms/Fields";
import { ProfileAPI, profileSchema, type ProfileInput } from "@/api/dashboard/profile";
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
  return (
    <ResourcePage<Profile, ProfileInput>
      title="主体资料"
      queryKey={["profiles", search, kind]}
      list={(page) => ProfileAPI.list({ ...page, name: search || undefined, kind })}
      columns={[
        {
          title: "名称",
          render: (_, v) => (
            <Space>
              <Avatar src={v.avatarUrl ? imageUrl(v.avatarUrl) : undefined}>{v.name.slice(0, 1)}</Avatar>
              {v.name}
            </Space>
          ),
        },
        { title: "标识", dataIndex: "slug" },
        { title: "类型", render: (_, v) => kindLabels[v.kind] },
        {
          title: "状态",
          render: (_, v) => <Tag color={v.status === "active" ? "green" : "default"}>{statusLabels[v.status]}</Tag>,
        },
      ]}
      schema={profileSchema}
      initialValues={(record) => ({
        status: "active",
        kind: "individual",
        links: [],
        avatar: null,
        portrait: [],
        gallery: [],
        ...record,
      })}
      detail={(record) => ProfileAPI.detail(record.id)}
      save={(id, input) => (id ? ProfileAPI.update(id, input) : ProfileAPI.create(input, platform))}
      remove={ProfileAPI.delete}
      canDelete={platform}
      createHint="先填写基本信息并创建。创建后可以上传头像和图片。"
      filters={
        <Space wrap>
          <Input.Search allowClear placeholder="搜索名称" onSearch={setSearch} style={{ width: 260 }} />
          <Select
            allowClear
            placeholder="全部类型"
            style={{ width: 140 }}
            value={kind}
            onChange={setKind}
            options={toOptions(kindLabels)}
          />
        </Space>
      }
      actions={(record) => <Button onClick={() => navigate(`/dashboard/profile/${record.id}/access`)}>成员</Button>}
      editor={(_, record) => {
        const owner = record ? { entityType: "profile" as const, entityId: record.id } : undefined;
        return (
          <>
            <Form.Item label="名称" name="name" rules={[{ required: true, message: "请填写名称" }]}>
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
            <Space wrap>
              <Form.Item label="类型" name="kind">
                <Select style={{ width: 160 }} options={toOptions(kindLabels)} />
              </Form.Item>
              <Form.Item label="状态" name="status">
                <Select disabled={!platform && !record} style={{ width: 160 }} options={toOptions(statusLabels)} />
              </Form.Item>
            </Space>
            <Form.Item label="简介" name="description">
              <Input.TextArea autoSize={{ minRows: 4 }} />
            </Form.Item>
            <Form.Item label="联系邮箱" name="contactMail" rules={[{ type: "email", message: "邮箱格式不正确" }]}>
              <Input />
            </Form.Item>
            <LinkFields />
            <Divider titlePlacement="start">图片</Divider>
            <Form.Item label="头像" name="avatar">
              <MediaPicker owner={owner} />
            </Form.Item>
            <MediaListFields name="portrait" label="形象图" owner={owner} />
            <MediaListFields name="gallery" label="相册" owner={owner} />
          </>
        );
      }}
    />
  );
}
