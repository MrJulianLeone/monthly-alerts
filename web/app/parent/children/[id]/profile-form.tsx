"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ErrorText, Field, Input, Select } from "@/components/ui";
import { ftInToCm, lbToKg } from "@/lib/units";

export function ChildProfileForm({
  childId,
  initial,
}: {
  childId: string;
  initial: { displayName: string; goal: string; weightLb: string; heightFt: string; heightIn: string };
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
        weightKg: form.weightLb ? lbToKg(Number(form.weightLb)) : undefined,
        heightCm:
          form.heightFt || form.heightIn
            ? ftInToCm(Number(form.heightFt || 0), Number(form.heightIn || 0))
            : undefined,
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
      <Field label="Weight (lbs)">
        <Input type="number" min={45} max={880} value={form.weightLb} onChange={set("weightLb")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (ft)">
          <Input type="number" min={2} max={8} value={form.heightFt} onChange={set("heightFt")} />
        </Field>
        <Field label="Height (in)">
          <Input type="number" min={0} max={11} value={form.heightIn} onChange={set("heightIn")} />
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
