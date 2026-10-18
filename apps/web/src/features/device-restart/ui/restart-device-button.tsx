"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@sentinel/ui/components/alert-dialog";
import { Button } from "@sentinel/ui/components/button";
import { toast } from "@sentinel/ui/components/toast";
import { RotateCcw } from "lucide-react";
import { useState } from "react";

import type { Device } from "@/shared/mock/types";

import { rebootDevice, useRebooting } from "@/shared/mock/simulator";

export function RestartDeviceButton({ device }: { device: Device }) {
  const [open, setOpen] = useState(false);
  const rebooting = useRebooting(device.id);
  const disabled = rebooting || device.status === "offline";

  function handleRestart() {
    setOpen(false);

    if (!rebootDevice(device.id)) {
      return;
    }

    toast.add({
      type: "info",
      title: `Перезавантаження ${device.name} розпочато`,
      description: "Вузол повернеться в мережу за кілька секунд.",
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" disabled={disabled} />}>
        <RotateCcw aria-hidden="true" />
        {rebooting ? "Перезавантаження…" : "Перезавантажити"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Перезавантажити {device.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Вузол стане недоступним на кілька секунд, активні процеси завершаться, аптайм скинеться.
            Подію буде записано в журнал.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Скасувати</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestart}>Перезавантажити</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
