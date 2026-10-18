import { FeatureAPI } from "@/api/cms/feature";
import useAuthStore from "@/stores/auth";
import type { EventFeature } from "@/types/event";
import type { Feature } from "@/types/feature";
import { apiErrorMessage } from "@/utils/apiError";
import { isPlatform } from "@/utils/permissions";
import { Accessibility } from "@dnd-kit/dom";
import { arrayMove } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { IconGripVertical, IconPlus } from "@tabler/icons-react";
import { App, Button, Empty, Flex, Tag, theme, Typography } from "antd";
import { useState } from "react";
import EventFeatureModal from "./EventFeatureModal";
import FeatureEditor from "./FeatureEditor";
import styles from "./EventFeatureList.module.css";

const featureKey = (feature: EventFeature) =>
  feature.isPublic ? `public:${feature.id}` : `private:${feature.name}`;

const accessibility = Accessibility.configure({
  screenReaderInstructions: {
    draggable: "按空格键开始排序，用方向键移动，再按空格键确认，按 Esc 取消。",
  },
  announcements: {
    dragstart: () => "已开始排序标签。",
    dragover: ({ operation: { source } }: DragOverEvent) =>
      isSortable(source) ? `移动到第 ${source.index + 1} 位。` : undefined,
    dragend: ({ canceled }: DragEndEvent) => (canceled ? "已取消排序。" : "标签顺序已更新。"),
  },
});

interface EventFeatureListProps {
  id?: string;
  value?: EventFeature[];
  onChange?: (features: EventFeature[]) => void;
}

export default function EventFeatureList({ id, value = [], onChange }: EventFeatureListProps) {
  const platform = isPlatform(useAuthStore((state) => state.user?.role));
  const { message } = App.useApp();
  const [modal, setModal] = useState<{ index?: number } | null>(null);
  const [editingPublic, setEditingPublic] = useState<Feature | null>(null);
  const [loadingId, setLoadingId] = useState<string>();
  const handleDragEnd = ({ canceled, operation: { source } }: DragEndEvent) => {
    if (canceled || !isSortable(source) || source.initialIndex === source.index) return;
    onChange?.(arrayMove(value, source.initialIndex, source.index));
  };

  const handleEdit = async (feature: EventFeature, index: number) => {
    if (!feature.isPublic) {
      setModal({ index });
      return;
    }
    if (!platform || !feature.id || loadingId) return;
    setLoadingId(feature.id);
    try {
      const data = await FeatureAPI.getFeatureList({
        current: 1,
        pageSize: 100,
        name: feature.name,
        isPublic: true,
      });
      const fullFeature = data.records.find((item) => item.id === feature.id);
      if (!fullFeature) {
        message.error("未找到此公共标签，请刷新活动后重试");
        return;
      }
      setEditingPublic(fullFeature);
    } catch (error) {
      message.error(apiErrorMessage(error));
    } finally {
      setLoadingId(undefined);
    }
  };

  return (
    <div id={id}>
      <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 8 }}>
        <Typography.Text strong>活动标签</Typography.Text>
        <Button icon={<IconPlus size={14} />} onClick={() => setModal({})}>
          添加标签
        </Button>
      </Flex>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        拖动左侧手柄调整展示顺序。标签关联、专属标签和排序随活动一起保存。
      </Typography.Paragraph>
      {value.length ? (
        <DragDropProvider
          onDragEnd={handleDragEnd}
          plugins={(defaults) => [...defaults, accessibility]}
        >
          <ul className={styles.list} aria-label="活动标签，按展示顺序排列">
            {value.map((feature, index) => (
              <SortableFeature
                key={featureKey(feature)}
                feature={feature}
                index={index}
                editable={!feature.isPublic || platform}
                removable={!feature.isPublic || platform}
                loading={feature.isPublic && loadingId === feature.id}
                onEdit={() => void handleEdit(feature, index)}
                onRemove={() => onChange?.(value.filter((_, itemIndex) => itemIndex !== index))}
              />
            ))}
          </ul>
        </DragDropProvider>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有标签，点击“添加标签”开始" />
      )}
      {modal && (
        <EventFeatureModal
          editingFeature={modal.index === undefined ? undefined : value[modal.index]}
          features={value}
          platform={platform}
          onClose={() => setModal(null)}
          onConfirm={(features) => {
            onChange?.(
              modal.index === undefined
                ? [...value, ...features]
                : value.map((feature, index) => (index === modal.index ? features[0] : feature)),
            );
            setModal(null);
          }}
        />
      )}
      {editingPublic && (
        <FeatureEditor
          opened
          editingFeature={editingPublic}
          onClose={() => setEditingPublic(null)}
          onSaved={(updated) => {
            onChange?.(
              value.map((feature) =>
                feature.isPublic && feature.id === updated.id
                  ? { ...feature, name: updated.name }
                  : feature,
              ),
            );
          }}
        />
      )}
    </div>
  );
}

function SortableFeature({
  feature,
  index,
  editable,
  removable,
  loading,
  onEdit,
  onRemove,
}: {
  feature: EventFeature;
  index: number;
  editable: boolean;
  removable: boolean;
  loading: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { token } = theme.useToken();
  const { ref, handleRef, isDragging } = useSortable({ id: featureKey(feature), index });

  return (
    <li
      ref={ref}
      className={styles.row}
      style={{
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        background: token.colorBgContainer,
        borderColor: isDragging ? token.colorPrimary : token.colorBorderSecondary,
        borderRadius: token.borderRadius,
        boxShadow: isDragging ? token.boxShadowSecondary : undefined,
      }}
    >
      <Button
        ref={handleRef}
        type="text"
        className={styles.handle}
        icon={<IconGripVertical size={18} />}
        aria-label={`拖动排序：${feature.name}`}
      />
      <Typography.Text className={styles.name}>{feature.name}</Typography.Text>
      <Tag color={feature.isPublic ? "blue" : "default"}>
        {feature.isPublic ? "公共标签" : "活动专属标签"}
      </Tag>
      <div className={styles.actions}>
        {editable && (
          <Button size="small" type="link" loading={loading} onClick={onEdit}>
            编辑
          </Button>
        )}
        {removable && (
          <Button
            size="small"
            type="link"
            danger
            onClick={onRemove}
            aria-label={`从本活动移除：${feature.name}`}
          >
            移除
          </Button>
        )}
      </div>
    </li>
  );
}
