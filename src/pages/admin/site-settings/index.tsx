import { useRef, useState } from "react";
import { Alert, App, Button, Flex, Form, Input, Spin, Typography } from "antd";
import useSWR from "swr";
import { AdminSiteSettingApi } from "@/api/cms/admin/siteSetting";
import DefaultContainer from "@/components/layout/Container";
import useMediaBusy from "@/components/media/useMediaBusy";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import type { MediaBinding } from "@/types/media";
import type { CarouselItem, SiteSetting, SiteSettingKey, SloganSetting } from "@/types/siteSetting";
import { apiErrorMessage } from "@/utils/apiError";
import CarouselFields from "./CarouselFields";

const sloganLanguages = [
  { key: "zh-Hans", label: "简体中文" },
  { key: "zh-Hant", label: "繁体中文" },
  { key: "en", label: "English" },
] as const;

const emptySlogan: SloganSetting = { "zh-Hans": "", "zh-Hant": "", en: "" };

type CarouselFormValues = {
  items: {
    image: MediaBinding | null;
    url: string;
    altText: string;
    sponsorName: string;
  }[];
};

function carouselFormValues(items: CarouselItem[]): CarouselFormValues {
  return {
    items: items.map((item) => ({
      image: { mediaAssetId: item.mediaAssetId, url: item.imageUrl, altText: item.altText },
      url: item.url,
      altText: item.altText,
      sponsorName: item.sponsorName,
    })),
  };
}

export default function AdminSiteSettingsPage() {
  const { message } = App.useApp();
  const { data, error, isLoading, isValidating, mutate } = useSWR<SiteSetting[], unknown>(
    "admin-site-settings",
    () => AdminSiteSettingApi.list(),
    { revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false },
  );

  return (
    <div className="space-y-4">
      <DefaultContainer className="sticky top-0 z-20">
        <Typography.Title level={3} className="m-0">
          网站设置
        </Typography.Title>
      </DefaultContainer>
      {error ? (
        <DefaultContainer>
          <Alert
            type="error"
            showIcon
            title="网站设置加载失败"
            description={apiErrorMessage(error)}
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
        </DefaultContainer>
      ) : isLoading || !data ? (
        <DefaultContainer>
          <Flex justify="center" className="py-12">
            <Spin tip="正在加载网站设置" size="large">
              <div className="h-12 w-48" />
            </Spin>
          </Flex>
        </DefaultContainer>
      ) : (
        <SiteSettingsEditor
          settings={data}
          onSaved={async (saved) => {
            await mutate(
              (current) => current?.map((setting) => (setting.key === saved.key ? saved : setting)),
              { revalidate: false },
            );
          }}
        />
      )}
    </div>
  );
}

function SiteSettingsEditor({
  settings,
  onSaved,
}: {
  settings: SiteSetting[];
  onSaved: (setting: SiteSetting) => Promise<void>;
}) {
  const { message } = App.useApp();
  const [carouselForm] = Form.useForm<CarouselFormValues>();
  const [sloganForm] = Form.useForm<SloganSetting>();
  const [carouselDirty, setCarouselDirty] = useState(false);
  const [sloganDirty, setSloganDirty] = useState(false);
  const [saving, setSaving] = useState<SiteSettingKey | null>(null);
  const submitting = useRef(false);
  const { busy: mediaBusy, onBusyChange } = useMediaBusy();
  const busy = saving !== null || mediaBusy;
  const { confirmationModal } = useUnsavedChangesGuard({
    dirty: carouselDirty || sloganDirty,
    busy,
  });
  const carousel = settings.find((setting) => setting.key === "carousel")?.value ?? [];
  const slogan = settings.find((setting) => setting.key === "slogan")?.value ?? emptySlogan;

  const saveCarousel = async (values: CarouselFormValues) => {
    if (submitting.current || mediaBusy) return;
    submitting.current = true;
    setSaving("carousel");
    try {
      const saved = await AdminSiteSettingApi.updateCarousel({
        value: values.items.map((item) => {
          if (!item.image?.mediaAssetId) throw new Error("请选择或上传轮播图片");
          return {
            mediaAssetId: item.image.mediaAssetId,
            url: item.url.trim(),
            altText: item.altText.trim(),
            sponsorName: item.sponsorName.trim(),
          };
        }),
      });
      carouselForm.setFieldsValue(carouselFormValues(saved.value ?? []));
      setCarouselDirty(false);
      await onSaved(saved);
      message.success("轮播图已保存");
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(null);
    }
  };

  const saveSlogan = async (values: SloganSetting) => {
    if (submitting.current || mediaBusy) return;
    submitting.current = true;
    setSaving("slogan");
    try {
      const saved = await AdminSiteSettingApi.updateSlogan({
        value: {
          "zh-Hans": values["zh-Hans"].trim(),
          "zh-Hant": values["zh-Hant"].trim(),
          en: values.en.trim(),
        },
      });
      sloganForm.setFieldsValue(saved.value ?? emptySlogan);
      setSloganDirty(false);
      await onSaved(saved);
      message.success("网站标语已保存");
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(null);
    }
  };

  return (
    <>
      <DefaultContainer>
        <Typography.Title level={4}>轮播图</Typography.Title>
        <Form
          form={carouselForm}
          name="site-carousel"
          layout="vertical"
          initialValues={carouselFormValues(carousel)}
          onValuesChange={() => setCarouselDirty(true)}
          onFinish={(values) => {
            saveCarousel(values).catch((error: unknown) => message.error(apiErrorMessage(error)));
          }}
          disabled={busy}
          scrollToFirstError
        >
          <CarouselFields disabled={busy} onBusyChange={onBusyChange} />
          <Flex justify="end" align="center" wrap gap={12} className="mt-6">
            {mediaBusy && (
              <Typography.Text type="secondary">图片处理中，请完成后保存。</Typography.Text>
            )}
            <Button
              type="primary"
              htmlType="submit"
              loading={saving === "carousel"}
              disabled={busy}
            >
              保存轮播图
            </Button>
          </Flex>
        </Form>
      </DefaultContainer>

      <DefaultContainer>
        <Typography.Title level={4}>网站标语</Typography.Title>
        <Typography.Paragraph type="secondary">
          为三种网站语言分别填写标语，每种语言最多 256 字。
        </Typography.Paragraph>
        <Form
          form={sloganForm}
          name="site-slogan"
          layout="vertical"
          initialValues={slogan}
          onValuesChange={() => setSloganDirty(true)}
          onFinish={(values) => {
            saveSlogan(values).catch((error: unknown) => message.error(apiErrorMessage(error)));
          }}
          disabled={busy}
          scrollToFirstError
        >
          {sloganLanguages.map(({ key, label }) => (
            <Form.Item
              key={key}
              name={key}
              label={label}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  max: 256,
                  transform: (value: string) => value?.trim(),
                  message: `请输入${label}标语，最多 256 字`,
                },
              ]}
            >
              <Input.TextArea
                maxLength={256}
                showCount
                autoSize={{ minRows: 2, maxRows: 5 }}
                placeholder={`输入${label}标语`}
              />
            </Form.Item>
          ))}
          <Flex justify="end" align="center" wrap gap={12} className="mt-2">
            <Button type="primary" htmlType="submit" loading={saving === "slogan"} disabled={busy}>
              保存网站标语
            </Button>
          </Flex>
        </Form>
      </DefaultContainer>
      {confirmationModal}
    </>
  );
}
