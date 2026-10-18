"use client";

import { useEffect, useState } from "react";

export function useFakeLoading(minMs = 450, maxMs = 850): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(
      () => setLoading(false),
      minMs + Math.random() * Math.max(0, maxMs - minMs),
    );

    return () => clearTimeout(timeout);
  }, [minMs, maxMs]);

  return loading;
}
