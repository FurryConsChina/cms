import { useEffect, useRef, useState } from "react";
import { uniqBy } from "es-toolkit";
import { IconSettings } from "@tabler/icons-react";
import {
  Alert,
  App,
  AutoComplete,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  List,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
import { useSWRConfig } from "swr";
import { OfferAPI, offerSchema } from "@/api/cms/offer";
import { ParticipantAPI, participantSchema } from "@/api/cms/participant";
import DefaultContainer from "@/components/layout/Container";
import useMediaBusy from "@/components/media/useMediaBusy";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";
import type { EventItem } from "@/types/event";
import type { MediaBinding } from "@/types/media";
import { apiErrorMessage } from "@/utils/apiError";
import { toNullable } from "@/utils/form";
import { imageUrl } from "@/utils/imageLoader";
import { OfferFields } from "./OfferPanel";
import ParticipantFields from "./ParticipantFields";
import {
  listModels,
  modelEndpoint,
  recognizePoster,
  type LocalModelSettings,
  type PosterRecognitionResult,
  type RecognizedParticipant,
  type RecognizedOffer,
} from "./posterRecognition";

const settingsKey = "poster-recognition-model";
const recognitionTimeoutMs = 5 * 60 * 1000;
const defaultSettings = { baseUrl: "http://127.0.0.1:3425", model: "codex/gpt-6-astra" };

function initialSettings(): LocalModelSettings {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(settingsKey) ?? "null");
    if (value && typeof value === "object" && "baseUrl" in value && "model" in value) {
      const { baseUrl, model } = value;
      const token = "token" in value && typeof value.token === "string" ? value.token : "";
      if (typeof baseUrl === "string" && typeof model === "string")
        return { baseUrl, model, token };
    }
  } catch {
    // 浏览器不允许存储时仍可使用默认配置。
  }
  return { ...defaultSettings, token: "" };
}

type Selection =
  | { kind: "offer"; index: number; value: RecognizedOffer }
  | { kind: "participant"; index: number; value: RecognizedParticipant };

const participantRoles = { guest: "嘉宾", exhibitor: "展商", sponsor: "赞助商", media: "媒体" };

