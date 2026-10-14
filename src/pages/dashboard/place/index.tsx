import { useState, useEffect } from "react";
import { Button, Flex, Input, Select, Space, Typography, Alert, App, Table } from "antd";
import PlaceEditor, { placeKinds } from "@/components/Place/PlaceEditor";
import { IconCirclePlus, IconRefresh } from "@tabler/icons-react";
import DefaultContainer from "@/components/Layout/Container";

import useSWR from "swr";
import { type ColumnsType } from "antd/es/table";
import { apiErrorMessage } from "@/utils/apiError";
import EntitySelect from "@/components/Cms/EntitySelect";
import { PlaceAPI } from "@/api/dashboard/place";
import { toOptions } from "@/consts/labels";
import type { Place } from "@/types/place";
import useAuthStore from "@/stores/auth";
import { isPlatform } from "@/utils/permissions";

export default function PlacePage() {
  const platform = isPlatform(useAuthStore((state) => state.user?.role));
  const [search, setSearch] = useState("");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [kind, setKind] = useState<Place["kind"]>();
  const { message, modal } = App.useApp();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  useEffect(() => {
    setCurrent(1);
  }, [search, regionId, kind]);
  const { data, error, isLoading, mutate } = useSWR(["places", search, regionId, kind, current, pageSize], () =>
    PlaceAPI.list({ current, pageSize, name: search || undefined, regionId: regionId || undefined, kind }),
  );
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Place>();
  const open = (record?: Place) => {
    setEditing(record);
    setOpened(true);
  };
  const records = data?.records ?? [];
  const columns: ColumnsType<Place> = [
    { title: "名称", dataIndex: "name" },
    { title: "类型", render: (_, v) => placeKinds[v.kind] },
    { title: "地区", render: (_, v) => v.region?.name },
    { title: "地址", dataIndex: "address" },
    { title: "坐标", render: (_, v) => (v.latitude == null ? "未设置" : `${v.latitude}, ${v.longitude}`) },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          {platform && <Button onClick={() => open(record)}>编辑</Button>}

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
                      await PlaceAPI.delete(record.id);
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
      <DefaultContainer className="sticky top-0 z-20">
        <Flex className="md:flex-row flex-col gap-2" justify="space-between" align="center">
          <Typography.Title level={3} className="m-0">
            地点列表
          </Typography.Title>
          <Space>
            <Button icon=<IconRefresh size={16} stroke={1.5} /> onClick={() => void mutate()}>
              刷新
            </Button>
            {platform && (
              <Button type="primary" icon=<IconCirclePlus size={16} stroke={1.5} /> onClick={() => void open()}>
                添加地点
              </Button>
            )}
          </Space>
        </Flex>
      </DefaultContainer>
      <Space wrap>
        <Input.Search allowClear placeholder="搜索地点名称" onSearch={setSearch} style={{ width: 240 }} />
        <EntitySelect kind="region" value={regionId} onChange={setRegionId} placeholder="全部地区" />
        <Select
          allowClear
          placeholder="全部类型"
          style={{ width: 140 }}
          value={kind}
          onChange={setKind}
          options={toOptions(placeKinds)}
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
      {platform && opened && (
        <PlaceEditor
          place={editing}
          regionId={regionId}
          onCancel={() => setOpened(false)}
          onSaved={() => {
            setOpened(false);
            void mutate();
          }}
        />
      )}
    </div>
  );
}
