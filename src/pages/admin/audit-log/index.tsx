import { useState } from "react";
import useSWR from "swr";
import { Alert, Descriptions, Table, Typography } from "antd";
import { AdminAuditLogApi, type AuditLogQuery } from "@/api/cms/admin/auditLog";
import { auditActionLabel, targetTypeLabels } from "@/consts/labels";
import { apiErrorMessage } from "@/utils/apiError";
import type { AuditLog } from "@/types/access";
import type { List } from "@/types/request";
import DefaultContainer from "@/components/layout/Container";
import TableDateRangeFilterDropdown from "@/components/common/TableDateRangeFilterDropdown";
import TableSelectFilterDropdown from "@/components/common/TableSelectFilterDropdown";

const actionOptions = [
  "application.created",
  "application.updated",
  "application.deleted",
  "auth.password_changed",
  "auth.password_reset",
  "event.created",
  "event.updated",
  "event.visibility_changed",
  "event_benefit.created",
  "event_benefit.updated",
  "event_benefit.deleted",
  "event_feature.created",
  "event_feature.updated",
  "event_feature.deleted",
  "event_participation.created",
  "event_participation.updated",
  "event_participation.deleted",
  "feedback.update",
  "infra.cache_cleaned",
  "infra.sitemap_generated",
  "infra.sitemap_refreshed",
  "media.deleted",
  "media.usages_replaced",
  "offer.created",
  "offer.updated",
  "offer.deleted",
  "organization.created",
  "organization.updated",
  "organization.claim_requested",
  "organization.claim_reviewed",
  "organization.invitation_created",
  "organization.invitation_accepted",
  "organization.invitation_revoked",
  "place.created",
  "place.updated",
  "place.deleted",
  "profile.created",
  "profile.updated",
  "profile.deleted",
  "profile.claim_requested",
  "profile.claim_reviewed",
  "profile.invitation_created",
  "profile.invitation_accepted",
  "profile.invitation_revoked",
  "region.created",
  "region.updated",
  "region.deleted",
  "site_setting.updated",
].map((value) => ({ value, label: auditActionLabel(value) }));

const targetTypeOptions = Object.entries(targetTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

type FilterValues = {
  action?: string;
  targetType?: string;
  createdFrom?: string;
  createdTo?: string;
};

const toQuery = (values: FilterValues, current: number): AuditLogQuery => ({
  current,
  pageSize: 20,
  action: values.action?.trim() || undefined,
  targetType: values.targetType || undefined,
  createdFrom: values.createdFrom,
  createdTo: values.createdTo,
});

export default function AdminAuditLogPage() {
  const [filters, setFilters] = useState<FilterValues>({});
  const [current, setCurrent] = useState(1);

  const { data, error, isLoading } = useSWR<List<AuditLog>, unknown>(
    ["admin-audit-logs", filters, current],
    async () => AdminAuditLogApi.list(toQuery(filters, current)),
  );

  return (
    <div className="space-y-4">
      <DefaultContainer className="sticky top-0 z-20">
        <Typography.Title level={3} className="m-0">
          审计日志
        </Typography.Title>
      </DefaultContainer>
      {!!error && <Alert type="error" title={apiErrorMessage(error)} />}
      <Table
        rowKey="id"
        tableLayout="auto"
        loading={isLoading}
        dataSource={data?.records ?? []}
        onChange={(_pagination, values, _sorter, extra) => {
          if (extra.action !== "filter") return;
          setFilters({
            action: (values.action?.[0] as string | undefined)?.trim() || undefined,
            targetType: values.targetType?.[0] as string | undefined,
            createdFrom: values.createdAt?.[0] as string | undefined,
            createdTo: values.createdAt?.[1] as string | undefined,
          });
          setCurrent(1);
        }}
        pagination={{
          current,
          pageSize: 20,
          total: data?.total,
          onChange: setCurrent,
          showSizeChanger: false,
        }}
        columns={[
          {
            title: "对象",
            key: "targetType",
            filteredValue: filters.targetType ? [filters.targetType] : null,
            filterDropdown: (props) => (
              <TableSelectFilterDropdown
                {...props}
                options={targetTypeOptions}
                placeholder="选择对象"
              />
            ),
            render: (_, v) => targetTypeLabels[v.targetType] ?? v.targetType,
          },
          {
            title: "操作",
            key: "action",
            filteredValue: filters.action ? [filters.action] : null,
            filterDropdown: (props) => (
              <TableSelectFilterDropdown
                {...props}
                options={actionOptions}
                placeholder="选择操作"
              />
            ),
            render: (_, v) => auditActionLabel(v.action),
          },
          {
            title: "操作者",
            render: (_, v) => v.actor?.name ?? v.actor?.email ?? "系统",
          },
          { title: "IP", render: (_, v) => v.ipAddress ?? "-" },
          {
            title: "操作时间",
            key: "createdAt",
            filteredValue:
              filters.createdFrom && filters.createdTo
                ? [filters.createdFrom, filters.createdTo]
                : null,
            filterDropdown: (props) => <TableDateRangeFilterDropdown {...props} />,
            render: (_, v) => new Date(v.createdAt).toLocaleString("zh-CN"),
          },
        ]}
        expandable={{
          expandedRowRender: (v) => (
            <Descriptions
              column={1}
              items={[
                { key: "action", label: "action", children: auditActionLabel(v.action) },
                ...(v.targetId
                  ? [{ key: "targetId", label: "targetId", children: v.targetId }]
                  : []),
                ...(v.requestId
                  ? [{ key: "requestId", label: "requestId", children: v.requestId }]
                  : []),
                ...Object.entries(v.metadata).map(([label, value]) => ({
                  key: label,
                  label,
                  children:
                    typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value as string | number | boolean | null),
                })),
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
