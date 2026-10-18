import { useCallback, useRef, useState } from "react";

export default function useMediaBusy() {
  const pending = useRef(new Set<string>());
  const [busy, setBusy] = useState(false);
  const onBusyChange = useCallback((key: string, next: boolean) => {
    if (next) pending.current.add(key);
    else pending.current.delete(key);
    setBusy(pending.current.size > 0);
  }, []);
  return { busy, onBusyChange };
}
