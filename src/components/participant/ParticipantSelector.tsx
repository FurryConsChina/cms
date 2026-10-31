import { Button, Flex, Select, Typography, type SelectProps } from "antd";
import useSWRInfinite from "swr/infinite";
import { ParticipantAPI } from "@/api/cms/participant";
import type { Participant } from "@/types/participant";
import type { List } from "@/types/request";
import { apiErrorMessage } from "@/utils/apiError";

interface ParticipantSelectorProps {
  id?: string;
  value?: string | null;
  onChange?: (value?: string) => void;
  antdSelectProps?: SelectProps;
}

export default function ParticipantSelector({
  id,
  value,
  onChange,
  antdSelectProps,
}: ParticipantSelectorProps) {
  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite<
    List<Participant>,
    Error
  >(
    (index, previousPage: List<Participant> | null) => {
      if (
        previousPage &&
        (previousPage.records.length === 0 || index * 100 >= previousPage.total)
      ) {
        return null;
      }
      return ["participant-selector", index + 1];
    },
    ([, page]: [string, number]) => ParticipantAPI.list({ current: page, pageSize: 100 }),
  );
  const participants = data?.flatMap((page) => page.records) ?? [];
  const loadingMore = isLoading || (!!data && !data[size - 1]);
  const hasMore = participants.length < (data?.[0]?.total ?? 0);
  const loadMore = () => {
    if (hasMore && !loadingMore && !isValidating && !error) {
      void setSize(size + 1).catch(() => {});
    }
  };

  return (
    <Select
      allowClear
      placeholder="筛选已加载的参加记录"
      {...antdSelectProps}
      id={id}
      value={value}
      onChange={(id: string | undefined) => onChange?.(id)}
      showSearch={{ optionFilterProp: "label" }}
      loading={isValidating || loadingMore}
      status={error ? "error" : antdSelectProps?.status}
      options={participants.map((participant) => ({
        value: participant.id,
        label: `${participant.profile?.name || participant.organization?.name || "参加者"}${participant.booth ? ` · ${participant.booth}` : ""}`,
      }))}
      notFoundContent={
        error ? "参加记录加载失败" : loadingMore ? "加载中…" : "没有匹配的已加载记录"
      }
      onPopupScroll={(event) => {
        const target = event.currentTarget;
        if (target.scrollHeight - target.scrollTop - target.clientHeight < 24) loadMore();
      }}
      popupRender={(menu) => (
        <>
          {menu}
          {error ? (
            <Flex
              className="p-2"
              align="center"
              justify="space-between"
              gap={8}
              onMouseDown={(event) => event.preventDefault()}
            >
              <Typography.Text type="danger">{apiErrorMessage(error)}</Typography.Text>
              <Button
                size="small"
                loading={isValidating}
                onClick={() => void mutate().catch(() => {})}
              >
                重试
              </Button>
            </Flex>
          ) : hasMore ? (
            <Button
              type="text"
              block
              loading={loadingMore || isValidating}
              onMouseDown={(event) => event.preventDefault()}
              onClick={loadMore}
            >
              加载更多
            </Button>
          ) : null}
        </>
      )}
    />
  );
}
