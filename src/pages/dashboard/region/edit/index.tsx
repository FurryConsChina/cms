import { createRegion, updateRegion, getRegion } from "@/api/dashboard/region";
import type { EditableRegion, Region } from "@/types/region";
import { RegionType } from "@/types/region";
import { Typography, Button, Flex, Card, Form, App, Input, InputNumber, Switch, Select } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DefaultContainer from "@/components/Container";
import { IconArrowLeft } from "@tabler/icons-react";
import React from "react";
import RegionSelector from "@/components/Region/RegionSelector";
import { z } from "zod";

const { Title } = Typography;
const { TextArea } = Input;

export default function RegionEditPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // 如果是编辑模式，获取区域数据
  const { data: regionData, isLoading } = useQuery({
    queryKey: ["region", id],
    queryFn: () => getRegion(id!),
    enabled: isEditing && !!id,
  });

  type RegionFormValues = {
    name: string;
    code: string;
    type: string;
    level: number;
    parentId: string | null;
    countryCode: string | null;
    isOverseas: boolean;
    addressFormat: string | null;
    localName: string | null;
    timezone: string | null;
    languageCode: string | null;
    currencyCode: string | null;
    phoneCode: string | null;
    latitude: number | null;
    longitude: number | null;
    sortOrder: number | null;
    remark: string | null;
  };

  const formMethods = useForm<RegionFormValues>({
    defaultValues: {
      name: regionData?.name || "",
      code: regionData?.code || "",
      type: regionData?.type || "state",
      level: regionData?.level || 2,
      parentId: regionData?.parentId || null,
      countryCode: regionData?.countryCode || null,
      isOverseas: regionData?.isOverseas || false,
      addressFormat: regionData?.addressFormat || null,
      localName: regionData?.localName || null,
      timezone: regionData?.timezone || null,
      languageCode: regionData?.languageCode || null,
      currencyCode: regionData?.currencyCode || null,
      phoneCode: regionData?.phoneCode || null,
      latitude: regionData?.latitude || null,
      longitude: regionData?.longitude || null,
      sortOrder: regionData?.sortOrder || null,
      remark: regionData?.remark || null,
    },
  });

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  // Create a compatible form object for child components
  const form = {
    register,
    setValue,
    watch,
    errors,
    values: watch(),
    setFieldValue: setValue,
    getInputProps: (name: string) => ({
      ...register(name),
      error: errors[name]?.message,
    }),
    setValues: (values: Partial<RegionFormValues>) => {
      Object.keys(values).forEach((key) => {
        setValue(key as keyof RegionFormValues, values[key as keyof RegionFormValues]);
      });
    },
  };

  // 当 regionData 加载完成后，更新表单值
  React.useEffect(() => {
    if (regionData && isEditing) {
      console.log(regionData);
      form.setValues({
        name: regionData.name,
        code: regionData.code,
        type: regionData.type,
        level: regionData.level,
        parentId: regionData.parentId,
        countryCode: regionData.countryCode,
        isOverseas: regionData.isOverseas,
        addressFormat: regionData.addressFormat,
        localName: regionData.localName,
        timezone: regionData.timezone,
        languageCode: regionData.languageCode,
        currencyCode: regionData.currencyCode,
        phoneCode: regionData.phoneCode,
        latitude: regionData.latitude,
        longitude: regionData.longitude,
        sortOrder: regionData.sortOrder,
        remark: regionData.remark,
      });
    }
  }, [regionData, isEditing]);

  const handleSubmit = async (values: RegionFormValues) => {
    try {
      // 转换表单数据为 EditableRegion 格式
      const submitData: EditableRegion = {
        name: values.name,
        code: values.code,
        type: values.type as RegionType,
        level: values.level,
        parentId: values.parentId,
        countryCode: values.countryCode,
        isOverseas: values.isOverseas,
        addressFormat: values.addressFormat,
        localName: values.localName,
        timezone: values.timezone,
        languageCode: values.languageCode,
        currencyCode: values.currencyCode,
        phoneCode: values.phoneCode,
        latitude: values.latitude,
        longitude: values.longitude,
        sortOrder: values.sortOrder,
        remark: values.remark,
      };

      if (isEditing && id) {
        await updateRegion(id, submitData);
        message.success("更新区域成功");
      } else {
        await createRegion(submitData);
        message.success("创建区域成功");
      }
      navigate("/dashboard/region");
    } catch (error) {
      message.error("操作失败，请重试");
    }
  };

  if (isEditing && isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <DefaultContainer>
      <Flex style={{ marginBottom: 16 }}>
        <Button type="text" icon={<IconArrowLeft size={16} />} onClick={() => navigate("/dashboard/region")}>
          返回
        </Button>
      </Flex>

      <h2 className="text-2xl font-bold">{isEditing ? "编辑区域" : "添加区域"}</h2>

      <Card>
        <form onSubmit={rhfHandleSubmit((values) => handleSubmit(values))}>
          <Form.Item
            label="区域名称"
            required
            validateStatus={form.getInputProps("name").error ? "error" : undefined}
            help={form.getInputProps("name").error}
          >
            <Input placeholder="请输入区域名称" {...form.getInputProps("name")} />
          </Form.Item>

          <Form.Item
            label="区域代码"
            required
            validateStatus={form.getInputProps("code").error ? "error" : undefined}
            help={form.getInputProps("code").error}
          >
            <Input placeholder="请输入区域代码" {...form.getInputProps("code")} />
          </Form.Item>

          <Form.Item
            label="区域类型"
            required
            validateStatus={form.getInputProps("type").error ? "error" : undefined}
            help={form.getInputProps("type").error}
          >
            <Select
              placeholder="请选择区域类型"
              options={[
                { label: "国家", value: "country", disabled: true },
                { label: "省份", value: "state" },
                { label: "城市", value: "city" },
                // { label: "区县", value: "district" },
              ]}
              value={form.values.type}
              onChange={(value) => form.setFieldValue("type", value)}
            />
          </Form.Item>

          <Form.Item label="区域级别" validateStatus={form.getInputProps("level").error ? "error" : undefined} required>
            <Select
              style={{ width: "100%" }}
              placeholder="请输入区域级别"
              options={[
                // { label: "国家", value: 1 },
                { label: "省份/直辖市", value: 2 },
                { label: "城市", value: 3 },
                // { label: "区县", value: 4 },
              ]}
              value={form.values.level}
              onChange={(value) => form.setFieldValue("level", value)}
            />
          </Form.Item>

          <RegionSelector
            required
            label="父级区域ID"
            placeholder="请输入父级区域ID"
            {...form.getInputProps("parentId")}
          />

          <Form.Item
            label="ISO 3166-1 代码"
            validateStatus={form.getInputProps("countryCode").error ? "error" : undefined}
            help={form.getInputProps("countryCode").error}
          >
            <Select
              placeholder="请选择 ISO 3166-1 代码"
              options={[
                { label: "CN", value: "CN" },
                { label: "TW", value: "TW" },
              ]}
              value={form.values.countryCode}
              onChange={(value) => form.setFieldValue("countryCode", value)}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="是否海外"
            validateStatus={form.getInputProps("isOverseas").error ? "error" : undefined}
            help={form.getInputProps("isOverseas").error}
          >
            <Switch
              checked={form.values.isOverseas}
              onChange={(checked) => form.setFieldValue("isOverseas", checked)}
            />
          </Form.Item>

          <Form.Item
            label="地址格式"
            validateStatus={form.getInputProps("addressFormat").error ? "error" : undefined}
            help={form.getInputProps("addressFormat").error}
          >
            <Select
              placeholder="请输入地址格式（可选）"
              options={[{ label: "中式", value: "chinese" }]}
              value={form.values.addressFormat}
              onChange={(value) => form.setFieldValue("addressFormat", value)}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="本地名称"
            validateStatus={form.getInputProps("localName").error ? "error" : undefined}
            help={form.getInputProps("localName").error}
          >
            <Input placeholder="请输入本地名称（可选）" {...form.getInputProps("localName")} />
          </Form.Item>

          <Form.Item
            label="时区"
            validateStatus={form.getInputProps("timezone").error ? "error" : undefined}
            help={form.getInputProps("timezone").error}
          >
            <Select
              placeholder="请输入时区（可选）"
              options={[
                { label: "Asia/Shanghai", value: "Asia/Shanghai" },
                { label: "Asia/Taipei", value: "Asia/Taipei" },
              ]}
              value={form.values.timezone}
              onChange={(value) => form.setFieldValue("timezone", value)}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="语言代码"
            validateStatus={form.getInputProps("languageCode").error ? "error" : undefined}
            help={form.getInputProps("languageCode").error}
          >
            <Select
              placeholder="请输入语言代码（可选）"
              options={[
                { label: "zh-CN", value: "zh-CN" },
                { label: "zh-TW", value: "zh-TW" },
              ]}
              value={form.values.languageCode}
              onChange={(value) => form.setFieldValue("languageCode", value)}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="货币代码"
            validateStatus={form.getInputProps("currencyCode").error ? "error" : undefined}
            help={form.getInputProps("currencyCode").error}
          >
            <Select
              placeholder="请输入货币代码（可选）"
              options={[
                { label: "CNY", value: "CNY" },
                { label: "TWD", value: "TWD" },
              ]}
              value={form.values.currencyCode}
              onChange={(value) => form.setFieldValue("currencyCode", value)}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="电话代码"
            validateStatus={form.getInputProps("phoneCode").error ? "error" : undefined}
            help={form.getInputProps("phoneCode").error}
          >
            <Select
              placeholder="请输入电话代码（可选）"
              options={[
                { label: "+86", value: "+86" },
                { label: "+886", value: "+886" },
              ]}
              value={form.values.phoneCode}
              onChange={(value) => form.setFieldValue("phoneCode", value)}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="纬度"
            validateStatus={form.getInputProps("latitude").error ? "error" : undefined}
            help={form.getInputProps("latitude").error}
          >
            <InputNumber
              placeholder="请输入纬度（可选）"
              style={{ width: "100%" }}
              value={form.values.latitude}
              onChange={(value) => form.setFieldValue("latitude", value)}
            />
          </Form.Item>

          <Form.Item
            label="经度"
            validateStatus={form.getInputProps("longitude").error ? "error" : undefined}
            help={form.getInputProps("longitude").error}
          >
            <InputNumber
              placeholder="请输入经度（可选）"
              style={{ width: "100%" }}
              value={form.values.longitude}
              onChange={(value) => form.setFieldValue("longitude", value)}
            />
          </Form.Item>

          <Form.Item
            label="排序"
            validateStatus={form.getInputProps("sortOrder").error ? "error" : undefined}
            help={form.getInputProps("sortOrder").error}
          >
            <InputNumber
              placeholder="请输入排序（可选）"
              style={{ width: "100%" }}
              value={form.values.sortOrder}
              onChange={(value) => form.setFieldValue("sortOrder", value)}
            />
          </Form.Item>

          <Form.Item
            label="备注"
            validateStatus={form.getInputProps("remark").error ? "error" : undefined}
            help={form.getInputProps("remark").error}
          >
            <TextArea placeholder="请输入区域描述" {...form.getInputProps("remark")} />
          </Form.Item>

          <Flex justify="flex-end" gap={8}>
            <Button type="text" onClick={() => navigate("/dashboard/region")}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {isEditing ? "更新" : "创建"}
            </Button>
          </Flex>
        </form>
      </Card>
    </DefaultContainer>
  );
}
