"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type ServerActionResult = { ok: true } | { ok: false; error: string };

type Options<T> = {
  action: () => Promise<T>;
  onSuccess?: (result: Extract<T, { ok: true }>) => void;
  refresh?: boolean;
  errorMessage?: string;
};

export function useServerAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run<T extends ServerActionResult>({
    action,
    onSuccess,
    refresh = true,
    errorMessage = "The action could not be completed. Please try again.",
  }: Options<T>) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onSuccess?.(result as Extract<T, { ok: true }>);
        if (refresh) router.refresh();
      } catch (cause) {
        console.error("Server action failed", cause);
        setError(errorMessage);
      }
    });
  }

  return { pending, error, run, setError };
}
