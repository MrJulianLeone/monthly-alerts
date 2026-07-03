"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";

export function ParentSetupForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "invalid" | "ready">("loading");
  const [parentEmail, setParentEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    parentName: "",
    parentDob: "",
    parentPassword: "",
    childName: "",
    childDob: "",
    email: "",
    password: "",
    gender: "",
    goal: "",
    weightKg: "",
    heightCm: "",
  });

  useEffect(() => {
    fetch(`/api/onboarding/parent-invite/${token}`)
      .then(async (res) => {
        if (!res.ok) return setState("invalid");
        const data = await res.json();
        setParentEmail(data.parentEmail);
        // The child's name and birthday were entered during onboarding.
        setForm((f) => ({
          ...f,
          childName: data.childName ?? "",
          childDob: data.childDob ?? "",
        }));
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
        parent: {
          name: form.parentName,
          dateOfBirth: form.parentDob,
          password: form.parentPassword,
        },
        child: {
          displayName: form.childName,
          dateOfBirth: form.childDob,
          email: form.email,
          password: form.password,
          gender: form.gender || null,
          goal: form.goal || null,
          weightKg: form.weightKg ? Number(form.weightKg) : null,
          heightCm: form.heightCm ? Number(form.heightCm) : null,
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

  const childFirstName = form.childName.trim().split(" ")[0] || "your child";

  return (
    <Card>
      <h1 className="text-xl font-semibold text-neutral-900">
        Set up {childFirstName}&apos;s coach
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        MonthlyAlerts gives {childFirstName} daily meal and exercise guidance and sends you a
        monthly progress summary. {childFirstName}&apos;s name and birthday are already on file
        from onboarding. Your parent account:{" "}
        <span className="font-medium text-neutral-900">{parentEmail}</span>
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <p className="text-sm font-semibold text-neutral-900">About you</p>
        <Field label="Your name">
          <Input required value={form.parentName} onChange={set("parentName")} />
        </Field>
        <Field label="Your birthday">
          <Input type="date" required value={form.parentDob} onChange={set("parentDob")} />
        </Field>
        <Field label="Your password (8+ characters)">
          <Input
            type="password"
            required
            minLength={8}
            value={form.parentPassword}
            onChange={set("parentPassword")}
          />
        </Field>
        <hr className="border-neutral-200" />
        <p className="text-sm font-semibold text-neutral-900">Your child</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Child's name">
            <Input required value={form.childName} onChange={set("childName")} />
          </Field>
          <Field label="Child's birthday">
            <Input type="date" required value={form.childDob} onChange={set("childDob")} />
          </Field>
        </div>
        <Field label="Child's login email">
          <Input type="email" required value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Child's password (8+ characters)">
          <Input type="password" required minLength={8} value={form.password} onChange={set("password")} />
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Weight (kg, optional)">
            <Input type="number" min={20} max={400} value={form.weightKg} onChange={set("weightKg")} />
          </Field>
          <Field label="Height (cm, optional)">
            <Input type="number" min={80} max={260} value={form.heightCm} onChange={set("heightCm")} />
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
