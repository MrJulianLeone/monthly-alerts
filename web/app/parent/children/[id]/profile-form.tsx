"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ErrorText, Field, Input, Select } from "@/components/ui";

export function ChildProfileForm({
  childId,
  initial,
}: {
  childId: string;
  initial: { displayName: string; goal: string; weightKg: string; heightCm: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [key]: e.target.value });
    setSaved(false);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/parent/children/${childId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.displayName,
        goal: form.goal || undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not save");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="Name">
        <Input required value={form.displayName} onChange={set("displayName")} />
      </Field>
      <Field label="Goal">
        <Select value={form.goal} onChange={set("goal")}>
          <option value="">Not set</option>
          <option value="get_fit">Get fit</option>
          <option value="build_strength">Build strength</option>
          <option value="lose_weight">Lose weight</option>
          <option value="build_habits">Build habits</option>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight (kg)">
          <Input type="number" min={20} max={400} value={form.weightKg} onChange={set("weightKg")} />
        </Field>
        <Field label="Height (cm)">
          <Input type="number" min={80} max={260} value={form.heightCm} onChange={set("heightCm")} />
        </Field>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save changes"}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </form>
  );
}
