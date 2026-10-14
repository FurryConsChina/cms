import { useRef, useState } from "react";
import { App, Col, Form, Input, Modal, Row, Select } from "antd";
import { EditRegionApiBody, RegionAPI } from "@/api/dashboard/region";
import RegionSelector from "@/components/Region/RegionSelector";
import { RegionType, RegionTypeLabel, type Region } from "@/types/region";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";

export default function RegionEditor({
  region,
  onSaved,
  onCancel,
}: {
  region?: Region;
  onSaved: (region: Region) => void;
  onCancel: () => void;
}) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const close = () => {
    if (submitting.current) return;
    if (!form.isFieldsTouched()) return onCancel();
    modal.confirm({
      title: "放弃未保存的修改？",
      okText: "放弃",
      cancelText: "继续编辑",
      okButtonProps: { danger: true },
      onOk: onCancel,
    });
  };
  const submit = async (values: Record<string, unknown>) => {
    if (submitting.current) return;
    const parsed = EditRegionApiBody.safeParse(toNullable(values));
    if (!parsed.success) {
      form.setFields(
        parsed.error.issues
          .filter((issue) => issue.path.length)
          .map((issue) => ({
            name: issue.path as (string | number)[],
            errors: [issue.message],
          })),
      );
      message.error(parsed.error.issues[0]?.message ?? "请检查表单内容");
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      const saved = region
        ? await RegionAPI.updateRegion(region.id, parsed.data)
        : await RegionAPI.createRegion(parsed.data);
      message.success(region ? "已保存" : "已创建");
      onSaved(saved);
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  return (
    <Modal
      title={region ? "编辑地区" : "新建地区"}
      open
      centered
      onCancel={close}
      onOk={() => form.submit()}
      okText={region ? "保存" : "创建"}
      cancelText="取消"
      confirmLoading={saving}
      cancelButtonProps={{ disabled: saving }}
      closable={!saving}
      keyboard={!saving}
      mask={{ closable: false }}
    >
      <Form
        form={form}
        name="region-editor"
        layout="vertical"
        initialValues={{
          name: region?.name,
          slug: region?.slug,
          kind: region?.kind ?? RegionType.STATE,
          parentId: region?.parentId ?? null,
          localName: region?.localName,
        }}
        onFinish={submit}
        scrollToFirstError
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="地区名称" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="本地名称" name="localName">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="地区 Slug"
              name="slug"
              rules={[{ required: true }, { pattern: /^[a-zA-Z0-9-]+$/, message: "仅支持字母、数字和连字符" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="地区类型" name="kind" rules={[{ required: true }]}>
              <Select options={Object.values(RegionType).map((value) => ({ value, label: RegionTypeLabel[value] }))} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="父级地区" name="parentId" extra="国家无父级，其他地区必须选择父级。">
          <RegionSelector selectedOption={region?.parent ?? undefined} antdSelectProps={{ allowClear: true }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
