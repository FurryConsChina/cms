import { useEffect, useRef } from "react";
import { Modal } from "antd";
import { useBeforeUnload, useBlocker } from "react-router";

export default function useUnsavedChangesGuard({ dirty, busy }: { dirty: boolean; busy: boolean }) {
  const allowedDestination = useRef<string | null>(null);
  const blocker = useBlocker(({ nextLocation }) => {
    if (
      allowedDestination.current ===
      `${nextLocation.pathname}${nextLocation.search}${nextLocation.hash}`
    ) {
      return false;
    }
    return busy || dirty;
  });

  useEffect(() => {
    if (busy && blocker.state === "blocked") blocker.reset();
  }, [busy, blocker]);

  useBeforeUnload((event) => {
    if (busy || dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  return {
    allowNavigation: (destination: string) => {
      allowedDestination.current = destination;
    },
    clearAllowedNavigation: () => {
      allowedDestination.current = null;
    },
    confirmationModal: (
      <Modal
        title="放弃未保存的修改？"
        open={blocker.state === "blocked" && !busy}
        okText="放弃"
        cancelText="继续编辑"
        okButtonProps={{ danger: true, disabled: busy }}
        onCancel={() => {
          if (blocker.state === "blocked") blocker.reset();
        }}
        onOk={() => {
          if (!busy && blocker.state === "blocked") blocker.proceed();
        }}
      >
        未保存的修改将会丢失。
      </Modal>
    ),
  };
}
