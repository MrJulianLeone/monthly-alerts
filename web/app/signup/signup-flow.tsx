"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { ftInToCm, lbToKg } from "@/lib/units";

type Step = "start" | "under16" | "under16-sent" | "profile";

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
  const [step, setStep] = useState<Step>("start");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [form, setForm] = useState({
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

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  function continueFromStart(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const age = ageFromDob(form.dateOfBirth);
    if (isNaN(age) || age < 0 || age > 120) {
      setError("Please check the date of birth");
      return;
    }
    setStep(age < 16 ? "under16" : "profile");
  }

  async function sendParentInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/onboarding/parent-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentEmail }),
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

  if (step === "start") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">Let&apos;s get started</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Tell us your name and birthday so we can set up the right kind of account.
        </p>
        <form onSubmit={continueFromStart} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input required value={form.firstName} onChange={set("firstName")} placeholder="Alex" />
            </Field>
            <Field label="Last name">
              <Input required value={form.lastName} onChange={set("lastName")} placeholder="Smith" />
            </Field>
          </div>
          <Field label="Date of birth">
            <Input type="date" required value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </Card>
    );
  }

  if (step === "under16") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">A parent sets you up</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Since you&apos;re under 16, a parent creates your account. Enter your parent&apos;s
          email — they&apos;ll receive a secure link to create your account, complete your
          profile, and set your login.
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
        Create your account{form.firstName ? `, ${form.firstName}` : ""}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Quick profile — your coach uses this to personalize your challenges.
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
          {busy ? "Creating account..." : "Start my free month"}
        </Button>
      </form>
    </Card>
  );
}
