"use client";

import { Button } from "@sentinel/ui/components/button";
import { Input } from "@sentinel/ui/components/input";
import { Label } from "@sentinel/ui/components/label";
import { toast } from "@sentinel/ui/components/toast";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "../model";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Введіть коректну електронну пошту");
      return;
    }

    if (password.length === 0) {
      setError("Введіть пароль");
      return;
    }

    setError(null);
    setPending(true);

    const session = await login(trimmedEmail);

    toast.add({
      type: "success",
      title: `Вітаємо, ${session.name}!`,
      description: "Ви увійшли в панель моніторингу.",
    });

    router.replace("/dashboard");
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Електронна пошта</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@sentinel.local"
          value={email}
          disabled={pending}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          disabled={pending}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <LogIn aria-hidden="true" />
        )}
        {pending ? "Входимо…" : "Увійти"}
      </Button>
    </form>
  );
}
