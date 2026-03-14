"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, useCallback } from "react";

const REFRESH_INTERVAL = 30;

export default function AutoRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
    setCountdown(REFRESH_INTERVAL);
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refresh();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refresh]);

  return (
    <span className="text-xs text-gray-500 ml-3 inline-flex items-center gap-1.5">
      {isPending ? (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Updating…
        </>
      ) : (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          {countdown}s
        </>
      )}
    </span>
  );
}
