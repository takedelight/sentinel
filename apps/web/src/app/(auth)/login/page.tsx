"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sentinel/ui/components/card";
import { Spinner } from "@sentinel/ui/components/spinner";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/features/auth/model";
import { LoginForm } from "@/features/auth/ui/login-form";

export default function LoginPage() {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && session) {
      router.replace("/dashboard");
    }
  }, [ready, session, router]);

  if (!ready || session) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial from-sky-400/15 to-transparent"
      />
      <Card className="relative w-full max-w-sm">
        <CardHeader className="justify-items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Sentinel</CardTitle>
          <CardDescription>Панель моніторингу серверних вузлів</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LoginForm />
          <p className="text-center text-xs text-muted-foreground">
            Демо-режим · підійдуть будь-які облікові дані
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
