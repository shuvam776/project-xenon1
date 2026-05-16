"use client";

import { useEffect, useRef } from "react";

const HEARTBEAT_INTERVAL = 30; // seconds

/**
 * Invisible component that tracks active time on the website.
 * Sends a heartbeat every 30 seconds while the tab is visible.
 * Only tracks time when the user is authenticated.
 */
export default function TimeTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const sendHeartbeat = async () => {
      if (!isVisibleRef.current) return;

      try {
        await fetch("/api/user/track-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ seconds: HEARTBEAT_INTERVAL }),
        });
      } catch {
        // Silently ignore — user may not be logged in
      }
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start heartbeat
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL * 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null; // Invisible component
}
