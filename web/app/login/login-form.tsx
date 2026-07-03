"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Login failed");
      return;
    }
    const { role } = await res.json();
    router.push(role === "admin" ? "/admin" : role === "parent" ? "/parent" : "/chat");
    router.refresh();
  }

  return (
    <Card>
      <h1 className="text-xl font-semibold text-neutral-900">Welcome back</h1>
      <form onSubmit={login} className="mt-6 space-y-4">
        <Field label="Email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Signing in..." : "Log in"}
        </Button>
        <p className="text-center text-sm text-neutral-500">
          New here?{" "}
          <Link href="/signup" className="font-medium text-neutral-900 underline">
            Get started
          </Link>
        </p>
      </form>
    </Card>
  );
}
