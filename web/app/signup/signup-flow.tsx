"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";

type Step = "identity" | "too-young" | "under16" | "under16-sent" | "profile";

function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identity");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    gender: "",
    goal: "",
    weightKg: "",
    heightCm: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  // The system routes based on the entered birthday — no age question asked.
  function routeByAge(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const age = ageFromDob(dateOfBirth);
    if (age < 0 || age > 120) {
      setError("Please check the date of birth");
      return;
    }
    if (age < 11) setStep("too-young");
    else if (age < 16) setStep("under16");
    else setStep("profile");
  }

  async function sendParentInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/onboarding/parent-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentEmail, childName: name, childDob: dateOfBirth }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Something went wrong");
      return;
    }
    setStep("under16-sent");
  }

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: name,
        email: form.email,
        password: form.password,
        dateOfBirth,
        gender: form.gender || null,
        goal: form.goal || null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
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

  if (step === "identity") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">Let&apos;s get started</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Tell us your name and birthday — your coach uses this to personalize everything.
        </p>
        <form onSubmit={routeByAge} className="mt-6 space-y-4">
          <Field label="Your name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
          </Field>
          <Field label="Your birthday">
            <Input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="w-full" disabled={!name.trim() || !dateOfBirth}>
            Continue
          </Button>
        </form>
      </Card>
    );
  }

  if (step === "too-young") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">See you soon</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          MonthlyAlerts supports ages 11 and up. We&apos;d love to be your coach when you&apos;re
          a little older.
        </p>
      </Card>
    );
  }

  if (step === "under16") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">
          Almost there, {name.trim().split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Since you&apos;re under 16, a parent finishes your setup. Enter their email — they&apos;ll
          get a secure link, and we&apos;ll keep your name and birthday on file.
        </p>
        <form onSubmit={sendParentInvite} className="mt-6 space-y-4">
          <Field label="Parent's email">
            <Input
              type="email"
              required
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@example.com"
            />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Sending..." : "Send setup email"}
          </Button>
        </form>
      </Card>
    );
  }

  if (step === "under16-sent") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">Email sent</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          We sent a setup email to <span className="font-medium text-neutral-900">{parentEmail}</span>.
          Once your parent completes setup, you can log in with the credentials they create
          and start chatting with your coach.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-xl font-semibold text-neutral-900">
        Welcome, {name.trim().split(" ")[0]}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Create your login and add a few optional details for better coaching.
      </p>
      <form onSubmit={signup} className="mt-6 space-y-4">
        <Field label="Email">
          <Input type="email" required value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Password (8+ characters)">
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
          {busy ? "Creating account..." : "Start my free month"}
        </Button>
      </form>
    </Card>
  );
}
