"use client";

import { useState } from "react";

/** Live Gmail connection check + optional test send, for the setup page. */
export function SetupCheck({ envReady }: { envReady: boolean }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  async function check(sendTest: boolean) {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/prospects/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ send_test: sendTest }),
      });
      const data = await res.json();
      if (data.error) {
        setOk(false);
        setResult(data.error);
      } else {
        setOk(true);
        setResult(
          `Connected as ${data.mailbox}.` +
            (data.testSent ? " Test email sent to your admin address — check inbox vs spam, and the SPF/DKIM/DMARC headers." : "")
        );
      }
    } catch {
      setOk(false);
      setResult("Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sheet p-5">
      <p className="text-sm mb-3">
        Environment variables:{" "}
        {envReady ? (
          <span className="chip text-ink">present</span>
        ) : (
          <span className="chip text-accent-deep">missing</span>
        )}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" disabled={busy || !envReady} className="btn btn-primary btn-sm" onClick={() => check(false)}>
          {busy ? "Checking…" : "Check connection"}
        </button>
        <button type="button" disabled={busy || !envReady} className="btn btn-ghost btn-sm" onClick={() => check(true)}>
          Send test email
        </button>
      </div>
      {result && (
        <p className={`text-sm mt-3 ${ok ? "text-ink-soft" : "text-red-700"} break-all`}>{result}</p>
      )}
    </div>
  );
}
