"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { ftInToCm, lbToKg } from "@/lib/units";

export function ParentSetupForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "invalid" | "ready">("loading");
  const [parentEmail, setParentEmail] = useState("");
  const [parentHasAccount, setParentHasAccount] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    parentPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    goal: "",
    weightLb: "",
    heightFt: "",
    heightIn: "",
  });

  useEffect(() => {
    fetch(`/api/onboarding/parent-invite/${token}`)
      .then(async (res) => {
        if (!res.ok) return setState("invalid");
        const data = await res.json();
        setParentEmail(data.parentEmail);
        setParentHasAccount(Boolean(data.parentHasAccount));
        setState("ready");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/onboarding/parent-invite/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentPassword: form.parentPassword,
        child: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email,
          password: form.password,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender || null,
          goal: form.goal || null,
          weightKg: form.weightLb ? lbToKg(Number(form.weightLb)) : null,
          heightCm:
            form.heightFt || form.heightIn
              ? ftInToCm(Number(form.heightFt || 0), Number(form.heightIn || 0))
              : null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Something went wrong");
      return;
    }
    router.push("/parent");
    router.refresh();
  }

  if (state === "loading") {
    return <Card>Checking your setup link...</Card>;
  }
  if (state === "invalid") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">Link expired</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This setup link is invalid or has expired. Ask your child to restart onboarding
          in the app to send a fresh one.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-xl font-semibold text-neutral-900">Set up your child&apos;s coach</h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        MonthlyAlerts gives your child daily meal and exercise guidance and sends you a
        monthly progress summary. Complete their profile and set login credentials below.
        Your parent account: <span className="font-medium text-neutral-900">{parentEmail}</span>
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {parentHasAccount ? (
          <p className="rounded-lg bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600">
            You already have a MonthlyAlerts account — no new account or password needed.
            Your existing login gains parent dashboard access when you finish this setup.
          </p>
        ) : (
          <Field label="Create your parent-account password (8+ characters)">
            <Input
              type="password"
              required
              minLength={8}
              value={form.parentPassword}
              onChange={set("parentPassword")}
            />
          </Field>
        )}
        <hr className="border-neutral-200" />
        <p className="text-sm font-semibold text-neutral-900">Child profile</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Child's first name">
            <Input required value={form.firstName} onChange={set("firstName")} />
          </Field>
          <Field label="Child's last name">
            <Input required value={form.lastName} onChange={set("lastName")} />
          </Field>
        </div>
        <Field label="Child's login email">
          <Input type="email" required value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Child's password (8+ characters)">
          <Input type="password" required minLength={8} value={form.password} onChange={set("password")} />
        </Field>
        <Field label="Date of birth (must be 11–15)">
          <Input type="date" required value={form.dateOfBirth} onChange={set("dateOfBirth")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gender">
            <Select value={form.gender} onChange={set("gender")}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Goal">
            <Select value={form.goal} onChange={set("goal")}>
              <option value="">Choose...</option>
              <option value="get_fit">Get fit</option>
              <option value="build_strength">Build strength</option>
              <option value="lose_weight">Lose weight</option>
              <option value="build_habits">Build habits</option>
            </Select>
          </Field>
        </div>
        <Field label="Weight (lbs, optional)">
          <Input type="number" min={45} max={880} value={form.weightLb} onChange={set("weightLb")} placeholder="100" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (ft, optional)">
            <Input type="number" min={2} max={8} value={form.heightFt} onChange={set("heightFt")} placeholder="5" />
          </Field>
          <Field label="Height (in, optional)">
            <Input type="number" min={0} max={11} value={form.heightIn} onChange={set("heightIn")} placeholder="2" />
          </Field>
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Creating accounts..." : "Approve & create accounts"}
        </Button>
        <p className="text-center text-xs text-neutral-400">
          The first 30 days are completely free.
        </p>
      </form>
    </Card>
  );
}
