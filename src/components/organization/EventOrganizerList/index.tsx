import type { EditableEvent } from "@/types/event";
import type { Organization } from "@/types/organization";
import { Accessibility } from "@dnd-kit/dom";
import { arrayMove } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { IconGripVertical, IconPlus } from "@tabler/icons-react";
import { Button, Empty, Flex, Modal, Tag, theme, Typography } from "antd";
import { useState } from "react";
import OrganizationSelector from "../OrganizationSelector";
import styles from "./style.module.css";

type Organizer = EditableEvent["organizations"][number];

const accessibility = Accessibility.configure({
  screenReaderInstructions: {
    draggable: "按空格键开始排序，用方向键移动，再按空格键确认，按 Esc 取消。",
  },
  announcements: {
    dragstart: () => "已开始排序主办组织。",
    dragover: ({ operation: { source } }: DragOverEvent) =>
      isSortable(source) ? `移动到第 ${source.index + 1} 位。` : undefined,
    dragend: ({ canceled }: DragEndEvent) => (canceled ? "已取消排序。" : "主办组织顺序已更新。"),
  },
});

export default function EventOrganizerList({
  id,
  value = [],
  onChange,
  organizations = [],
}: {
  id?: string;
  value?: Organizer[];
  onChange?: (organizers: Organizer[]) => void;
  organizations?: Organization[];
}) {
  const [knownOrganizations, setKnownOrganizations] = useState(organizations);
  const [adding, setAdding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleDragEnd = ({ canceled, operation: { source } }: DragEndEvent) => {
    if (canceled || !isSortable(source) || source.initialIndex === source.index) return;
    onChange?.(arrayMove(value, source.initialIndex, source.index));
  };

  return (
    <div id={id}>
      <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 8 }}>
        <Typography.Text strong>主办组织</Typography.Text>
        <Button
          icon={<IconPlus size={14} />}
          onClick={() => {
            setSelectedIds([]);
            setAdding(true);
          }}
        >
          添加组织
        </Button>
      </Flex>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        拖动左侧手柄调整展示顺序。不设置主要组织时，各组织平等联合主办。随活动一起保存。
      </Typography.Paragraph>
      {value.length ? (
        <DragDropProvider
          onDragEnd={handleDragEnd}
          plugins={(defaults) => [...defaults, accessibility]}
        >
          <ul className={styles.list} aria-label="主办组织，按展示顺序排列">
            {value.map((organizer, index) => (
              <OrganizerRow
                key={organizer.id}
                organizer={organizer}
                name={
                  knownOrganizations.find((item) => item.id === organizer.id)?.name ?? organizer.id
                }
                index={index}
                onTogglePrimary={() =>
                  onChange?.(
                    value.map((item) => ({
                      ...item,
                      isPrimary: item.id === organizer.id && !organizer.isPrimary,
                    })),
                  )
                }
                onRemove={() => onChange?.(value.filter((item) => item.id !== organizer.id))}
              />
            ))}
          </ul>
        </DragDropProvider>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请添加至少一个主办组织" />
      )}
      <Modal
        open={adding}
        title="添加主办组织"
        okText="添加"
        cancelText="取消"
        okButtonProps={{ disabled: !selectedIds.length }}
        onCancel={() => setAdding(false)}
        onOk={() => {
          const addedIds = selectedIds.filter(
            (selectedId) => !value.some((item) => item.id === selectedId),
          );
          onChange?.([
            ...value,
            ...addedIds.map((selectedId) => ({ id: selectedId, isPrimary: false })),
          ]);
          setAdding(false);
        }}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary">
          搜索并选择组织，已添加的组织不可重复选择。
        </Typography.Paragraph>
        <OrganizationSelector
          value={selectedIds}
          onChange={(ids) => setSelectedIds(Array.isArray(ids) ? ids : [])}
          selectedOptions={knownOrganizations}
          onSelect={(selected) => setKnownOrganizations(selected ?? [])}
          disabledIds={value.map((item) => item.id)}
          antdSelectProps={{ mode: "multiple", style: { width: "100%" } }}
        />
      </Modal>
    </div>
  );
}

function OrganizerRow({
  organizer,
  name,
  index,
  onTogglePrimary,
  onRemove,
}: {
  organizer: Organizer;
  name: string;
  index: number;
  onTogglePrimary: () => void;
  onRemove: () => void;
}) {
  const { token } = theme.useToken();
  const { ref, handleRef, isDragging } = useSortable({ id: organizer.id, index });

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
        aria-label={`拖动排序主办组织：${name}`}
      />
      <Typography.Text className={styles.name}>{name}</Typography.Text>
      <div className={styles.actions}>
        {organizer.isPrimary && <Tag color="blue">主要</Tag>}
        <Button
          size="small"
          type="link"
          onClick={onTogglePrimary}
          aria-label={`${organizer.isPrimary ? "取消主要组织" : "设为主要组织"}：${name}`}
          aria-pressed={organizer.isPrimary}
        >
          {organizer.isPrimary ? "取消主要" : "设为主要"}
        </Button>
        <Button
          size="small"
          type="link"
          danger
          onClick={onRemove}
          aria-label={`移除主办组织：${name}`}
        >
          移除
        </Button>
      </div>
    </li>
  );
}