export default function PosterRecognitionPanel({ event }: { event: EventItem }) {
  const { message, modal } = App.useApp();
  const { mutate } = useSWRConfig();
  const [settings, setSettings] = useState(initialSettings);
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState("");
  const [modelRefresh, setModelRefresh] = useState(0);
  const images = uniqBy(
    event.poster
      .map((media, index) => ({
        ...media,
        label: media.title || `详情海报 ${index + 1}`,
      }))
      .filter((media) => media.url),
    (media) => media.mediaAssetId,
  );
  const [result, setResult] = useState<PosterRecognitionResult>({ offers: [], participants: [] });
  const [hasRecognized, setHasRecognized] = useState(false);
  const [created, setCreated] = useState<string[]>([]);
  const [recognizingImage, setRecognizingImage] = useState<string>();
  const recognitionRef = useRef<AbortController | null>(null);
  const recognitionTimerRef = useRef<number | undefined>(undefined);
  const recognizing = !!recognizingImage;
  const [opening, setOpening] = useState<string>();
  const [selection, setSelection] = useState<Selection>();
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [form] = Form.useForm();
  const { busy: mediaBusy, onBusyChange } = useMediaBusy();
  const { confirmationModal } = useUnsavedChangesGuard({
    dirty: !!selection && (dirty || form.isFieldsTouched()),
    busy: saving || submitting.current || mediaBusy || !!opening || recognizing,
  });

  useEffect(() => {
    return () => {
      const controller = recognitionRef.current;
      recognitionRef.current = null;
      window.clearTimeout(recognitionTimerRef.current);
      recognitionTimerRef.current = undefined;
      controller?.abort();
    };
  }, []);

  const { baseUrl: draftBaseUrl, token: draftToken } = settingsDraft;
  useEffect(() => {
    if (!settingsOpen) return;
    const controller = new AbortController();
    setModels([]);
    setModelsError("");
    setModelsLoading(true);
    const timer = window.setTimeout(() => {
      listModels({ baseUrl: draftBaseUrl, token: draftToken }, controller.signal)
        .then((items) => {
          if (!controller.signal.aborted) setModels(items);
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) setModelsError(apiErrorMessage(error));
        })
        .finally(() => {
          if (!controller.signal.aborted) setModelsLoading(false);
        });
    }, 400);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [settingsOpen, draftBaseUrl, draftToken, modelRefresh]);

  const showAllModels = models.some((model) => model === settingsDraft.model);
  const modelOptions = showAllModels
    ? models
    : models.filter((model) => model.toLowerCase().includes(settingsDraft.model.toLowerCase()));
  const currentModelOptions = modelOptions.length ? modelOptions : models;

  const openSettings = () => {
    setSettingsDraft(settings);
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    try {
      modelEndpoint(settingsDraft.baseUrl);
      if (!settingsDraft.model.trim()) throw new Error("请填写模型名称。");
      const next = {
        baseUrl: settingsDraft.baseUrl.trim(),
        model: settingsDraft.model.trim(),
        token: settingsDraft.token.trim(),
      };
      try {
        localStorage.setItem(settingsKey, JSON.stringify(next));
      } catch {
        message.error("保存失败，请检查浏览器是否允许保存数据。");
        return;
      }
      setSettings(next);
      setSettingsOpen(false);
      message.success("模型设置已保存");
    } catch (error) {
      message.error(apiErrorMessage(error));
    }
  };

  const recognize = async (image: MediaBinding) => {
    if (recognitionRef.current) return;
    const controller = new AbortController();
    recognitionRef.current = controller;
    setRecognizingImage(image.mediaAssetId);
    let timedOut = false;
    const timer = window.setTimeout(() => {
      if (!controller.signal.aborted) {
        timedOut = true;
        controller.abort();
      }
    }, recognitionTimeoutMs);
    recognitionTimerRef.current = timer;
    try {
      const { result: next, incomplete } = await recognizePoster(
        event,
        image,
        settings,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setResult((current) => ({
        offers: [...current.offers, ...next.offers],
        participants: [...current.participants, ...next.participants],
      }));
      setHasRecognized(true);
      if (incomplete) {
        message.warning("模型返回的部分结果不完整，已保留可用内容，请核对海报。");
      }
    } catch (error) {
      if (recognitionRef.current === controller) {
        if (controller.signal.aborted && timedOut) {
          message.error("识别超时，请检查网关和模型后重试。");
        } else if (controller.signal.aborted) {
          message.info("已取消识别。");
        } else {
          message.error(apiErrorMessage(error));
        }
      }
    } finally {
      window.clearTimeout(timer);
      if (recognitionRef.current === controller) {
        recognitionTimerRef.current = undefined;
        recognitionRef.current = null;
        setRecognizingImage(undefined);
      }
    }
  };

  const openCandidate = async (next: Selection) => {
    if (opening || selection) return;
    const key = `${next.kind}-${next.index}`;
    setOpening(key);
    try {
      const { total } =
        next.kind === "offer"
          ? await OfferAPI.list({ eventId: event.id, current: 1, pageSize: 1 })
          : await ParticipantAPI.list({ eventId: event.id, current: 1, pageSize: 1 });
      form.resetFields();
      const values =
        next.kind === "offer"
          ? {
              eventId: event.id,
              sortOrder: total,
              name: next.value.name,
              description: next.value.description,
              price: next.value.priceKind === "current" ? next.value.price : null,
              priceNote: next.value.priceNote,
              currency: next.value.currency,
              availability: next.value.availability,
              saleStartAt: next.value.saleStartAt,
              saleEndAt: next.value.saleEndAt,
              admissionDates: [],
              benefits: [],
            }
          : {
              eventId: event.id,
              sortOrder: total,
              role: next.value.role,
              description: next.value.description,
              booth: next.value.booth,
              appearanceDates: next.value.appearanceDates ?? [],
              profileId: null,
              organizationId: null,
              subjectType: "profile",
              isFeatured: false,
              portrait: [],
              gallery: [],
            };
      form.setFieldsValue(values);
      form.setFields(Object.keys(values).map((name) => ({ name, touched: false })));
      setDirty(false);
      setSelection(next);
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setOpening(undefined);
    }
  };

  const closeCreate = () => {
    if (submitting.current || mediaBusy) return;
    if (!dirty && !form.isFieldsTouched()) {
      setSelection(undefined);
      return;
    }
    modal.confirm({
      title: "放弃未保存的修改？",
      okText: "放弃",
      cancelText: "继续编辑",
      okButtonProps: { danger: true },
      onOk: () => setSelection(undefined),
    });
  };

  const submit = async (values: Record<string, unknown>) => {
    if (!selection || submitting.current || mediaBusy) return;
    const { subjectType, ...fields } = values;
    const parsed =
      selection.kind === "offer"
        ? offerSchema.safeParse(toNullable(fields))
        : participantSchema.safeParse(
            toNullable({
              ...fields,
              profileId: subjectType === "profile" ? fields.profileId : null,
              organizationId: subjectType === "organization" ? fields.organizationId : null,
            }),
          );
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
      if (selection.kind === "offer") {
        const offer = offerSchema.parse(parsed.data);
        await OfferAPI.save(undefined, offer);
      } else {
        const participant = participantSchema.parse(parsed.data);
        await ParticipantAPI.save(undefined, participant);
      }
      setCreated((current) => [...current, `${selection.kind}-${selection.index}`]);
      setDirty(false);
      setSelection(undefined);
      message.success("已创建");
      mutate(
        (key: unknown) =>
          Array.isArray(key) &&
          (key[0] === "offers" || key[0] === "participants") &&
          key[1] === event.id,
      ).catch(() => message.warning("已创建，列表刷新失败，请手动刷新"));
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <DefaultContainer className="space-y-5">
      {confirmationModal}
      <Flex justify="space-between" align="center" gap={12}>
        <Typography.Title level={4} className="m-0">
          识别海报
        </Typography.Title>
        <Button
          type="text"
          icon={<IconSettings size={18} />}
          aria-label="模型设置"
          title="模型设置"
          disabled={recognizing}
          onClick={openSettings}
        />
      </Flex>
      <Modal
        title="模型设置"
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        onOk={saveSettings}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary">
          使用支持 /v1/messages 的本地网关。请在网关设置中允许当前 CMS 页面访问。
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={saveSettings}>
          <Form.Item label="本地模型地址" required>
            <Input
              aria-label="本地模型地址"
              placeholder="本地模型地址"
              value={settingsDraft.baseUrl}
              onChange={(event) =>
                setSettingsDraft((current) => ({ ...current, baseUrl: event.target.value }))
              }
            />
          </Form.Item>
          <Form.Item
            label="模型名称"
            required
            extra={
              <Flex align="center" gap={8} wrap>
                <span>
                  {modelsLoading
                    ? "正在获取模型列表…"
                    : modelsError
                      ? `${modelsError} 可手动输入。`
                      : models.length
                        ? `已获取 ${models.length} 个模型，可选择或手动输入。`
                        : "未获取到模型，可手动输入模型名称。"}
                </span>
                <Button
                  type="link"
                  size="small"
                  className="p-0"
                  disabled={modelsLoading}
                  onClick={() => setModelRefresh((current) => current + 1)}
                >
                  刷新列表
                </Button>
              </Flex>
            }
          >
            <AutoComplete
              aria-label="模型名称"
              placeholder="选择或输入模型名称"
              value={settingsDraft.model}
              options={currentModelOptions.map((model) => ({ value: model }))}
              onChange={(model) => setSettingsDraft((current) => ({ ...current, model }))}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="模型网关密钥" extra="选填。设置保存在当前浏览器中。">
            <Input.Password
              aria-label="模型网关密钥"
              placeholder="模型网关密钥（选填）"
              autoComplete="off"
              value={settingsDraft.token}
              onChange={(event) =>
                setSettingsDraft((current) => ({ ...current, token: event.target.value }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      <div>
        <Typography.Title level={5}>活动海报</Typography.Title>
        {images.length ? (
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
              {images.map((image) => (
                <div key={image.mediaAssetId} className="min-w-0 space-y-2">
                  <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-slate-100/60">
                    <Image
                      src={imageUrl(image.url!)}
                      alt={image.label}
                      width="100%"
                      height="100%"
                      style={{ objectFit: "contain" }}
                      rootClassName="h-full w-full"
                    />
                  </div>
                  <Typography.Text ellipsis={{ tooltip: image.label }} className="block">
                    {image.label}
                  </Typography.Text>
                  {recognizingImage === image.mediaAssetId ? (
                    <Button
                      block
                      aria-label={`取消识别${image.label}`}
                      onClick={() => recognitionRef.current?.abort()}
                    >
                      取消识别
                    </Button>
                  ) : (
                    <Button
                      block
                      type="primary"
                      disabled={recognizing}
                      aria-label={`识别${image.label}`}
                      onClick={() => {
                        recognize(image).catch((error: unknown) =>
                          message.error(apiErrorMessage(error)),
                        );
                      }}
                    >
                      开始识别
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        ) : (
          <Empty description="请先在基础资料中添加详情海报" />
        )}
      </div>
      <div>
        <Divider />
        <Flex justify="space-between" align="center" wrap gap={8}>
          <Typography.Title level={5} className="m-0">
            识别结果
          </Typography.Title>
          {hasRecognized && (
            <Button
              disabled={recognizing || !!opening || !!selection}
              onClick={() => {
                setResult({ offers: [], participants: [] });
                setCreated([]);
                setHasRecognized(false);
              }}
            >
              清空结果
            </Button>
          )}
        </Flex>
        {hasRecognized && (
          <Typography.Text type="secondary">多次识别的结果会追加，可能包含重复项。</Typography.Text>
        )}
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <Card
            size="small"
            title={
              <Flex justify="space-between" align="center" gap={8}>
                <span>参与者</span>
                <Typography.Text type="secondary">{result.participants.length} 项</Typography.Text>
              </Flex>
            }
          >
            {result.participants.length ? (
              <List
                dataSource={result.participants}
                renderItem={(participant, index) => (
                  <List.Item
                    actions={[
                      <Button
                        key="create"
                        loading={opening === `participant-${index}`}
                        disabled={created.includes(`participant-${index}`)}
                        onClick={() => {
                          openCandidate({ kind: "participant", index, value: participant }).catch(
                            (error: unknown) => message.error(apiErrorMessage(error)),
                          );
                        }}
                      >
                        {created.includes(`participant-${index}`) ? "已创建" : "创建参与者"}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={participant.name}
                      description={
                        <Space size={4} wrap>
                          <Tag>
                            {participant.role ? participantRoles[participant.role] : "角色待确认"}
                          </Tag>
                          {participant.booth && (
                            <Typography.Text>摊位：{participant.booth}</Typography.Text>
                          )}
                          {participant.description && (
                            <Typography.Text>{participant.description}</Typography.Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={hasRecognized ? "没有识别到参与者" : "识别海报后查看参与者"}
              />
            )}
          </Card>
          <Card
            size="small"
            title={
              <Flex justify="space-between" align="center" gap={8}>
                <span>票务</span>
                <Typography.Text type="secondary">{result.offers.length} 项</Typography.Text>
              </Flex>
            }
          >
            {result.offers.length ? (
              <List
                dataSource={result.offers}
                renderItem={(offer, index) => (
                  <List.Item
                    actions={[
                      <Button
                        key="create"
                        loading={opening === `offer-${index}`}
                        disabled={created.includes(`offer-${index}`)}
                        onClick={() => {
                          openCandidate({ kind: "offer", index, value: offer }).catch(
                            (error: unknown) => message.error(apiErrorMessage(error)),
                          );
                        }}
                      >
                        {created.includes(`offer-${index}`) ? "已创建" : "创建票档"}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={offer.name}
                      description={
                        offer.price === null
                          ? "价格待确认"
                          : `${offer.price}${offer.currency ? ` ${offer.currency}` : ""}${offer.priceKind !== "current" ? "（价格类型待确认）" : ""}`
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={hasRecognized ? "没有识别到票档" : "识别海报后查看票档"}
              />
            )}
          </Card>
        </div>
      </div>
      <Modal
        title={selection?.kind === "offer" ? "新建票档" : "新建参与者"}
        open={!!selection}
        onCancel={closeCreate}
        centered
        width={760}
        destroyOnHidden
        footer={
          <Space>
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
          </Space>
        }
      >
        {selection?.kind === "offer" &&
          selection.value.price !== null &&
          selection.value.priceKind !== "current" && (
            <Alert
              className="mb-4"
              type="info"
              showIcon
              title={`海报价格：${selection.value.price}${selection.value.currency ? ` ${selection.value.currency}` : ""}，请确认价格类型后填写。`}
            />
          )}
        {selection?.kind === "participant" && (
          <Alert
            className="mb-4"
            type="info"
            showIcon
            title={
              <>
                识别到候选：<Tag>{selection.value.name}</Tag>
                请选择对应的主体资料或组织，并确认参加角色。
              </>
            }
          />
        )}
        <Form
          form={form}
          layout="vertical"
          disabled={saving}
          onValuesChange={() => setDirty(true)}
          onFinish={(values: Record<string, unknown>) => {
            submit(values).catch((error: unknown) => message.error(apiErrorMessage(error)));
          }}
          scrollToFirstError
        >
          {selection?.kind === "offer" ? (
            <OfferFields eventId={event.id} />
          ) : selection?.kind === "participant" ? (
            <ParticipantFields
              form={form}
              disabled={saving || mediaBusy}
              onBusyChange={onBusyChange}
            />
          ) : null}
        </Form>
      </Modal>
    </DefaultContainer>
  );
}
