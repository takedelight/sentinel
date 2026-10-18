import type { ProcessState } from "@/shared/mock/types";

export const PROCESS_STATE_LABEL: Record<ProcessState, string> = {
  running: "виконується",
  sleeping: "очікує",
  zombie: "зомбі",
};
