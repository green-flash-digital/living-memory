import { useEffect, useState } from "react";
import { tryFetch } from "@living-memory/utils";
import type { Status } from "@living-memory/device-agent/types";

/**
 * Custom hook that polls the device agent status endpoint at a specified interval.
 *
 * @returns The current device status, or null if not yet loaded or if an error occurred
 */
export function useStatus(pollInterval: number = 5000) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    async function loadStatus() {
      const result = await tryFetch<Status>("/status");
      if (result.success) {
        setStatus(result.data);
      } else {
        console.error("Failed to load status:", result.error);
        setStatus(null);
      }
    }

    // Load immediately
    loadStatus();

    // Then poll every pollInterval milliseconds
    const interval = setInterval(loadStatus, pollInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [pollInterval]);

  return status;
}
