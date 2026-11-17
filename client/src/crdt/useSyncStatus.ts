import { useEffect, useState } from "react";
import { provider, type SyncStatus } from "./sync";

// Re-render whenever the connection to the server changes.
// The provider emits "status" events: connecting → connected → disconnected...
export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(
    provider.wsconnected ? "connected" : "connecting"
  );

  useEffect(() => {
    const onStatus = (e: { status: SyncStatus }) => setStatus(e.status);
    provider.on("status", onStatus);
    return () => provider.off("status", onStatus);
  }, []);

  return status;
}
