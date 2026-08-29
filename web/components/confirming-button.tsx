"use client";

import { useEffect, useState } from "react";

/**
 * Two-step destructive action: first click arms the button (label switches
 * to the confirm text), second click within 4s executes. Replaces the
 * browser's window.confirm dialogs.
 */
export function ConfirmingButton({
  label,
  confirmLabel,
  className,
  onConfirm,
  disabled = false,
}: {
  label: string;
  confirmLabel: string;
  className: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      onClick={async () => {
        if (!armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        await onConfirm();
      }}
    >
      {armed ? `⚠ ${confirmLabel}` : label}
    </button>
  );
}
