import { Button, Flex, Typography, Space, App, Table, MenuProps, Dropdown } from "antd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DefaultContainer from "@/components/Layout/Container";
import { IconCirclePlus, IconEdit, IconMenu, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { RegionAPI } from "@/api/dashboard/region";
import { RegionType, RegionTypeLabel, type Region } from "@/types/region";
import { ColumnsType } from "antd/es/table";
import { parseAsInteger, useQueryState } from "nuqs";
import useSWR from "swr";

const { Title, Text } = Typography;

export default function RegionPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [current, setCurrent] = useQueryState("current", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(20));

  const { isLoading, data } = useSWR(["region-list", current, pageSize], () =>
    RegionAPI.getRegionList({ current, pageSize })
  );

  const columns: ColumnsType<Region> = [
    {
      title: "地区名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "地区代码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "地区类型",
      dataIndex: "type",
      key: "type",
      render: (_, record) => RegionTypeLabel[record.type],
    },
    {
      title: "排序顺序",
      dataIndex: "sortOrder",
      key: "sortOrder",
    },
    {
      title: "父级地区",
      dataIndex: "parent",
      key: "parent",
      render: (_, record) => record.parent?.name,
    },

    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          { type: "divider" },
          {
            key: "delete",
            icon: <IconTrash style={{ width: 14, height: 14 }} />,
            label: "删除",
            danger: true,
            disabled: true,
          },
        ];

        return (
          <Space size="middle">
            <Button
              type="primary"
              ghost
              onClick={() => {
                navigate(`/dashboard/region/${record.id}/edit`);
              }}
              icon={<IconEdit size={14} />}
            >
              编辑
            </Button>

            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button icon={<IconMenu size={14} stroke={1.5} />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const handleRefreshRegionSort = async () => {
    try {
      await RegionAPI.recreateRegionOrder(RegionType.CITY);
      message.success("刷新地区排序成功");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DefaultContainer className="sticky top-0 z-20">
        <Flex className="md:flex-row flex-col gap-2" justify="space-between" align="center">
          <Title level={3} className="m-0">
            地区列表
          </Title>

          <Space>
            <Button icon={<IconRefresh size={16} stroke={1.5} />} onClick={handleRefreshRegionSort}>
              刷新地区排序
            </Button>
            <Button
              type="primary"
              icon={<IconCirclePlus size={16} stroke={1.5} />}
              onClick={() => navigate("/dashboard/region/create")}
            >
              添加地区
            </Button>
          </Space>
        </Flex>
      </DefaultContainer>

      <div className="shadow-sm mt-4 p-4 rounded-xl bg-white">
        <Table
          rowKey={(row) => row.id}
          columns={columns}
          loading={isLoading}
          dataSource={data?.records || []}
          pagination={{
            pageSize: pageSize,
            total: data?.total,
            current: current,
          }}
          scroll={{ x: "max-content" }}
          onChange={(pagination) => {
            setPageSize(pagination.pageSize || pageSize);
            setCurrent(pagination.current || current);
          }}
        />
      </div>
    </>
  );
}
