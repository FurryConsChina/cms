import { createRegion, updateRegion, getRegion } from "@/api/dashboard/region";
import type { EditableRegion, Region } from "@/types/region";
import {
  Button,
  Group,
  NumberInput,
  Select,
  Textarea,
  TextInput,
  Title,
  Paper,
  Switch,
  Input,
} from "@mantine/core";
import { Select as AntdSelect } from "antd";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DefaultContainer from "@/components/Container";
import { IconArrowLeft } from "@tabler/icons-react";
import React from "react";
import RegionSelector from "@/components/Region/RegionSelector";

export default function RegionEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // 如果是编辑模式，获取区域数据
  const { data: regionData, isLoading } = useQuery({
    queryKey: ["region", id],
    queryFn: () => getRegion(id!),
    enabled: isEditing && !!id,
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
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

  const handleSubmit = async (values: any) => {
    try {
      // 转换表单数据为 EditableRegion 格式
      const submitData: EditableRegion = {
        name: values.name,
        code: values.code,
        type: values.type as any,
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
        notifications.show({
          title: "更新成功",
          message: "更新区域成功",
          color: "teal",
        });
      } else {
        await createRegion(submitData);
        notifications.show({
          title: "创建成功",
          message: "创建区域成功",
          color: "teal",
        });
      }
      navigate("/dashboard/region");
    } catch (error) {
      notifications.show({
        title: "操作失败",
        message: "操作失败，请重试",
        color: "red",
      });
    }
  };

  if (isEditing && isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <DefaultContainer>
      <Group mb="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/dashboard/region")}
        >
          返回
        </Button>
      </Group>

      <Title order={2} mb="lg">
        {isEditing ? "编辑区域" : "添加区域"}
      </Title>

      <Paper p="xl" withBorder>
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <TextInput
            withAsterisk
            label="区域名称"
            placeholder="请输入区域名称"
            key={form.key("name")}
            {...form.getInputProps("name")}
            mb="md"
          />

          <TextInput
            withAsterisk
            label="区域代码"
            placeholder="请输入区域代码"
            key={form.key("code")}
            {...form.getInputProps("code")}
            mb="md"
          />

          <Select
            withAsterisk
            label="区域类型"
            placeholder="请选择区域类型"
            {...form.getInputProps("type")}
            data={[
              { label: "国家", value: "country", disabled: true },
              { label: "省份", value: "state" },
              { label: "城市", value: "city" },
              // { label: "区县", value: "district" },
            ]}
            mb="md"
          />

          <Input.Wrapper
            label="区域级别"
            error={form.getInputProps("level").error}
            withAsterisk
            key={form.key("level")}
            mb="md"
          >
            <AntdSelect
              style={{ width: "100%" }}
              placeholder="请输入区域级别"
              options={[
                // { label: "国家", value: 1 },
                { label: "省份/直辖市", value: 2 },
                { label: "城市", value: 3 },
                // { label: "区县", value: 4 },
              ]}
              {...form.getInputProps("level")}
            />
          </Input.Wrapper>

          <RegionSelector
            required
            label="父级区域ID"
            placeholder="请输入父级区域ID"
            key={form.key("parentId")}
            {...form.getInputProps("parentId")}
          />

          <Select
            label="ISO 3166-1 代码"
            placeholder="请选择 ISO 3166-1 代码"
            key={form.key("countryCode")}
            data={[
              { label: "CN", value: "CN" },
              { label: "TW", value: "TW" },
            ]}
            {...form.getInputProps("countryCode")}
            mb="md"
          />

          <Switch
            label="是否海外"
            {...form.getInputProps("isOverseas")}
            mb="md"
          />

          <Select
            label="地址格式"
            placeholder="请输入地址格式（可选）"
            key={form.key("addressFormat")}
            {...form.getInputProps("addressFormat")}
            data={[{ label: "中式", value: "chinese" }]}
            mb="md"
          />

          <TextInput
            label="本地名称"
            placeholder="请输入本地名称（可选）"
            key={form.key("localName")}
            {...form.getInputProps("localName")}
            mb="md"
          />

          <Select
            label="时区"
            placeholder="请输入时区（可选）"
            key={form.key("timezone")}
            data={[
              { label: "Asia/Shanghai", value: "Asia/Shanghai" },
              { label: "Asia/Taipei", value: "Asia/Taipei" },
            ]}
            {...form.getInputProps("timezone")}
            mb="md"
          />

          <Select
            label="语言代码"
            placeholder="请输入语言代码（可选）"
            key={form.key("languageCode")}
            {...form.getInputProps("languageCode")}
            data={[
              { label: "zh-CN", value: "zh-CN" },
              { label: "zh-TW", value: "zh-TW" },
            ]}
            mb="md"
          />

          <Select
            label="货币代码"
            placeholder="请输入货币代码（可选）"
            key={form.key("currencyCode")}
            {...form.getInputProps("currencyCode")}
            data={[
              { label: "CNY", value: "CNY" },
              { label: "TWD", value: "TWD" },
            ]}
            mb="md"
          />

          <Select
            label="电话代码"
            placeholder="请输入电话代码（可选）"
            key={form.key("phoneCode")}
            {...form.getInputProps("phoneCode")}
            data={[
              { label: "+86", value: "+86" },
              { label: "+886", value: "+886" },
            ]}
            mb="md"
          />

          <NumberInput
            label="纬度"
            placeholder="请输入纬度（可选）"
            key={form.key("latitude")}
            {...form.getInputProps("latitude")}
            mb="md"
          />

          <NumberInput
            label="经度"
            placeholder="请输入经度（可选）"
            key={form.key("longitude")}
            {...form.getInputProps("longitude")}
            mb="md"
          />

          <NumberInput
            label="排序"
            placeholder="请输入排序（可选）"
            key={form.key("sortOrder")}
            {...form.getInputProps("sortOrder")}
            mb="md"
          />

          <Textarea
            label="备注"
            placeholder="请输入区域描述"
            key={form.key("remark")}
            {...form.getInputProps("remark")}
            mb="xl"
          />

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => navigate("/dashboard/region")}
            >
              取消
            </Button>
            <Button type="submit">{isEditing ? "更新" : "创建"}</Button>
          </Group>
        </form>
      </Paper>
    </DefaultContainer>
  );
}
