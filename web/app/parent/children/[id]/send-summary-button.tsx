"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function SendSummaryButton({ childId }: { childId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");

  async function send() {
    setState("busy");
    const res = await fetch(`/api/parent/children/${childId}/send-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setState(res.ok ? "sent" : "error");
    if (res.ok) router.refresh();
  }

  return (
    <Button variant="secondary" onClick={send} disabled={state === "busy"}>
      {state === "busy"
        ? "Generating..."
        : state === "sent"
          ? "Summary emailed"
          : state === "error"
            ? "Failed — retry"
            : "Email summary now"}
    </Button>
  );
}
