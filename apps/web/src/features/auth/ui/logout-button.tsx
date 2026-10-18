"use client";

import { Button } from "@sentinel/ui/components/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "../model";

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Вийти"
      className="text-muted-foreground hover:text-foreground"
      onClick={() => {
        logout();
        router.replace("/login");
      }}
    >
      <LogOut />
    </Button>
  );
}
