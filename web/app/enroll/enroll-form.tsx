"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { ftInToCm, lbToKg } from "@/lib/units";

export function EnrollForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    goal: "",
    weightLb: "",
    heightFt: "",
    heightIn: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function enroll(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/profile/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender || null,
        goal: form.goal || null,
        weightKg: form.weightLb ? lbToKg(Number(form.weightLb)) : null,
        heightCm:
          form.heightFt || form.heightIn
            ? ftInToCm(Number(form.heightFt || 0), Number(form.heightIn || 0))
            : null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Something went wrong");
      return;
    }
    router.push("/me");
    router.refresh();
  }

  return (
    <Card>
      <h1 className="text-xl font-semibold text-neutral-900">Start your own coaching</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Use MonthlyAlerts yourself — daily meal and exercise guidance plus your own monthly
        progress summary. Your parent dashboard stays exactly as it is. First 30 days free.
      </p>
      <form onSubmit={enroll} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input required value={form.firstName} onChange={set("firstName")} />
          </Field>
          <Field label="Last name">
            <Input required value={form.lastName} onChange={set("lastName")} />
          </Field>
        </div>
        <Field label="Date of birth">
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
          <Input type="number" min={45} max={880} value={form.weightLb} onChange={set("weightLb")} placeholder="150" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (ft, optional)">
            <Input type="number" min={2} max={8} value={form.heightFt} onChange={set("heightFt")} placeholder="5" />
          </Field>
          <Field label="Height (in, optional)">
            <Input type="number" min={0} max={11} value={form.heightIn} onChange={set("heightIn")} placeholder="10" />
          </Field>
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Setting up..." : "Start my free month"}
        </Button>
      </form>
    </Card>
  );
}
