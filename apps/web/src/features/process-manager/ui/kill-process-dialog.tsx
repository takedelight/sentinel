"use client";

import { Button } from "@sentinel/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sentinel/ui/components/dialog";
import { toast } from "@sentinel/ui/components/toast";
import { CircleStop, Loader2, Skull } from "lucide-react";
import { useState } from "react";

import type { ProcessInfo } from "@/shared/mock/types";

import { PROCESS_STATE_LABEL } from "@/entities/process/model";
import { formatMb, formatPercent } from "@/shared/lib/format";
import { killProcess, type KillSignal } from "@/shared/mock/simulator";

interface KillProcessDialogProps {
  deviceId: string;
  process: ProcessInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KillProcessDialog({
  deviceId,
  process,
  open,
  onOpenChange,
}: KillProcessDialogProps) {
  const [pending, setPending] = useState<KillSignal | null>(null);

  async function handleKill(signal: KillSignal) {
    if (!process || pending) return;

    setPending(signal);
    const outcome = await killProcess(deviceId, process.pid, signal);
    setPending(null);

    if (outcome.ok) {
      toast.add({
        type: "success",
        title: "Процес завершено",
        description: `${process.name} · PID ${process.pid} · ${signal}`,
      });
      onOpenChange(false);
      return;
    }

    if (outcome.reason === "ignored") {
      toast.add({
        type: "warning",
        title: "SIGTERM проігноровано",
        description: `${process.name} (PID ${process.pid}) не відповів на сигнал. Спробуйте SIGKILL.`,
      });
      return;
    }

    toast.add({
      type: "error",
      title: "Процес не знайдено",
      description: `PID ${process.pid} вже завершився.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Завершити процес?</DialogTitle>
          <DialogDescription>
            {process ? `${process.name} · PID ${process.pid} · ${process.user}` : ""}
          </DialogDescription>
        </DialogHeader>

        {process ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/40 p-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">ЦП</div>
                <div className="mt-1 font-mono text-sm tabular-nums">
                  {formatPercent(process.cpu)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Пам’ять</div>
                <div className="mt-1 font-mono text-sm tabular-nums">{formatMb(process.ramMb)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Стан</div>
                <div className="mt-1 text-sm">{PROCESS_STATE_LABEL[process.state]}</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="text-foreground">SIGTERM</span> — коректне завершення: процес встигне
              зберегти дані. <span className="text-foreground">SIGKILL</span> — примусове завершення
              без можливості збереження.
            </p>
          </div>
        ) : null}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="outline"
            className="w-full"
            disabled={pending !== null || !process}
            onClick={() => void handleKill("SIGTERM")}
          >
            {pending === "SIGTERM" ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <CircleStop aria-hidden="true" />
            )}
            Надіслати SIGTERM
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            disabled={pending !== null || !process}
            onClick={() => void handleKill("SIGKILL")}
          >
            {pending === "SIGKILL" ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Skull aria-hidden="true" />
            )}
            Надіслати SIGKILL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
