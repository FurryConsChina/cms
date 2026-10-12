import { toNullable } from "@/utils/form";
import { useEffect, useState, type ReactNode } from "react";
import useSWR from "swr";
import { Alert, App, Button, Drawer, Flex, Form, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { FormInstance } from "antd";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import type { z } from "zod";
import type { List, PageQuery } from "@/types/Request";
import { apiErrorMessage } from "@/utils/apiError";

type Sortable = { id: string; sortOrder: number };

export default function ResourcePage<T extends { id: string }, V extends object>({
  title,
  embedded = false,
  queryKey,
  list,
  columns,
  schema,
  initialValues,
  save,
  remove,
  editor,
  detail,
  filters,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  actions,
  transform,
  reorder,
  createHint,
}: {
  title: string;
  /** 嵌入在其他页面（例如标签页）中时不显示大标题。 */
  embedded?: boolean;
  queryKey: unknown[];
  list: (page: PageQuery) => Promise<List<T>>;
  columns: ColumnsType<T>;
  schema: z.ZodType<V>;
  initialValues: (record: T | undefined, context: { total: number }) => Record<string, unknown>;
  save: (id: string | undefined, values: V) => Promise<T>;
  remove?: (id: string) => Promise<unknown>;
  editor: (form: FormInstance, record?: T) => ReactNode;
  detail?: (record: T) => Promise<T>;
  filters?: ReactNode;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  actions?: (record: T) => ReactNode;
  transform?: (values: Record<string, unknown>) => unknown;
  /** 提供后显示上移、下移按钮；只保存顺序发生变化的记录。 */
  reorder?: (record: T & Sortable, sortOrder: number) => Promise<unknown>;
  /** 新建时显示在表单顶部的提示。 */
  createHint?: string;
}) {
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const queryScope = JSON.stringify(queryKey);
  useEffect(() => {
    setCurrent(1);
  }, [queryScope]);
  const { data, error, isLoading, mutate } = useSWR([...queryKey, current, pageSize], () =>
    list({ current, pageSize }),
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<T>();
  const [saving, setSaving] = useState(false);
  const [openingId, setOpeningId] = useState<string>();
  const [sorting, setSorting] = useState(false);
  const [form] = Form.useForm();

  const fill = (record?: T) => {
    form.resetFields();
    form.setFieldsValue(initialValues(record, { total: data?.total ?? 0 }));
    setEditing(record);
  };

  const open = async (record?: T) => {
    if (!record) {
      fill();
      setOpened(true);
      return;
    }
    try {
      setOpeningId(record.id);
      fill(detail ? await detail(record) : record);
      setOpened(true);
    } catch (e) {
      message.error(apiErrorMessage(e));
    } finally {
      setOpeningId(undefined);
    }
  };

  const close = () => {
    if (saving) return;
    if (!form.isFieldsTouched()) return setOpened(false);
    modal.confirm({
      title: "放弃未保存的修改？",
      okText: "放弃",
      okButtonProps: { danger: true },
      cancelText: "继续编辑",
      onOk: () => setOpened(false),
    });
  };

  const submit = async (values: Record<string, unknown>) => {
    const parsed = schema.safeParse(transform ? transform(values) : toNullable(values));
    if (!parsed.success) {
      form.setFields(
        parsed.error.issues
          .filter((issue) => issue.path.length)
          .map((issue) => ({ name: issue.path as (string | number)[], errors: [issue.message] })),
      );
      message.error(parsed.error.issues[0]?.message ?? "请检查表单内容");
      return;
    }
    setSaving(true);
    try {
      const saved = await save(editing?.id, parsed.data);
      await mutate();
      if (editing) {
        message.success("已保存");
        setOpened(false);
      } else {
        fill(detail ? await detail(saved) : saved);
        message.success("已创建，可以继续补充内容");
      }
    } catch (e) {
      message.error(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const records = data?.records ?? [];
  const move = async (index: number, offset: -1 | 1) => {
    if (!reorder) return;
    const next = [...records] as (T & Sortable)[];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    const base = (current - 1) * pageSize;
    setSorting(true);
    try {
      for (const [i, record] of next.entries()) {
        if (record.sortOrder !== base + i) await reorder(record, base + i);
      }
    } catch (e) {
      message.error(apiErrorMessage(e));
    } finally {
      await mutate();
      setSorting(false);
    }
  };

  const allColumns: ColumnsType<T> = [
    ...(reorder && canEdit
      ? [
          {
            title: "顺序",
            key: "order",
            width: 90,
            render: (_: unknown, __: T, index: number) => (
              <Space.Compact>
                <Button
                  size="small"
                  aria-label="上移"
                  disabled={sorting || index === 0}
                  icon={<IconArrowUp size={14} />}
                  onClick={() => void move(index, -1)}
                />
                <Button
                  size="small"
                  aria-label="下移"
                  disabled={sorting || index === records.length - 1}
                  icon={<IconArrowDown size={14} />}
                  onClick={() => void move(index, 1)}
                />
              </Space.Compact>
            ),
          },
        ]
      : []),
    ...columns,
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          {canEdit && (
            <Button loading={openingId === record.id} onClick={() => void open(record)}>
              编辑
            </Button>
          )}
          {actions?.(record)}
          {remove && canDelete && (
            <Button
              danger
              onClick={() =>
                modal.confirm({
                  title: "确认删除这条记录？",
                  content: "删除后将不再展示。如果其他内容引用了这条记录，删除会失败。",
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      await remove(record.id);
                      message.success("已删除");
                      await mutate();
                    } catch (e) {
                      message.error(apiErrorMessage(e));
                      throw e;
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
        {embedded ? (
          <div>{filters}</div>
        ) : (
          <Typography.Title level={3} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
        )}
        <Space>
          <Button onClick={() => void mutate()}>刷新</Button>
          {canCreate && (
            <Button type="primary" onClick={() => void open()}>
              新建{title}
            </Button>
          )}
        </Space>
      </Flex>
      {!embedded && filters}
      {error && (
        <Alert
          type="error"
          showIcon
          title={apiErrorMessage(error)}
          action={<Button onClick={() => void mutate()}>重试</Button>}
        />
      )}
      <Table
        rowKey="id"
        columns={allColumns}
        dataSource={records}
        loading={isLoading || sorting}
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
        title={editing ? `编辑${title}` : `新建${title}`}
        open={opened}
        onClose={close}
        size={Math.min(760, window.innerWidth)}
        destroyOnHidden
        footer={
          <Flex justify="flex-end" gap={8}>
            <Button onClick={close} disabled={saving}>
              {editing ? "关闭" : "取消"}
            </Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {editing ? "保存" : "创建"}
            </Button>
          </Flex>
        }
      >
        {!editing && createHint && <Alert type="info" showIcon title={createHint} className="mb-4" />}
        <Form form={form} layout="vertical" onFinish={submit} scrollToFirstError>
          {editor(form, editing)}
        </Form>
      </Drawer>
    </div>
  );
}
